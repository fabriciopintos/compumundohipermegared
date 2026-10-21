<?php
namespace App\Controllers;

use App\Models\Notification\NotificationModel;
use App\Utils\JsonResponse;
use App\Utils\RequestAuth;

class NotificationController {
    private $model;

    public function __construct($db) {
        $this->model = new NotificationModel($db);
    }

    public function index() {
        $userId = RequestAuth::userId();
        $rows = $this->model->listForUser($userId);
        $notifications = array_map([$this, 'map'], $rows);
        JsonResponse::ok([
            'notifications' => $notifications,
            'unreadCount' => $this->model->unreadCount($userId),
        ]);
    }

    public function read($id) {
        $userId = RequestAuth::userId();
        $notificationId = (int) $id;
        if ($notificationId <= 0) {
            JsonResponse::error('Notificación inválida.', 422);
        }
        $this->model->markRead($userId, $notificationId);
        JsonResponse::ok([
            'unreadCount' => $this->model->unreadCount($userId),
        ], 'Notificación leída');
    }

    public function readAll() {
        $userId = RequestAuth::userId();
        $this->model->markAllRead($userId);
        JsonResponse::ok(['unreadCount' => 0], 'Notificaciones leídas');
    }

    private function map(array $row): array {
        $meta = null;
        if (!empty($row['meta_json'])) {
            $decoded = json_decode($row['meta_json'], true);
            if (is_array($decoded)) {
                $meta = $decoded;
            }
        }
        return [
            'id' => (int) $row['id'],
            'type' => $row['type'],
            'title' => $row['title'],
            'body' => $row['body'] ?? '',
            'link' => $row['link'] ?? null,
            'meta' => $meta,
            'isRead' => !empty($row['read_at']),
            'createdAt' => $row['created_at'],
        ];
    }
}
