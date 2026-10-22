<?php
namespace App\Utils;

use PDO;

class RequestAuth {
    /** @var PDO|null */
    private static $db = null;

    public static function setDb(PDO $db): void {
        self::$db = $db;
    }

    public static function userId(): int {
        $payload = self::payload();
        return (int) $payload['sub'];
    }

    public static function payload(): array {
        $header = self::authorizationHeader();
        if (!preg_match('/Bearer\s+(\S+)/i', $header, $matches)) {
            JsonResponse::error('Necesitás iniciar sesión para continuar.', 401);
        }

        $secret = getenv('JWT_SECRET') ?: '';
        if ($secret === '') {
            error_log('JWT_SECRET no configurado');
            JsonResponse::error('No se pudo validar la sesión.', 500);
        }

        try {
            $payload = Jwt::decode($matches[1], $secret);
        } catch (\Exception $e) {
            JsonResponse::error('Necesitás iniciar sesión para continuar.', 401);
        }

        $userId = isset($payload['sub']) ? (int) $payload['sub'] : 0;
        if ($userId <= 0) {
            JsonResponse::error('Necesitás iniciar sesión para continuar.', 401);
        }

        // Si la cuenta fue eliminada, el token deja de ser válido de inmediato.
        $fresh = self::loadActiveUser($userId);
        if (!$fresh) {
            JsonResponse::error('Necesitás iniciar sesión para continuar.', 401);
        }

        $payload['role'] = $fresh['role'];
        $payload['email'] = $fresh['email'];
        $payload['name'] = $fresh['name'];

        return $payload;
    }

    public static function requireRole(array $roles): array {
        $payload = self::payload();
        $role = (string) ($payload['role'] ?? '');
        if (!in_array($role, $roles, true)) {
            JsonResponse::error('No tenés permiso para esta acción.', 403);
        }
        return $payload;
    }

    private static function loadActiveUser(int $userId): ?array {
        if (!self::$db instanceof PDO) {
            error_log('RequestAuth DB not configured');
            return null;
        }
        try {
            $stmt = self::$db->prepare(
                'SELECT id, name, email, role FROM users WHERE id = :id LIMIT 1'
            );
            $stmt->execute([':id' => $userId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (\Throwable $err) {
            error_log('RequestAuth loadActiveUser failed: ' . $err->getMessage());
            return null;
        }
    }

    private static function authorizationHeader(): string {
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            return (string) $_SERVER['HTTP_AUTHORIZATION'];
        }
        if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return (string) $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $name => $value) {
                if (strtolower($name) === 'authorization') {
                    return (string) $value;
                }
            }
        }
        return '';
    }
}
