<?php
// index.php
header('Content-Type: application/json');
require_once 'config/cors.php';
require_once 'config/database.php';
require_once 'utils/jwt.php';

// Simple router
$request_method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/php-crud', '', $path); // Remove base path for XAMPP

// Remove leading slash
$path = ltrim($path, '/');

// Split path into segments
$path_segments = explode('/', $path);

// Initialize response
$response = [
    'success' => false,
    'message' => 'Endpoint not found'
];
$status_code = 404;

try {
    // Health check
    if ($path === 'health' && $request_method === 'GET') {
        $response = [
            'status' => 'OK',
            'timestamp' => date('c'),
            'database' => 'mysql'
        ];
        $status_code = 200;
    }
    // Authentication routes
    elseif ($path_segments[0] === 'api' && $path_segments[1] === 'auth') {
        switch ($path_segments[2] ?? '') {
            case 'register':
                if ($request_method === 'POST') {
                    $result = handleRegister();
                    $response = $result['response'];
                    $status_code = $result['status'];
                }
                break;
            case 'login':
                if ($request_method === 'POST') {
                    $result = handleLogin();
                    $response = $result['response'];
                    $status_code = $result['status'];
                }
                break;
            case 'verify':
                if ($request_method === 'GET') {
                    $result = handleVerifyToken();
                    $response = $result['response'];
                    $status_code = $result['status'];
                }
                break;
        }
    }
    // Products routes
    elseif ($path_segments[0] === 'api' && $path_segments[1] === 'products') {
        if ($request_method === 'GET' && !isset($path_segments[2])) {
            $result = handleGetProducts();
            $response = $result['response'];
            $status_code = $result['status'];
        }
        elseif ($request_method === 'GET' && isset($path_segments[2])) {
            $result = handleGetProduct($path_segments[2]);
            $response = $result['response'];
            $status_code = $result['status'];
        }
        elseif ($request_method === 'POST' && !isset($path_segments[2])) {
            $result = handleCreateProduct();
            $response = $result['response'];
            $status_code = $result['status'];
        }
    }
    // Categories routes
    elseif ($path_segments[0] === 'api' && $path_segments[1] === 'categories') {
        if ($request_method === 'GET' && !isset($path_segments[2])) {
            $result = handleGetCategories();
            $response = $result['response'];
            $status_code = $result['status'];
        }
    }

} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    $status_code = 500;
    error_log("API Error: " . $e->getMessage());
}

// Send response
http_response_code($status_code);
echo json_encode($response);

// Authentication functions
function handleRegister() {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            return [
                'response' => ['success' => false, 'message' => 'No data provided'],
                'status' => 400
            ];
        }

        $username = trim($data['username'] ?? '');
        $email = trim(strtolower($data['email'] ?? ''));
        $password = $data['password'] ?? '';
        $first_name = trim($data['first_name'] ?? '');
        $last_name = trim($data['last_name'] ?? '');

        // Validation
        $errors = [];
        if (!$username || !preg_match('/^[a-zA-Z0-9_]{3,50}$/', $username)) {
            $errors[] = 'Username must be 3-50 characters and contain only letters, numbers, and underscores';
        }
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Please provide a valid email address';
        }
        if (!$password || strlen($password) < 6) {
            $errors[] = 'Password must be at least 6 characters long';
        }

        if (!empty($errors)) {
            return [
                'response' => ['success' => false, 'message' => 'Validation failed', 'errors' => $errors],
                'status' => 400
            ];
        }

        $database = new Database();
        $conn = $database->getConnection();

        // Check if user exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        
        if ($stmt->fetch()) {
            return [
                'response' => ['success' => false, 'message' => 'User with this username or email already exists'],
                'status' => 409
            ];
        }

        // Create user
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$username, $email, $password_hash, $first_name ?: null, $last_name ?: null]);
        
        $user_id = $conn->lastInsertId();

        // Generate token
        $jwt = new JWTHandler();
        $token = $jwt->generateToken($user_id, $username, 'user');

        // Get created user
        $stmt = $conn->prepare("SELECT id, username, email, first_name, last_name, role FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        return [
            'response' => [
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ],
            'status' => 201
        ];

    } catch (Exception $e) {
        return [
            'response' => ['success' => false, 'message' => $e->getMessage()],
            'status' => 500
        ];
    }
}

function handleLogin() {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            return [
                'response' => ['success' => false, 'message' => 'No data provided'],
                'status' => 400
            ];
        }

        $username_or_email = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

        if (!$username_or_email || !$password) {
            return [
                'response' => ['success' => false, 'message' => 'Username and password are required'],
                'status' => 400
            ];
        }

        $database = new Database();
        $conn = $database->getConnection();

        // Find user
        $stmt = $conn->prepare("SELECT id, username, email, password, first_name, last_name, role FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username_or_email, $username_or_email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            return [
                'response' => ['success' => false, 'message' => 'Invalid credentials'],
                'status' => 401
            ];
        }

        // Generate token
        $jwt = new JWTHandler();
        $token = $jwt->generateToken($user['id'], $user['username'], $user['role']);

        // Remove password from response
        unset($user['password']);

        return [
            'response' => [
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ],
            'status' => 200
        ];

    } catch (Exception $e) {
        return [
            'response' => ['success' => false, 'message' => $e->getMessage()],
            'status' => 500
        ];
    }
}

function handleVerifyToken() {
    try {
        $jwt = new JWTHandler();
        $token = $jwt->getTokenFromHeader();

        if (!$token) {
            return [
                'response' => ['success' => false, 'message' => 'No token provided'],
                'status' => 401
            ];
        }

        $decoded = $jwt->validateToken($token);
        if (!$decoded) {
            return [
                'response' => ['success' => false, 'message' => 'Invalid token'],
                'status' => 401
            ];
        }

        $database = new Database();
        $conn = $database->getConnection();

        $stmt = $conn->prepare("SELECT id, username, email, first_name, last_name, role FROM users WHERE id = ?");
        $stmt->execute([$decoded['userId']]);
        $user = $stmt->fetch();

        if (!$user) {
            return [
                'response' => ['success' => false, 'message' => 'User not found'],
                'status' => 401
            ];
        }

        return [
            'response' => [
                'success' => true,
                'data' => [
                    'user' => $user
                ]
            ],
            'status' => 200
        ];

    } catch (Exception $e) {
        return [
            'response' => ['success' => false, 'message' => $e->getMessage()],
            'status' => 500
        ];
    }
}

// Product functions
function handleGetProducts() {
    try {
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(100, max(1, intval($_GET['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;
        $category_id = $_GET['category_id'] ?? null;
        $status = $_GET['status'] ?? 'active';
        $search = trim($_GET['search'] ?? '');

        $database = new Database();
        $conn = $database->getConnection();

        // Build where conditions
        $where_conditions = [];
        $params = [];

        if ($category_id) {
            $where_conditions[] = "p.category_id = ?";
            $params[] = $category_id;
        }

        if ($status) {
            $where_conditions[] = "p.status = ?";
            $params[] = $status;
        }

        if ($search) {
            $where_conditions[] = "(p.name LIKE ? OR p.description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $where_clause = empty($where_conditions) ? '' : 'WHERE ' . implode(' AND ', $where_conditions);

        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM products p $where_clause";
        $stmt = $conn->prepare($count_query);
        $stmt->execute($params);
        $total = $stmt->fetch()['total'];

        // Get products
        $products_query = "
            SELECT p.id, p.name, p.description, p.price, p.quantity, p.category_id,
                   c.name as category_name, p.image_url, p.status, p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            $where_clause
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        ";

        $stmt = $conn->prepare($products_query);
        $stmt->execute(array_merge($params, [$limit, $offset]));
        $products = $stmt->fetchAll();

        $total_pages = ceil($total / $limit);

        return [
            'response' => [
                'success' => true,
                'data' => [
                    'products' => $products,
                    'pagination' => [
                        'current_page' => $page,
                        'total_pages' => $total_pages,
                        'total_items' => $total,
                        'items_per_page' => $limit,
                        'has_next' => $page < $total_pages,
                        'has_prev' => $page > 1
                    ]
                ]
            ],
            'status' => 200
        ];

    } catch (Exception $e) {
        return [
            'response' => ['success' => false, 'message' => $e->getMessage()],
            'status' => 500
        ];
    }
}

function handleGetProduct($product_id) {
    try {
        $database = new Database();
        $conn = $database->getConnection();

        $stmt = $conn->prepare("
            SELECT p.id, p.name, p.description, p.price, p.quantity, p.category_id,
                   c.name as category_name, p.image_url, p.status, p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        ");
        $stmt->execute([$product_id]);
        $product = $stmt->fetch();

        if (!$product) {
            return [
                'response' => ['success' => false, 'message' => 'Product not found'],
                'status' => 404
            ];
        }

        return [
            'response' => [
                'success' => true,
                'data' => [
                    'product' => $product
                ]
            ],
            'status' => 200
        ];

    } catch (Exception $e) {
        return [
            'response' => ['success' => false, 'message' => $e->getMessage()],
            'status' => 500
        ];
    }
}

function handleCreateProduct() {
    try {
        // Verify authentication
        $jwt = new JWTHandler();
        $token = $jwt->getTokenFromHeader();

        if (!$token || !$jwt->validateToken($token)) {
            return [
                'response' => ['success' => false, 'message' => 'Authentication required'],
                'status' => 401
            ];
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            return [
                'response' => ['success' => false, 'message' => 'No data provided'],
                'status' => 400
            ];
        }

        $name = trim($data['name'] ?? '');
        $description = trim($data['description'] ?? '');
        $price = $data['price'] ?? null;
        $quantity = intval($data['quantity'] ?? 0);
        $category_id = $data['category_id'] ?? null;
        $image_url = trim($data['image_url'] ?? '');

        // Validation
        $errors = [];
        if (!$name || strlen($name) > 100) {
            $errors[] = 'Product name is required and must be less than 100 characters';
        }
        if ($price === null || floatval($price) < 0) {
            $errors[] = 'Price must be a positive number';
        }
        if ($quantity < 0) {
            $errors[] = 'Quantity must be non-negative';
        }

        if (!empty($errors)) {
            return [
                'response' => ['success' => false, 'message' => 'Validation failed', 'errors' => $errors],
                'status' => 400
            ];
        }

        $database = new Database();
        $conn = $database->getConnection();

        // Verify category exists if provided
        if ($category_id) {
            $stmt = $conn->prepare("SELECT id FROM categories WHERE id = ?");
            $stmt->execute([$category_id]);
            if (!$stmt->fetch()) {
                return [
                    'response' => ['success' => false, 'message' => 'Category not found'],
                    'status' => 400
                ];
            }
        }

        // Insert product
        $stmt = $conn->prepare("
            INSERT INTO products (name, description, price, quantity, category_id, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $name,
            $description ?: null,
            floatval($price),
            $quantity,
            $category_id,
            $image_url ?: null
        ]);

        $product_id = $conn->lastInsertId();

        // Get created product
        $stmt = $conn->prepare("
            SELECT p.id, p.name, p.description, p.price, p.quantity, p.category_id,
                   c.name as category_name, p.image_url, p.status, p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        ");
        $stmt->execute([$product_id]);
        $product = $stmt->fetch();

        return [
            'response' => [
                'success' => true,
                'message' => 'Product created successfully',
                'data' => [
                    'product' => $product
                ]
            ],
            'status' => 201
        ];

    } catch (Exception $e) {
        return [
            'response' => ['success' => false, 'message' => $e->getMessage()],
            'status' => 500
        ];
    }
}

function handleGetCategories() {
    try {
        $database = new Database();
        $conn = $database->getConnection();

        $stmt = $conn->prepare("
            SELECT c.id, c.name, c.description, c.created_at,
                   COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
            GROUP BY c.id, c.name, c.description, c.created_at
            ORDER BY c.name ASC
        ");
        $stmt->execute();
        $categories = $stmt->fetchAll();

        return [
            'response' => [
                'success' => true,
                'data' => [
                    'categories' => $categories
                ]
            ],
            'status' => 200
        ];

    } catch (Exception $e) {
        return [
            'response' => ['success' => false, 'message' => $e->getMessage()],
            'status' => 500
        ];
    }
}
?>
