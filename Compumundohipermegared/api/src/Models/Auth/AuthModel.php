<?php
namespace App\Models\Auth;

use PDO;

class AuthModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function findByLogin(string $login): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, password_hash, role, created_at, updated_at
             FROM users
             WHERE LOWER(email) = LOWER(:login) OR LOWER(name) = LOWER(:login2)
             LIMIT 1'
        );
        $stmt->execute([
            ':login' => $login,
            ':login2' => $login,
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, role, created_at, updated_at
             FROM users
             WHERE id = :id
             LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function recordLogin(int $userId): void {
        $stmt = $this->db->prepare('INSERT INTO login_events (user_id) VALUES (:user_id)');
        $stmt->execute([':user_id' => $userId]);
    }

    public function recordAttempt(string $ip): void {
        $stmt = $this->db->prepare('INSERT INTO login_attempts (ip) VALUES (:ip)');
        $stmt->execute([':ip' => $ip]);
    }

    public function tooManyAttempts(string $ip, int $max = 8, int $minutes = 15): bool {
        $minutes = max(1, min(120, $minutes));
        $stmt = $this->db->prepare(
            "SELECT COUNT(*)
             FROM login_attempts
             WHERE ip = :ip
               AND attempted_at >= DATE_SUB(NOW(), INTERVAL {$minutes} MINUTE)"
        );
        $stmt->execute([
            ':ip' => $ip,
        ]);
        return (int) $stmt->fetchColumn() >= $max;
    }

    public function weeklyLoginCount(int $userId): int {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*)
             FROM login_events
             WHERE user_id = :user_id
               AND logged_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)'
        );
        $stmt->execute([':user_id' => $userId]);
        return (int) $stmt->fetchColumn();
    }

    public function enrolledActivitiesCount(int $userId): int {
        $stmt = $this->db->prepare(
            'SELECT COUNT(DISTINCT cs.activity_id)
             FROM enrollments e
             INNER JOIN class_sessions cs ON cs.id = e.class_session_id
             WHERE e.user_id = :user_id'
        );
        $stmt->execute([':user_id' => $userId]);
        return (int) $stmt->fetchColumn();
    }
}
