<?php
namespace App\Utils;

class Jwt {
    public static function encode(array $payload, string $secret, int $ttlSeconds = 86400): string {
        $now = time();
        $payload['iat'] = $now;
        $payload['exp'] = $now + $ttlSeconds;

        $header = self::b64(json_encode(['typ' => 'JWT', 'alg' => 'HS256'], JSON_UNESCAPED_UNICODE));
        $body = self::b64(json_encode($payload, JSON_UNESCAPED_UNICODE));
        $signature = self::b64(hash_hmac('sha256', $header . '.' . $body, $secret, true));

        return $header . '.' . $body . '.' . $signature;
    }

    public static function decode(string $token, string $secret): array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new \Exception('Token inválido');
        }

        [$header, $body, $signature] = $parts;
        $expected = self::b64(hash_hmac('sha256', $header . '.' . $body, $secret, true));

        if (!hash_equals($expected, $signature)) {
            throw new \Exception('Token inválido');
        }

        $payload = json_decode(self::b64decode($body), true);
        if (!is_array($payload)) {
            throw new \Exception('Token inválido');
        }
        if (!isset($payload['exp']) || time() >= (int) $payload['exp']) {
            throw new \Exception('Sesión expirada');
        }

        return $payload;
    }

    private static function b64(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function b64decode(string $data): string {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        $decoded = base64_decode(strtr($data, '-_', '+/'), true);
        return $decoded === false ? '' : $decoded;
    }
}
