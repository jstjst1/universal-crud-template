<?php
// config/database.php
class Database {
    private $host = 'localhost';
    private $port = '3306';
    private $db_name = 'universal_crud';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    public $conn;

    public function __construct() {
        // Load environment variables if .env file exists
        if (file_exists(__DIR__ . '/../.env')) {
            $env = parse_ini_file(__DIR__ . '/../.env');
            $this->host = $env['DB_HOST'] ?? $this->host;
            $this->port = $env['DB_PORT'] ?? $this->port;
            $this->db_name = $env['DB_NAME'] ?? $this->db_name;
            $this->username = $env['DB_USER'] ?? $this->username;
            $this->password = $env['DB_PASSWORD'] ?? $this->password;
        }
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset={$this->charset}";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception("Database connection failed");
        }
        return $this->conn;
    }

    public function closeConnection() {
        $this->conn = null;
    }
}
?>
