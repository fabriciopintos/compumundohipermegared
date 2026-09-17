<?php
namespace App\Controllers;

use App\Models\Auth\AuthModel;
use App\Utils\JsonResponse;
use App\Utils\Jwt;
use App\Utils\RequestAuth;

class AuthController {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new AuthModel($db);
    }

    public function login() {
        $data = $this->readJson();
        $login = trim((string) ($data['email'] ?? $data['usuario'] ?? $data['username'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($login === '' || $password === '') {
            JsonResponse::error('Completá el usuario y la contraseña.', 422);
        }

        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        if ($this->model->tooManyAttempts($ip)) {
            JsonResponse::error('Demasiados intentos. Probá de nuevo más tarde.', 429);
        }

        $user = $this->model->findByLogin($login);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->model->recordAttempt($ip);
            JsonResponse::error('El email o la contraseña son incorrectos.', 401);
        }

        $this->model->recordLogin((int) $user['id']);

        $ttl = (int) (getenv('JWT_TTL_SECONDS') ?: 86400);
        $secret = getenv('JWT_SECRET') ?: '';
        if ($secret === '') {
            error_log('JWT_SECRET no configurado');
            JsonResponse::error('No se pudo iniciar sesión.', 500);
        }

        $token = Jwt::encode([
            'sub' => (int) $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role'] ?? 'usuario',
        ], $secret, $ttl);

        JsonResponse::ok([
            'token' => $token,
            'user' => $this->publicUser($user),
        ], 'Sesión iniciada');
    }

    public function logout() {
        RequestAuth::userId();
        JsonResponse::ok([], 'Sesión cerrada');
    }

    public function me() {
        $userId = RequestAuth::userId();
        $user = $this->model->findById($userId);
        if (!$user) {
            JsonResponse::error('Necesitás iniciar sesión para continuar.', 401);
        }

        JsonResponse::ok([
            'user' => $this->publicUser($user),
            'weeklyLogins' => $this->model->weeklyLoginCount($userId),
            'enrolledActivities' => $this->model->enrolledActivitiesCount($userId),
        ]);
    }

    private function publicUser(array $user): array {
        return [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'] ?? 'usuario',
        ];
    }

    private function readJson(): array {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return $_POST ?: [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}
