<?php
namespace App\Utils;

class JsonResponse {
    public static function send(array $payload, int $status = 200): void {
        http_response_code($status);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function ok(array $data = [], string $message = 'ok', int $status = 200): void {
        self::send([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function error(string $message, int $status = 400): void {
        self::send([
            'status' => 'error',
            'message' => $message,
        ], $status);
    }
}
