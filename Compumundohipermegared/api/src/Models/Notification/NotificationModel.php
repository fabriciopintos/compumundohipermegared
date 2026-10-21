<?php
namespace App\Models\Notification;

use PDO;

class NotificationModel {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function create(int $userId, string $type, string $title, string $body, ?string $link = null, ?array $meta = null): int {
        $stmt = $this->db->prepare(
            'INSERT INTO notifications (user_id, type, title, body, link, meta_json)
             VALUES (:user_id, :type, :title, :body, :link, :meta_json)'
        );
        $stmt->execute([
            ':user_id' => $userId,
            ':type' => $type,
            ':title' => $title,
            ':body' => $body,
            ':link' => $link,
            ':meta_json' => $meta ? json_encode($meta, JSON_UNESCAPED_UNICODE) : null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function createMany(array $rows): void {
        if (!count($rows)) {
            return;
        }
        $stmt = $this->db->prepare(
            'INSERT INTO notifications (user_id, type, title, body, link, meta_json)
             VALUES (:user_id, :type, :title, :body, :link, :meta_json)'
        );
        foreach ($rows as $row) {
            $stmt->execute([
                ':user_id' => (int) $row['user_id'],
                ':type' => $row['type'],
                ':title' => $row['title'],
                ':body' => $row['body'],
                ':link' => $row['link'] ?? null,
                ':meta_json' => !empty($row['meta'])
                    ? json_encode($row['meta'], JSON_UNESCAPED_UNICODE)
                    : null,
            ]);
        }
    }

    public function listForUser(int $userId, int $limit = 50): array {
        $limit = max(1, min(100, $limit));
        $stmt = $this->db->prepare(
            'SELECT id, type, title, body, link, meta_json, read_at, created_at
             FROM notifications
             WHERE user_id = :user_id
             ORDER BY created_at DESC, id DESC
             LIMIT ' . $limit
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function unreadCount(int $userId): int {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND read_at IS NULL'
        );
        $stmt->execute([':user_id' => $userId]);
        return (int) $stmt->fetchColumn();
    }

    public function markRead(int $userId, int $id): bool {
        $stmt = $this->db->prepare(
            'UPDATE notifications
             SET read_at = CURRENT_TIMESTAMP
             WHERE id = :id AND user_id = :user_id AND read_at IS NULL'
        );
        $stmt->execute([':id' => $id, ':user_id' => $userId]);
        return $stmt->rowCount() > 0;
    }

    public function markAllRead(int $userId): int {
        $stmt = $this->db->prepare(
            'UPDATE notifications
             SET read_at = CURRENT_TIMESTAMP
             WHERE user_id = :user_id AND read_at IS NULL'
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->rowCount();
    }
}
