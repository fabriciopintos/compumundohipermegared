<?php
class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->port = getenv('DB_PORT') ?: '5432';
        $this->db_name = getenv('DB_NAME') ?: '';
        $this->username = getenv('DB_USER') ?: '';
        $this->password = getenv('DB_PASSWORD') !== false && getenv('DB_PASSWORD') !== ''
            ? getenv('DB_PASSWORD')
            : (getenv('DB_PASS') ?: '');
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = sprintf(
                'pgsql:host=%s;port=%s;dbname=%s;options=--client_encoding=UTF8',
                $this->host,
                $this->port,
                $this->db_name
            );
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
        return $this->conn;
    }
}
