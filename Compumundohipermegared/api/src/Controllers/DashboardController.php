<?php
namespace App\Controllers;

use App\Models\Dashboard\DashboardModel;
use App\Utils\JsonResponse;
use App\Utils\RequestAuth;

class DashboardController {
    private $model;

    public function __construct($db) {
        $this->model = new DashboardModel($db);
    }

    public function activities() {
        RequestAuth::userId();
        $rows = $this->model->activities();
        $activities = array_map(static function ($row) {
            return [
                'id' => (int) $row['id'],
                'name' => $row['name'],
                'slug' => $row['slug'],
                'imageUrl' => $row['image_url'],
            ];
        }, $rows);

        JsonResponse::ok(['activities' => $activities]);
    }

    public function classes() {
        $userId = RequestAuth::userId();
        $dayLabel = strtoupper(trim((string) ($_GET['day'] ?? 'LUN')));
        $map = ['LUN' => 1, 'MAR' => 2, 'MIE' => 3, 'JUE' => 4, 'VIE' => 5, 'SAB' => 6, 'DOM' => 7];
        if (!isset($map[$dayLabel])) {
            JsonResponse::error('Día inválido.', 422);
        }

        $rows = $this->model->classesByDay($map[$dayLabel], $userId);
        $classes = array_map(static function ($row) {
            $time = substr((string) $row['start_time'], 0, 5);
            $minutes = (int) ($row['duration_minutes'] ?? 60);
            $hoursLabel = ($minutes % 60 === 0)
                ? ((int) ($minutes / 60)) . 'h'
                : $minutes . 'min';
            return [
                'id' => (int) $row['id'],
                'name' => $row['activity_name'],
                'time' => $time,
                'duration' => $hoursLabel,
                'capacity' => (int) $row['capacity'],
                'enrolledCount' => (int) $row['enrolled_count'],
                'professor' => $row['professor_name'],
                'isEnrolled' => (bool) $row['is_enrolled'],
            ];
        }, $rows);

        JsonResponse::ok(['classes' => $classes]);
    }

    public function enroll() {
        $userId = RequestAuth::userId();
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '{}', true);
        if (!is_array($data)) {
            $data = [];
        }

        $sessionId = (int) ($data['classSessionId'] ?? $data['id'] ?? 0);
        if ($sessionId <= 0) {
            JsonResponse::error('Seleccioná una clase válida.', 422);
        }

        $result = $this->model->enroll($userId, $sessionId);
        if (!$result['ok']) {
            JsonResponse::error($result['message'], $result['code']);
        }

        JsonResponse::ok([], $result['message']);
    }

    public function unenroll() {
        $userId = RequestAuth::userId();
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '{}', true);
        if (!is_array($data)) {
            $data = [];
        }

        $sessionId = (int) ($data['classSessionId'] ?? $data['id'] ?? $_GET['classSessionId'] ?? $_GET['id'] ?? 0);
        if ($sessionId <= 0) {
            JsonResponse::error('Seleccioná una clase válida.', 422);
        }

        $result = $this->model->unenroll($userId, $sessionId);
        if (!$result['ok']) {
            JsonResponse::error($result['message'], $result['code']);
        }

        JsonResponse::ok([], $result['message']);
    }
}
