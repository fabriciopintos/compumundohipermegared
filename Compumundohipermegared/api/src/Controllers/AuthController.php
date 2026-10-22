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

    public function updateProfile() {
        $userId = RequestAuth::userId();
        $data = $this->readJson();

        $name = trim((string) ($data['name'] ?? ''));
        $first = trim((string) ($data['firstName'] ?? $data['first_name'] ?? ''));
        $last = trim((string) ($data['lastName'] ?? $data['last_name'] ?? ''));
        if ($name === '' && ($first !== '' || $last !== '')) {
            $name = trim($first . ' ' . $last);
        }
        $email = trim((string) ($data['email'] ?? ''));

        if ($name === '' || $email === '') {
            JsonResponse::error('Completá nombre y correo.', 422);
        }
        if (mb_strlen($name) > 120) {
            JsonResponse::error('El nombre es demasiado largo.', 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            JsonResponse::error('El correo no es válido.', 422);
        }
        if ($this->model->emailTakenByOther($email, $userId)) {
            JsonResponse::error('Ese correo ya está en uso.', 409);
        }

        $this->model->updateProfile($userId, $name, $email);
        $user = $this->model->findById($userId);
        if (!$user) {
            JsonResponse::error('No se pudo actualizar el perfil.', 500);
        }

        JsonResponse::ok(['user' => $this->publicUser($user)], 'Perfil actualizado');
    }

    public function changePassword() {
        $userId = RequestAuth::userId();
        $data = $this->readJson();
        $current = (string) ($data['currentPassword'] ?? $data['current_password'] ?? '');
        $next = (string) ($data['newPassword'] ?? $data['new_password'] ?? $data['password'] ?? '');

        if ($current === '' || $next === '') {
            JsonResponse::error('Completá la contraseña actual y la nueva.', 422);
        }
        if (strlen($next) < 8) {
            JsonResponse::error('La nueva contraseña debe tener al menos 8 caracteres.', 422);
        }

        $user = $this->model->findAuthById($userId);
        if (!$user || !password_verify($current, $user['password_hash'])) {
            // 422 (no 401): el token sigue válido; solo falló la contraseña actual.
            JsonResponse::error('La contraseña actual no es correcta.', 422);
        }

        $this->model->updatePassword($userId, password_hash($next, PASSWORD_DEFAULT));
        JsonResponse::ok([], 'Contraseña actualizada');
    }

    public function deleteAccount() {
        $userId = RequestAuth::userId();
        $data = $this->readJson();
        $password = (string) ($data['password'] ?? $data['currentPassword'] ?? $data['current_password'] ?? '');

        $user = $this->model->findAuthById($userId);
        if (!$user) {
            JsonResponse::error('Necesitás iniciar sesión para continuar.', 401);
        }

        if ($password === '' || !password_verify($password, $user['password_hash'])) {
            JsonResponse::error('Confirmá tu contraseña para eliminar la cuenta.', 422);
        }

        if (($user['role'] ?? '') === 'admin') {
            // Evitar dejar el sistema sin administradores por auto-borrado accidental.
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
            $stmt->execute();
            if ((int) $stmt->fetchColumn() <= 1) {
                JsonResponse::error('No podés eliminar la única cuenta de administrador.', 400);
            }
        }

        if (!$this->model->deleteAccount($userId)) {
            JsonResponse::error('No se pudo eliminar la cuenta. Intentá de nuevo.', 500);
        }

        JsonResponse::ok([], 'Cuenta eliminada de forma permanente');
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
