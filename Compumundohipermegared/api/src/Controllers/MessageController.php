<?php
namespace App\Controllers;

use App\Models\Message\MessageModel;
use App\Utils\JsonResponse;
use App\Utils\RequestAuth;

class MessageController {
    private $model;

    public function __construct($db) {
        $this->model = new MessageModel($db);
    }

    public function contacts() {
        $auth = RequestAuth::payload();
        $myId = (int) $auth['sub'];
        $myRole = (string) ($auth['role'] ?? 'usuario');

        $rows = $this->model->listContacts($myRole, $myId);
        JsonResponse::ok([
            'contacts' => array_map([$this, 'mapUser'], $rows),
        ]);
    }

    public function conversations() {
        $auth = RequestAuth::payload();
        $myId = (int) $auth['sub'];
        $rows = $this->model->listConversations($myId);

        $list = array_map(static function ($row) {
            return [
                'id' => (int) $row['id'],
                'updatedAt' => $row['updated_at'],
                'lastMessage' => $row['last_message'],
                'lastMessageAt' => $row['last_message_at'],
                'unreadCount' => (int) $row['unread_count'],
                'peer' => [
                    'id' => (int) $row['peer_id'],
                    'name' => $row['peer_name'],
                    'email' => $row['peer_email'],
                    'role' => $row['peer_role'],
                ],
            ];
        }, $rows);

        JsonResponse::ok(['conversations' => $list]);
    }

    public function start() {
        $auth = RequestAuth::payload();
        $myId = (int) $auth['sub'];
        $myRole = (string) ($auth['role'] ?? 'usuario');
        $data = $this->readJson();
        $peerId = (int) ($data['peerUserId'] ?? 0);

        if ($peerId <= 0 || $peerId === $myId) {
            JsonResponse::error('Seleccioná un contacto válido.', 422);
        }

        $peer = $this->model->findUserById($peerId);
        if (!$peer) {
            JsonResponse::error('El contacto no existe.', 404);
        }

        $peerRole = (string) $peer['role'];
        if (!MessageModel::pairAllowed($myRole, $peerRole)) {
            JsonResponse::error('No podés iniciar una conversación con ese usuario.', 403);
        }

        $conversation = $this->model->findOrCreateConversation($myId, $peerId);
        JsonResponse::ok([
            'conversation' => [
                'id' => (int) $conversation['id'],
                'peer' => $this->mapUser($peer),
            ],
        ], 'Conversación lista', 201);
    }

    public function messages($id) {
        $auth = RequestAuth::payload();
        $myId = (int) $auth['sub'];
        $conversationId = (int) $id;

        $conversation = $this->requireParticipation($conversationId, $myId);
        $rows = $this->model->listMessages($conversationId);
        $this->model->markRead($conversationId, $myId);

        $messages = array_map(static function ($row) {
            return [
                'id' => (int) $row['id'],
                'senderId' => (int) $row['sender_id'],
                'body' => $row['body'],
                'createdAt' => $row['created_at'],
                'readAt' => $row['read_at'],
                'mine' => false,
            ];
        }, $rows);

        foreach ($messages as &$msg) {
            $msg['mine'] = $msg['senderId'] === $myId;
        }
        unset($msg);

        $peerId = $this->model->peerId($conversation, $myId);
        $peer = $this->model->findUserById($peerId);

        JsonResponse::ok([
            'conversationId' => $conversationId,
            'peer' => $peer ? $this->mapUser($peer) : null,
            'messages' => $messages,
        ]);
    }

    public function send($id) {
        $auth = RequestAuth::payload();
        $myId = (int) $auth['sub'];
        $conversationId = (int) $id;
        $this->requireParticipation($conversationId, $myId);

        $data = $this->readJson();
        $body = trim((string) ($data['body'] ?? ''));
        if ($body === '') {
            JsonResponse::error('Escribí un mensaje.', 422);
        }
        if (mb_strlen($body) > 2000) {
            JsonResponse::error('El mensaje es demasiado largo.', 422);
        }

        $row = $this->model->addMessage($conversationId, $myId, $body);
        JsonResponse::ok([
            'message' => [
                'id' => (int) $row['id'],
                'senderId' => (int) $row['sender_id'],
                'body' => $row['body'],
                'createdAt' => $row['created_at'],
                'readAt' => $row['read_at'],
                'mine' => true,
            ],
        ], 'Mensaje enviado', 201);
    }

    public function read($id) {
        $auth = RequestAuth::payload();
        $myId = (int) $auth['sub'];
        $conversationId = (int) $id;
        $this->requireParticipation($conversationId, $myId);
        $count = $this->model->markRead($conversationId, $myId);
        JsonResponse::ok(['marked' => $count]);
    }

    private function requireParticipation(int $conversationId, int $userId): array {
        if ($conversationId <= 0) {
            JsonResponse::error('Conversación inválida.', 422);
        }
        $conversation = $this->model->getConversation($conversationId);
        if (!$conversation) {
            JsonResponse::error('La conversación no existe.', 404);
        }
        if (!$this->model->isParticipant($conversation, $userId)) {
            JsonResponse::error('No tenés acceso a esta conversación.', 403);
        }
        return $conversation;
    }

    private function mapUser(array $row): array {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'role' => $row['role'],
        ];
    }

    private function readJson(): array {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '{}', true);
        return is_array($data) ? $data : [];
    }
}
