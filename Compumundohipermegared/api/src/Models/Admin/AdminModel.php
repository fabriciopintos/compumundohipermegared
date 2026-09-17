<?php
namespace App\Models\Admin;

use PDO;

class AdminModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function countByRole(string $role): int {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM users WHERE role = :role');
        $stmt->execute([':role' => $role]);
        return (int) $stmt->fetchColumn();
    }

    public function listUsers(?string $role = null, string $q = ''): array {
        $sql = 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE 1=1';
        $params = [];

        if ($role !== null && $role !== '') {
            $sql .= ' AND role = :role';
            $params[':role'] = $role;
        }

        if ($q !== '') {
            $sql .= ' AND (LOWER(name) LIKE :q OR LOWER(email) LIKE :q2)';
            $like = '%' . mb_strtolower($q) . '%';
            $params[':q'] = $like;
            $params[':q2'] = $like;
        }

        $sql .= ' ORDER BY created_at DESC, id DESC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1');
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function create(string $name, string $email, string $passwordHash, string $role): array {
        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, password_hash, role)
             VALUES (:name, :email, :password_hash, :role)
             RETURNING id, name, email, role, created_at, updated_at'
        );
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password_hash' => $passwordHash,
            ':role' => $role,
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM users WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, role, created_at FROM users WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}
