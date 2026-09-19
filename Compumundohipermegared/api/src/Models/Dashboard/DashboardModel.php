<?php
namespace App\Models\Dashboard;

use PDO;

class DashboardModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function activities(): array {
        $stmt = $this->db->query(
            'SELECT id, name, slug, image_url
             FROM activities
             ORDER BY id ASC'
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function classesByDay(int $dayOfWeek, int $userId): array {
        $stmt = $this->db->prepare(
            'SELECT
                cs.id,
                cs.start_time,
                cs.duration_minutes,
                cs.capacity,
                cs.professor_name,
                a.name AS activity_name,
                (SELECT COUNT(*) FROM enrollments e WHERE e.class_session_id = cs.id) AS enrolled_count,
                EXISTS(
                    SELECT 1 FROM enrollments e2
                    WHERE e2.class_session_id = cs.id AND e2.user_id = :user_id
                ) AS is_enrolled
             FROM class_sessions cs
             INNER JOIN activities a ON a.id = cs.activity_id
             WHERE cs.day_of_week = :day
             ORDER BY cs.start_time ASC'
        );
        $stmt->execute([
            ':day' => $dayOfWeek,
            ':user_id' => $userId,
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function enroll(int $userId, int $sessionId): array {
        $sessionStmt = $this->db->prepare(
            'SELECT id, capacity FROM class_sessions WHERE id = :id LIMIT 1'
        );
        $sessionStmt->execute([':id' => $sessionId]);
        $session = $sessionStmt->fetch(PDO::FETCH_ASSOC);
        if (!$session) {
            return ['ok' => false, 'code' => 404, 'message' => 'La clase no existe.'];
        }

        $existsStmt = $this->db->prepare(
            'SELECT 1 FROM enrollments WHERE user_id = :user_id AND class_session_id = :session_id'
        );
        $existsStmt->execute([
            ':user_id' => $userId,
            ':session_id' => $sessionId,
        ]);
        if ($existsStmt->fetchColumn()) {
            return ['ok' => false, 'code' => 409, 'message' => 'Ya estás anotado en esta clase.'];
        }

        $countStmt = $this->db->prepare(
            'SELECT COUNT(*) FROM enrollments WHERE class_session_id = :session_id'
        );
        $countStmt->execute([':session_id' => $sessionId]);
        $enrolled = (int) $countStmt->fetchColumn();
        if ($enrolled >= (int) $session['capacity']) {
            return ['ok' => false, 'code' => 409, 'message' => 'No hay cupos disponibles.'];
        }

        $insert = $this->db->prepare(
            'INSERT INTO enrollments (user_id, class_session_id) VALUES (:user_id, :session_id)'
        );
        $insert->execute([
            ':user_id' => $userId,
            ':session_id' => $sessionId,
        ]);

        return ['ok' => true, 'message' => 'Te anotaste correctamente.'];
    }

    public function unenroll(int $userId, int $sessionId): array {
        $existsStmt = $this->db->prepare(
            'SELECT 1 FROM enrollments WHERE user_id = :user_id AND class_session_id = :session_id'
        );
        $existsStmt->execute([
            ':user_id' => $userId,
            ':session_id' => $sessionId,
        ]);
        if (!$existsStmt->fetchColumn()) {
            return ['ok' => false, 'code' => 404, 'message' => 'No estás anotado en esta clase.'];
        }

        $delete = $this->db->prepare(
            'DELETE FROM enrollments WHERE user_id = :user_id AND class_session_id = :session_id'
        );
        $delete->execute([
            ':user_id' => $userId,
            ':session_id' => $sessionId,
        ]);

        return ['ok' => true, 'message' => 'Te desanotaste correctamente.'];
    }
}
