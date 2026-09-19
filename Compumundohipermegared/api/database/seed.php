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
       name = VALUES(name),
       role = VALUES(role),
       password_hash = VALUES(password_hash),
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

fwrite(STDOUT, "Cuentas de desarrollo (password: cambiar-en-desarrollo):\n");
fwrite(STDOUT, "  admin@fitpower.com       → admin\n");
fwrite(STDOUT, "  entrenador@fitpower.com  → entrenador\n");
fwrite(STDOUT, "  usuario@fitpower.com     → usuario\n");
