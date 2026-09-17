<?php
namespace App\Controllers;

use App\Models\Admin\AdminModel;
use App\Utils\JsonResponse;
use App\Utils\RequestAuth;

class AdminController {
    private $model;

    public function __construct($db) {
        $this->model = new AdminModel($db);
    }

    public function stats() {
        RequestAuth::requireRole(['admin']);
        JsonResponse::ok([
            'users' => $this->model->countByRole('usuario'),
            'trainers' => $this->model->countByRole('entrenador'),
            'admins' => $this->model->countByRole('admin'),
            'total' => $this->model->countByRole('usuario')
                + $this->model->countByRole('entrenador')
                + $this->model->countByRole('admin'),
        ]);
    }

    public function users() {
        RequestAuth::requireRole(['admin']);
        $role = isset($_GET['role']) ? trim((string) $_GET['role']) : '';
        $q = isset($_GET['q']) ? trim((string) $_GET['q']) : '';

        if ($role !== '' && !in_array($role, ['admin', 'entrenador', 'usuario'], true)) {
            JsonResponse::error('Rol inválido.', 422);
        }

        $rows = $this->model->listUsers($role !== '' ? $role : null, $q);
        $users = array_map([$this, 'mapUser'], $rows);
        JsonResponse::ok(['users' => $users]);
    }

    public function createUser() {
        $auth = RequestAuth::requireRole(['admin']);
        $data = $this->readJson();

        $name = trim((string) ($data['name'] ?? ''));
        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        $role = trim((string) ($data['role'] ?? 'usuario'));

        if ($name === '' || $email === '' || $password === '') {
            JsonResponse::error('Completá nombre, email y contraseña.', 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            JsonResponse::error('El email no es válido.', 422);
        }
        if (strlen($password) < 8) {
            JsonResponse::error('La contraseña debe tener al menos 8 caracteres.', 422);
        }
        if (!in_array($role, ['admin', 'entrenador', 'usuario'], true)) {
            JsonResponse::error('Rol inválido.', 422);
        }
        if ($this->model->findByEmail($email)) {
            JsonResponse::error('Ya existe un usuario con ese email.', 409);
        }

        $created = $this->model->create(
            $name,
            $email,
            password_hash($password, PASSWORD_DEFAULT),
            $role
        );

        JsonResponse::ok(['user' => $this->mapUser($created)], 'Usuario creado', 201);
    }

    public function deleteUser($id) {
        $auth = RequestAuth::requireRole(['admin']);
        $userId = (int) $id;
        if ($userId <= 0) {
            JsonResponse::error('Usuario inválido.', 422);
        }

        if ((int) $auth['sub'] === $userId) {
            JsonResponse::error('No podés eliminar tu propia cuenta.', 400);
        }

        $existing = $this->model->findById($userId);
        if (!$existing) {
            JsonResponse::error('El usuario no existe.', 404);
        }

        $this->model->delete($userId);
        JsonResponse::ok([], 'Usuario eliminado');
    }

    private function mapUser(array $row): array {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'role' => $row['role'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'] ?? null,
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
