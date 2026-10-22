<?php
namespace App\Models\Auth;

use PDO;

class AuthModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function findByLogin(string $login): ?array {
        // Solo por email (name no es único y genera login ambiguo).
        $stmt = $this->db->prepare(
            'SELECT id, name, email, password_hash, role, created_at, updated_at
             FROM users
             WHERE LOWER(email) = LOWER(:login)
             LIMIT 1'
        );
        $stmt->execute([':login' => $login]);
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

    public function emailTakenByOther(string $email, int $userId): bool {
        $stmt = $this->db->prepare(
            'SELECT id FROM users WHERE LOWER(email) = LOWER(:email) AND id <> :id LIMIT 1'
        );
        $stmt->execute([':email' => $email, ':id' => $userId]);
        return (bool) $stmt->fetchColumn();
    }

    public function updateProfile(int $userId, string $name, string $email): bool {
        $stmt = $this->db->prepare(
            'UPDATE users
             SET name = :name,
                 email = :email,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        );
        $stmt->execute([
            ':id' => $userId,
            ':name' => $name,
            ':email' => $email,
        ]);
        return $stmt->rowCount() >= 0;
    }

    public function findAuthById(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, password_hash, role
             FROM users WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function updatePassword(int $userId, string $passwordHash): bool {
        $stmt = $this->db->prepare(
            'UPDATE users
             SET password_hash = :password_hash,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        );
        $stmt->execute([
            ':id' => $userId,
            ':password_hash' => $passwordHash,
        ]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Borra la cuenta de forma definitiva (y datos relacionados).
     * Verifica que el usuario ya no exista al finalizar.
     */
    public function deleteAccount(int $userId): bool {
        if ($userId <= 0) {
            return false;
        }

        try {
            $this->db->beginTransaction();

            // Limpieza explícita por si alguna FK no tiene CASCADE en DBs antiguas.
            $this->safeExec('DELETE FROM enrollments WHERE user_id = :id', $userId);
            $this->safeExec('DELETE FROM login_events WHERE user_id = :id', $userId);
            $this->safeExec('DELETE FROM notifications WHERE user_id = :id', $userId);
            $this->safeExec('DELETE FROM routine_assignments WHERE user_id = :id', $userId);
            $this->safeExec('UPDATE routines SET created_by = NULL WHERE created_by = :id', $userId);
            $this->safeExec('UPDATE routine_assignments SET assigned_by = NULL WHERE assigned_by = :id', $userId);
            $this->safeExec('DELETE FROM messages WHERE sender_id = :id', $userId);
            try {
                $stmtConv = $this->db->prepare(
                    'DELETE FROM conversations WHERE user_low_id = :id1 OR user_high_id = :id2'
                );
                $stmtConv->execute([':id1' => $userId, ':id2' => $userId]);
            } catch (\PDOException $err) {
                $sqlState = isset($err->errorInfo[0]) ? (string) $err->errorInfo[0] : (string) $err->getCode();
                if ($sqlState !== '42S02' && $sqlState !== '42S22') {
                    throw $err;
                }
            }

            $stmt = $this->db->prepare('DELETE FROM users WHERE id = :id');
            $stmt->execute([':id' => $userId]);
            if ($stmt->rowCount() < 1) {
                $this->db->rollBack();
                return false;
            }

            $this->db->commit();
        } catch (\Throwable $err) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log('deleteAccount failed: ' . $err->getMessage());
            return false;
        }

        return $this->findById($userId) === null;
    }

    private function safeExec(string $sql, int $userId): void {
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $userId]);
        } catch (\PDOException $err) {
            // Solo ignorar tabla/columna inexistente (migraciones viejas).
            $code = (string) $err->getCode();
            $sqlState = isset($err->errorInfo[0]) ? (string) $err->errorInfo[0] : $code;
            if ($sqlState === '42S02' || $sqlState === '42S22') {
                error_log('deleteAccount cleanup skipped (missing schema): ' . $err->getMessage());
                return;
            }
            throw $err;
        }
    }
}
