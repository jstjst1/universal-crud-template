<?php
// config/cors.php
class CORS {
    public static function handleCORS() {
        // Allow from any origin
        if (isset($_SERVER['HTTP_ORIGIN'])) {
            $allowed_origins = [
                'http://localhost:3000',
                'http://localhost:4200',
                'http://localhost:8080',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:4200',
                'http://127.0.0.1:8080'
            ];
            
            if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
                header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
            }
        }

        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        // Access-Control headers are received during OPTIONS requests
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
                header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
                header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

            exit(0);
        }
    }
}

// Handle CORS for all requests
CORS::handleCORS();
?>
