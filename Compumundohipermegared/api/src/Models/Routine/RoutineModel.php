<?php
namespace App\Models\Routine;

use PDO;

class RoutineModel {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function listAll(): array {
        $stmt = $this->db->query(
            'SELECT r.id, r.title, r.description, r.video_url, r.image_url, r.exercises_json,
                    r.created_by, r.created_at, r.updated_at,
                    (SELECT COUNT(*) FROM routine_assignments ra WHERE ra.routine_id = r.id) AS assigned_count
             FROM routines r
             ORDER BY r.updated_at DESC, r.id DESC'
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, title, description, video_url, image_url, exercises_json, created_by, created_at, updated_at
             FROM routines WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare(
            'INSERT INTO routines (title, description, video_url, image_url, exercises_json, created_by)
             VALUES (:title, :description, :video_url, :image_url, :exercises_json, :created_by)'
        );
        $stmt->execute([
            ':title' => $data['title'],
            ':description' => $data['description'],
            ':video_url' => $data['video_url'],
            ':image_url' => $data['image_url'],
            ':exercises_json' => $data['exercises_json'],
            ':created_by' => $data['created_by'],
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->db->prepare(
            'UPDATE routines
             SET title = :title,
                 description = :description,
                 video_url = :video_url,
                 image_url = :image_url,
                 exercises_json = :exercises_json,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        );
        $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'],
            ':description' => $data['description'],
            ':video_url' => $data['video_url'],
            ':image_url' => $data['image_url'],
            ':exercises_json' => $data['exercises_json'],
        ]);
        return $stmt->rowCount() >= 0;
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM routines WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function listStudents(): array {
        $stmt = $this->db->query(
            "SELECT u.id, u.name, u.email,
                    ra.routine_id,
                    r.title AS routine_title
             FROM users u
             LEFT JOIN routine_assignments ra ON ra.user_id = u.id
             LEFT JOIN routines r ON r.id = ra.routine_id
             WHERE u.role = 'usuario'
             ORDER BY u.name ASC"
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function assignToUsers(int $routineId, array $userIds, int $assignedBy): void {
        $this->db->beginTransaction();
        try {
            $upsert = $this->db->prepare(
                'INSERT INTO routine_assignments (routine_id, user_id, assigned_by)
                 VALUES (:routine_id, :user_id, :assigned_by)
                 ON DUPLICATE KEY UPDATE
                   routine_id = VALUES(routine_id),
                   assigned_by = VALUES(assigned_by),
                   assigned_at = CURRENT_TIMESTAMP'
            );
            foreach ($userIds as $userId) {
                $upsert->execute([
                    ':routine_id' => $routineId,
                    ':user_id' => (int) $userId,
                    ':assigned_by' => $assignedBy,
                ]);
            }
            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function assignedForUser(int $userId): ?array {
        $stmt = $this->db->prepare(
            'SELECT r.id, r.title, r.description, r.video_url, r.image_url, r.exercises_json,
                    r.created_by, r.created_at, r.updated_at
             FROM routine_assignments ra
             INNER JOIN routines r ON r.id = ra.routine_id
             WHERE ra.user_id = :user_id
             LIMIT 1'
        );
        $stmt->execute([':user_id' => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function count(): int {
        return (int) $this->db->query('SELECT COUNT(*) FROM routines')->fetchColumn();
    }
}
