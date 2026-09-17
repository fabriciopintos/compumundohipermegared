<?php
namespace App\Utils;

class RequestAuth {
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
