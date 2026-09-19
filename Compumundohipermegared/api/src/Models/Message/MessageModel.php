<?php
namespace App\Models\Message;

use PDO;

class MessageModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function findUserById(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, role FROM users WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function listContacts(string $myRole, int $myId): array {
        if ($myRole === 'admin') {
            $role = 'entrenador';
        } elseif ($myRole === 'usuario') {
            $role = 'entrenador';
        } elseif ($myRole === 'entrenador') {
            // Entrenador habla con admin y alumnos
            $stmt = $this->db->prepare(
                "SELECT id, name, email, role
                 FROM users
                 WHERE id <> :me AND role IN ('admin', 'usuario')
                 ORDER BY
                   CASE role WHEN 'admin' THEN 0 ELSE 1 END,
                   name ASC"
            );
            $stmt->execute([':me' => $myId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            return [];
        }

        $stmt = $this->db->prepare(
            'SELECT id, name, email, role
             FROM users
             WHERE role = :role AND id <> :me
             ORDER BY name ASC'
        );
        $stmt->execute([':role' => $role, ':me' => $myId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function pairAllowed(string $roleA, string $roleB): bool {
        $pair = [$roleA, $roleB];
        sort($pair);
        $key = implode(':', $pair);
        return in_array($key, [
            'admin:entrenador',
            'entrenador:usuario',
        ], true);
    }

    public function findOrCreateConversation(int $userA, int $userB): array {
        $low = min($userA, $userB);
        $high = max($userA, $userB);

        $stmt = $this->db->prepare(
            'SELECT id, user_low_id, user_high_id, created_at, updated_at
             FROM conversations
             WHERE user_low_id = :low AND user_high_id = :high
             LIMIT 1'
        );
        $stmt->execute([':low' => $low, ':high' => $high]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($existing) {
            return $existing;
        }

        $insert = $this->db->prepare(
            'INSERT INTO conversations (user_low_id, user_high_id)
             VALUES (:low, :high)'
        );
        $insert->execute([':low' => $low, ':high' => $high]);
        $id = (int) $this->db->lastInsertId();
        $created = $this->getConversation($id);
        return $created ?: [
            'id' => $id,
            'user_low_id' => $low,
            'user_high_id' => $high,
            'created_at' => null,
            'updated_at' => null,
        ];
    }

    public function getConversation(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, user_low_id, user_high_id, created_at, updated_at
             FROM conversations WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function isParticipant(array $conversation, int $userId): bool {
        return (int) $conversation['user_low_id'] === $userId
            || (int) $conversation['user_high_id'] === $userId;
    }

    public function peerId(array $conversation, int $userId): int {
        return (int) $conversation['user_low_id'] === $userId
            ? (int) $conversation['user_high_id']
            : (int) $conversation['user_low_id'];
    }

    public function listConversations(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT
                c.id,
                c.updated_at,
                peer.id AS peer_id,
                peer.name AS peer_name,
                peer.email AS peer_email,
                peer.role AS peer_role,
                (
                  SELECT m.body FROM messages m
                  WHERE m.conversation_id = c.id
                  ORDER BY m.created_at DESC, m.id DESC
                  LIMIT 1
                ) AS last_message,
                (
                  SELECT m.created_at FROM messages m
                  WHERE m.conversation_id = c.id
                  ORDER BY m.created_at DESC, m.id DESC
                  LIMIT 1
                ) AS last_message_at,
                (
                  SELECT COUNT(*) FROM messages m
                  WHERE m.conversation_id = c.id
                    AND m.sender_id <> :me
                    AND m.read_at IS NULL
                ) AS unread_count
             FROM conversations c
             INNER JOIN users peer ON peer.id = CASE
                 WHEN c.user_low_id = :me2 THEN c.user_high_id
                 ELSE c.user_low_id
             END
             WHERE c.user_low_id = :me3 OR c.user_high_id = :me4
             ORDER BY COALESCE(
               (SELECT m.created_at FROM messages m
                WHERE m.conversation_id = c.id
                ORDER BY m.created_at DESC LIMIT 1),
               c.updated_at
             ) DESC"
        );
        $stmt->execute([
            ':me' => $userId,
            ':me2' => $userId,
            ':me3' => $userId,
            ':me4' => $userId,
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function listMessages(int $conversationId, int $limit = 100): array {
        $stmt = $this->db->prepare(
            'SELECT id, conversation_id, sender_id, body, created_at, read_at
             FROM messages
             WHERE conversation_id = :cid
             ORDER BY created_at ASC, id ASC
             LIMIT :lim'
        );
        $stmt->bindValue(':cid', $conversationId, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addMessage(int $conversationId, int $senderId, string $body): array {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                'INSERT INTO messages (conversation_id, sender_id, body)
                 VALUES (:cid, :sid, :body)'
            );
            $stmt->execute([
                ':cid' => $conversationId,
                ':sid' => $senderId,
                ':body' => $body,
            ]);
            $messageId = (int) $this->db->lastInsertId();
            $fetch = $this->db->prepare(
                'SELECT id, conversation_id, sender_id, body, created_at, read_at
                 FROM messages WHERE id = :id LIMIT 1'
            );
            $fetch->execute([':id' => $messageId]);
            $message = $fetch->fetch(PDO::FETCH_ASSOC);

            $upd = $this->db->prepare(
                'UPDATE conversations SET updated_at = NOW() WHERE id = :cid'
            );
            $upd->execute([':cid' => $conversationId]);

            $this->db->commit();
            return $message;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function markRead(int $conversationId, int $readerId): int {
        $stmt = $this->db->prepare(
            'UPDATE messages
             SET read_at = NOW()
             WHERE conversation_id = :cid
               AND sender_id <> :reader
               AND read_at IS NULL'
        );
        $stmt->execute([
            ':cid' => $conversationId,
            ':reader' => $readerId,
        ]);
        return $stmt->rowCount();
    }
}
