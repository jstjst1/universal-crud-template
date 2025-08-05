<?php
// utils/jwt.php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHandler {
    private $secret_key;
    private $algorithm = 'HS256';
    private $expiration_time = 86400; // 24 hours

    public function __construct() {
        $this->secret_key = $_ENV['JWT_SECRET'] ?? 'your-secret-key-change-in-production';
    }

    public function generateToken($user_id, $username, $role) {
        $issued_at = time();
        $expiration_time = $issued_at + $this->expiration_time;
        
        $payload = array(
            'iss' => 'universal-crud-api',
            'aud' => 'universal-crud-app',
            'iat' => $issued_at,
            'exp' => $expiration_time,
            'userId' => $user_id,
            'username' => $username,
            'role' => $role
        );

        return JWT::encode($payload, $this->secret_key, $this->algorithm);
    }

    public function validateToken($token) {
        try {
            $decoded = JWT::decode($token, new Key($this->secret_key, $this->algorithm));
            return (array) $decoded;
        } catch (Exception $e) {
            return false;
        }
    }

    public function getTokenFromHeader() {
        $headers = getallheaders();
        $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
}
?>
