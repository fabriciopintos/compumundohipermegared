<?php
// api/database/seed.php

/** @var PDO $db */

$hash = password_hash('cambiar-en-desarrollo', PASSWORD_DEFAULT);

$roleUsers = [
    [
        'name' => 'Administrador',
        'email' => 'admin@fitpower.com',
        'role' => 'admin',
    ],
    [
        'name' => 'Entrenador',
        'email' => 'entrenador@fitpower.com',
        'role' => 'entrenador',
    ],
    [
        'name' => 'Usuario',
        'email' => 'usuario@fitpower.com',
        'role' => 'usuario',
    ],
];

$upsertUser = $db->prepare(
    'INSERT INTO users (name, email, password_hash, role)
     VALUES (:name, :email, :password_hash, :role)
     ON DUPLICATE KEY UPDATE
       role = VALUES(role),
       updated_at = CURRENT_TIMESTAMP'
);

$findUserId = $db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');

$userIds = [];
foreach ($roleUsers as $roleUser) {
    $upsertUser->execute([
        ':name' => $roleUser['name'],
        ':email' => $roleUser['email'],
        ':password_hash' => $hash,
        ':role' => $roleUser['role'],
    ]);
    $findUserId->execute([':email' => $roleUser['email']]);
    $userIds[$roleUser['role']] = (int) $findUserId->fetchColumn();
}

$activityCount = (int) $db->query('SELECT COUNT(*) FROM activities')->fetchColumn();
$activityIds = [];

if ($activityCount === 0) {
    $activities = [
        ['Boxeo', 'boxeo', '/imagenes/Rectangle 8.png'],
        ['Hidrogimnasia', 'hidrogimnasia', '/imagenes/Rectangle 10.png'],
        ['Pilates', 'pilates', '/imagenes/Rectangle 7.png'],
        ['Zumba', 'zumba', '/imagenes/Rectangle 11.png'],
        ['Musculación', 'musculacion', '/imagenes/Rectangle 6.png'],
        ['Spinning', 'spinning', '/imagenes/Rectangle 12.png'],
    ];

    $insertActivity = $db->prepare(
        'INSERT INTO activities (name, slug, image_url) VALUES (:name, :slug, :image_url)'
    );
    foreach ($activities as $activity) {
        $insertActivity->execute([
            ':name' => $activity[0],
            ':slug' => $activity[1],
            ':image_url' => $activity[2],
        ]);
        $activityIds[$activity[1]] = (int) $db->lastInsertId();
    }
} else {
    $rows = $db->query('SELECT id, slug FROM activities')->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $row) {
        $activityIds[$row['slug']] = (int) $row['id'];
    }
}

$sessionCount = (int) $db->query('SELECT COUNT(*) FROM class_sessions')->fetchColumn();
$firstSessionId = null;

if ($sessionCount === 0 && $activityIds) {
    $sessions = [
        ['boxeo', 1, '07:30', 60, 16, 'Martín Pérez'],
        ['pilates', 1, '09:00', 60, 12, 'Laura Gómez'],
        ['hidrogimnasia', 1, '10:00', 60, 10, 'Ana Ruiz'],
        ['zumba', 1, '18:00', 60, 20, 'Sofía Díaz'],
        ['boxeo', 2, '18:00', 60, 16, 'Martín Pérez'],
        ['pilates', 2, '09:00', 60, 12, 'Laura Gómez'],
        ['zumba', 3, '19:30', 60, 20, 'Sofía Díaz'],
        ['hidrogimnasia', 3, '11:00', 60, 10, 'Ana Ruiz'],
        ['boxeo', 4, '18:00', 60, 16, 'Martín Pérez'],
        ['pilates', 4, '19:00', 60, 12, 'Laura Gómez'],
        ['zumba', 5, '18:30', 60, 20, 'Sofía Díaz'],
        ['hidrogimnasia', 5, '10:00', 60, 10, 'Ana Ruiz'],
        ['spinning', 6, '09:00', 60, 18, 'Diego López'],
        ['musculacion', 6, '11:00', 60, 15, 'Martín Pérez'],
    ];

    $insertSession = $db->prepare(
        'INSERT INTO class_sessions (activity_id, day_of_week, start_time, duration_minutes, capacity, professor_name)
         VALUES (:activity_id, :day_of_week, :start_time, :duration_minutes, :capacity, :professor_name)'
    );

    foreach ($sessions as $session) {
        if (!isset($activityIds[$session[0]])) {
            continue;
        }
        $insertSession->execute([
            ':activity_id' => $activityIds[$session[0]],
            ':day_of_week' => $session[1],
            ':start_time' => $session[2],
            ':duration_minutes' => $session[3],
            ':capacity' => $session[4],
            ':professor_name' => $session[5],
        ]);
        $id = (int) $db->lastInsertId();
        if ($firstSessionId === null) {
            $firstSessionId = $id;
        }
    }
} else {
    $firstSessionId = (int) $db->query('SELECT id FROM class_sessions ORDER BY id ASC LIMIT 1')->fetchColumn();
}

$usuarioId = $userIds['usuario'] ?? null;
if ($usuarioId && $firstSessionId) {
    $enroll = $db->prepare(
        'INSERT IGNORE INTO enrollments (user_id, class_session_id)
         VALUES (:user_id, :class_session_id)'
    );
    $enroll->execute([
        ':user_id' => $usuarioId,
        ':class_session_id' => $firstSessionId,
    ]);
}

$demoStudents = [
    ['María López', 'maria.lopez@fitpower.com'],
    ['Juan Pérez', 'juan.perez@fitpower.com'],
    ['Lucía Díaz', 'lucia.diaz@fitpower.com'],
    ['Carlos Ruiz', 'carlos.ruiz@fitpower.com'],
];
foreach ($demoStudents as $student) {
    $upsertUser->execute([
        ':name' => $student[0],
        ':email' => $student[1],
        ':password_hash' => $hash,
        ':role' => 'usuario',
    ]);
}

$entrenadorId = $userIds['entrenador'] ?? null;
$routineCount = 0;
try {
    $routineCount = (int) $db->query('SELECT COUNT(*) FROM routines')->fetchColumn();
} catch (Exception $e) {
    $routineCount = -1;
}

if ($routineCount === 0 && $entrenadorId) {
    $seedRoutines = [
        [
            'Fuerza',
            'Sesión de fuerza con patrones básicos y descanso controlado.',
            'https://www.youtube.com/watch?v=HE45jVN7XKM',
            '/imagenes/Rectangle%203.png',
            [
                ['name' => 'Sentadilla', 'detail' => '4 x 10', 'rest' => '90s'],
                ['name' => 'Press banca', 'detail' => '4 x 8', 'rest' => '90s'],
                ['name' => 'Remo con barra', 'detail' => '4 x 10', 'rest' => '75s'],
                ['name' => 'Press militar', 'detail' => '3 x 10', 'rest' => '75s'],
            ],
        ],
        [
            'Hipertrofia',
            'Volumen controlado para ganar músculo con descanso justo.',
            'https://www.youtube.com/watch?v=nxisr1AalNc',
            '/imagenes/Rectangle%206.png',
            [
                ['name' => 'Zancadas', 'detail' => '3 x 12', 'rest' => '60s'],
                ['name' => 'Aperturas', 'detail' => '3 x 12', 'rest' => '60s'],
                ['name' => 'Jalón al pecho', 'detail' => '4 x 10', 'rest' => '75s'],
            ],
        ],
        [
            'Cardio',
            'Trabajo cardiovascular con intervalos y movilidad.',
            'https://www.youtube.com/watch?v=xSUXMwqZ3z0',
            '/imagenes/Rectangle%208.png',
            [
                ['name' => 'Calentamiento', 'detail' => '8 min', 'rest' => '-'],
                ['name' => 'Bolsa / sombra', 'detail' => "6 x 2'", 'rest' => '60s'],
                ['name' => 'Burpees', 'detail' => '4 x 10', 'rest' => '50s'],
            ],
        ],
        [
            'Movilidad',
            'Movilidad articular y respiración para recuperar rango.',
            'https://www.youtube.com/watch?v=2IcWJobNDck',
            '/imagenes/Rectangle%207.png',
            [
                ['name' => 'Respiración', 'detail' => '3 min', 'rest' => '-'],
                ['name' => 'Gato-vaca', 'detail' => '2 x 12', 'rest' => '30s'],
                ['name' => 'Apertura de cadera', 'detail' => '2 x 10', 'rest' => '30s'],
            ],
        ],
    ];

    $insertRoutine = $db->prepare(
        'INSERT INTO routines (title, description, video_url, image_url, exercises_json, created_by)
         VALUES (:title, :description, :video_url, :image_url, :exercises_json, :created_by)'
    );
    foreach ($seedRoutines as $routine) {
        $insertRoutine->execute([
            ':title' => $routine[0],
            ':description' => $routine[1],
            ':video_url' => $routine[2],
            ':image_url' => $routine[3],
            ':exercises_json' => json_encode($routine[4], JSON_UNESCAPED_UNICODE),
            ':created_by' => $entrenadorId,
        ]);
    }
}

fwrite(STDOUT, "Cuentas de desarrollo (password: cambiar-en-desarrollo):\n");
fwrite(STDOUT, "  admin@fitpower.com       → admin\n");
fwrite(STDOUT, "  entrenador@fitpower.com  → entrenador\n");
fwrite(STDOUT, "  usuario@fitpower.com     → usuario\n");
fwrite(STDOUT, "  (+ alumnos demo maria/juan/lucia/carlos @fitpower.com)\n");
