<?php
namespace App\Controllers;

use App\Models\Notification\NotificationModel;
use App\Models\Routine\RoutineModel;
use App\Utils\JsonResponse;
use App\Utils\RequestAuth;

class RoutineController {
    private $model;
    private $notifications;

    public function __construct($db) {
        $this->model = new RoutineModel($db);
        $this->notifications = new NotificationModel($db);
    }

    public function index() {
        $payload = RequestAuth::payload();
        $role = (string) ($payload['role'] ?? '');

        if ($role === 'usuario') {
            $assigned = $this->model->assignedForUser((int) $payload['sub']);
            JsonResponse::ok([
                'routines' => $assigned ? [$this->mapRoutine($assigned)] : [],
                'assigned' => $assigned ? $this->mapRoutine($assigned) : null,
            ]);
            return;
        }

        RequestAuth::requireRole(['entrenador', 'admin']);
        $rows = $this->model->listAll();
        JsonResponse::ok([
            'routines' => array_map([$this, 'mapRoutine'], $rows),
        ]);
    }

    public function students() {
        RequestAuth::requireRole(['entrenador', 'admin']);
        $rows = $this->model->listStudents();
        $students = array_map(static function ($row) {
            return [
                'id' => (int) $row['id'],
                'name' => $row['name'],
                'email' => $row['email'],
                'routineId' => $row['routine_id'] !== null ? (int) $row['routine_id'] : null,
                'routineTitle' => $row['routine_title'] ?: null,
            ];
        }, $rows);
        JsonResponse::ok(['students' => $students]);
    }

    public function create() {
        $auth = RequestAuth::requireRole(['entrenador', 'admin']);
        $data = $this->readBody();
        $normalized = $this->normalizeRoutine($data);
        $id = $this->model->create([
            'title' => $normalized['title'],
            'description' => $normalized['description'],
            'video_url' => $normalized['videoUrl'],
            'image_url' => $normalized['imageUrl'],
            'exercises_json' => json_encode($normalized['exercises'], JSON_UNESCAPED_UNICODE),
            'created_by' => (int) $auth['sub'],
        ]);
        $row = $this->model->findById($id);
        JsonResponse::ok(['routine' => $this->mapRoutine($row)], 'Rutina creada', 201);
    }

    public function update($id) {
        RequestAuth::requireRole(['entrenador', 'admin']);
        $routineId = (int) $id;
        if ($routineId <= 0 || !$this->model->findById($routineId)) {
            JsonResponse::error('Rutina no encontrada.', 404);
        }
        $data = $this->readBody();
        $normalized = $this->normalizeRoutine($data);
        $this->model->update($routineId, [
            'title' => $normalized['title'],
            'description' => $normalized['description'],
            'video_url' => $normalized['videoUrl'],
            'image_url' => $normalized['imageUrl'],
            'exercises_json' => json_encode($normalized['exercises'], JSON_UNESCAPED_UNICODE),
        ]);
        $row = $this->model->findById($routineId);
        JsonResponse::ok(['routine' => $this->mapRoutine($row)], 'Rutina actualizada');
    }

    public function delete($id) {
        RequestAuth::requireRole(['entrenador', 'admin']);
        $routineId = (int) $id;
        if ($routineId <= 0 || !$this->model->delete($routineId)) {
            JsonResponse::error('Rutina no encontrada.', 404);
        }
        JsonResponse::ok([], 'Rutina eliminada');
    }

    public function assign($id) {
        $auth = RequestAuth::requireRole(['entrenador', 'admin']);
        $routineId = (int) $id;
        if ($routineId <= 0 || !$this->model->findById($routineId)) {
            JsonResponse::error('Rutina no encontrada.', 404);
        }

        $data = $this->readBody();
        $userIds = $data['userIds'] ?? $data['user_ids'] ?? [];
        if (!is_array($userIds) || !count($userIds)) {
            JsonResponse::error('Seleccioná al menos un alumno.', 422);
        }

        $clean = [];
        foreach ($userIds as $uid) {
            $n = (int) $uid;
            if ($n > 0) {
                $clean[$n] = $n;
            }
        }
        if (!count($clean)) {
            JsonResponse::error('Seleccioná al menos un alumno válido.', 422);
        }

        $routine = $this->model->findById($routineId);
        $this->model->assignToUsers($routineId, array_values($clean), (int) $auth['sub']);

        $title = $routine['title'] ?? 'tu rutina';
        $rows = [];
        foreach ($clean as $userId) {
            $rows[] = [
                'user_id' => (int) $userId,
                'type' => 'routine_assigned',
                'title' => 'Nueva rutina asignada',
                'body' => 'Tu entrenador te asignó la rutina “' . $title . '”. Entrá a Rutinas para verla.',
                'link' => '/rutinas',
                'meta' => [
                    'routineId' => $routineId,
                    'routineTitle' => $title,
                ],
            ];
        }
        $this->notifications->createMany($rows);

        JsonResponse::ok([], 'Rutina asignada');
    }

    private function mapRoutine(array $row): array {
        $exercises = [];
        if (!empty($row['exercises_json'])) {
            $decoded = json_decode($row['exercises_json'], true);
            if (is_array($decoded)) {
                $exercises = $decoded;
            }
        }
        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'description' => $row['description'] ?? '',
            'videoUrl' => $row['video_url'] ?? '',
            'imageUrl' => $row['image_url'] ?? '',
            'exercises' => $exercises,
            'assignedCount' => isset($row['assigned_count']) ? (int) $row['assigned_count'] : null,
            'createdBy' => isset($row['created_by']) ? (int) $row['created_by'] : null,
            'updatedAt' => $row['updated_at'] ?? null,
        ];
    }

    private function normalizeRoutine(array $data): array {
        $title = trim((string) ($data['title'] ?? ''));
        if ($title === '') {
            JsonResponse::error('El título de la rutina es obligatorio.', 422);
        }
        if (mb_strlen($title) > 120) {
            JsonResponse::error('El título es demasiado largo.', 422);
        }

        $description = trim((string) ($data['description'] ?? ''));
        if (mb_strlen($description) > 500) {
            $description = mb_substr($description, 0, 500);
        }

        $videoUrl = trim((string) ($data['videoUrl'] ?? $data['video_url'] ?? ''));
        $imageUrl = trim((string) ($data['imageUrl'] ?? $data['image_url'] ?? ''));
        if ($imageUrl === '') {
            $imageUrl = '/imagenes/Rectangle%203.png';
        }

        $rawExercises = $data['exercises'] ?? [];
        if (!is_array($rawExercises)) {
            JsonResponse::error('Los ejercicios deben ser una lista.', 422);
        }

        $exercises = [];
        foreach ($rawExercises as $item) {
            if (!is_array($item)) {
                continue;
            }
            $name = trim((string) ($item['name'] ?? ''));
            if ($name === '') {
                continue;
            }
            $exercises[] = [
                'name' => mb_substr($name, 0, 120),
                'detail' => mb_substr(trim((string) ($item['detail'] ?? '')), 0, 80),
                'rest' => mb_substr(trim((string) ($item['rest'] ?? '')), 0, 40),
            ];
        }
        if (!count($exercises)) {
            JsonResponse::error('Agregá al menos un ejercicio.', 422);
        }

        return [
            'title' => $title,
            'description' => $description,
            'videoUrl' => $videoUrl !== '' ? $videoUrl : null,
            'imageUrl' => $imageUrl,
            'exercises' => $exercises,
        ];
    }

    private function readBody(): array {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '{}', true);
        return is_array($data) ? $data : [];
    }
}
