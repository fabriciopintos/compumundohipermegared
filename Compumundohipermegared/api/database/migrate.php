<?php
// api/database/migrate.php

$root = dirname(__DIR__);
require_once $root . '/autoload.php';
require_once $root . '/config/database.php';

\App\Utils\EnvLoader::load($root . '/.env');
\App\Utils\EnvLoader::load(dirname($root) . '/.env');

function waitForConnection(int $retries = 30): PDO {
    $last = null;
    for ($i = 0; $i < $retries; $i++) {
        try {
            return (new Database())->getConnection();
        } catch (Exception $e) {
            $last = $e;
            fwrite(STDERR, "Esperando PostgreSQL... (" . ($i + 1) . "/{$retries})\n");
            sleep(2);
        }
    }
    fwrite(STDERR, "No se pudo conectar a PostgreSQL: " . ($last ? $last->getMessage() : 'error desconocido') . "\n");
    exit(1);
}

$db = waitForConnection();
$db->exec(
    'CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(50) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )'
);

$appliedStmt = $db->query('SELECT version FROM schema_migrations');
$applied = $appliedStmt->fetchAll(PDO::FETCH_COLUMN);

$files = glob(__DIR__ . '/migrations/*.sql');
sort($files, SORT_STRING);

foreach ($files as $file) {
    $version = basename($file);
    if (in_array($version, $applied, true)) {
        continue;
    }

    $sql = file_get_contents($file);
    if ($sql === false || trim($sql) === '') {
        continue;
    }

    $db->beginTransaction();
    try {
        $db->exec($sql);
        $insert = $db->prepare('INSERT INTO schema_migrations (version) VALUES (:version)');
        $insert->execute([':version' => $version]);
        $db->commit();
        fwrite(STDOUT, "Migración aplicada: {$version}\n");
    } catch (Exception $e) {
        $db->rollBack();
        fwrite(STDERR, "Error en migración {$version}: " . $e->getMessage() . "\n");
        exit(1);
    }
}

require __DIR__ . '/seed.php';
fwrite(STDOUT, "Migraciones y seed listos.\n");
