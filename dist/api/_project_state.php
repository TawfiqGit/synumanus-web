<?php
declare(strict_types=1);
require_once __DIR__ . '/_request.php';

const PROJECT_PRESENCE_GRACE = 90;
const PROJECT_REMINDER_DELAY = 900;

function projectDatabase(): PDO
{
    $dsn = synumanusIsLocalMock() ? '' : trim((string)getenv('SYNUMANUS_PROJECT_DSN'));
    if ($dsn !== '') {
        if (!str_starts_with($dsn, 'mysql:')) throw new RuntimeException('DSN MySQL requis.');
        $db = new PDO($dsn, (string)getenv('SYNUMANUS_PROJECT_DB_USER'), (string)getenv('SYNUMANUS_PROJECT_DB_PASSWORD'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $db->exec('CREATE TABLE IF NOT EXISTS prospects (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
            payload MEDIUMTEXT NOT NULL, created_at BIGINT NOT NULL,
            appointment_booked TINYINT(1) NOT NULL DEFAULT 0,
            relance_started TINYINT(1) NOT NULL DEFAULT 0,
            reminder_sent_at BIGINT NULL, next_attempt_at BIGINT NOT NULL DEFAULT 0,
            attempts INT NOT NULL DEFAULT 0, last_error TEXT NULL, systeme_contact_id BIGINT NULL,
            INDEX prospects_pending(appointment_booked,reminder_sent_at,next_attempt_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        $db->exec('CREATE TABLE IF NOT EXISTS project_visits (
            prospect_id BIGINT UNSIGNED NOT NULL,
            tab_id CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
            last_seen_at BIGINT NOT NULL, left_at BIGINT NULL,
            PRIMARY KEY(prospect_id,tab_id),
            FOREIGN KEY(prospect_id) REFERENCES prospects(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        return $db;
    }
    $default = dirname(__DIR__, 2) . '/var/' . (synumanusIsLocalMock() ? 'prospects-mock.sqlite' : 'prospects.sqlite');
    $path = getenv('SYNUMANUS_PROJECT_DB') ?: $default;
    $directory = dirname($path);
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('Création du stockage impossible.');
    }
    $public = realpath(dirname(__DIR__));
    $resolved = realpath($directory);
    if (is_link($path)) throw new RuntimeException('La base ne doit pas être un lien symbolique.');
    if (!$resolved || !$public || $resolved === $public || str_starts_with($resolved, $public . DIRECTORY_SEPARATOR)) {
        throw new RuntimeException('La base doit rester hors du dossier public.');
    }
    $db = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    chmod($path, 0600);
    $db->exec('PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');
    $db->exec('CREATE TABLE IF NOT EXISTS prospects (
        id INTEGER PRIMARY KEY AUTOINCREMENT, token_hash TEXT NOT NULL UNIQUE,
        payload TEXT NOT NULL, created_at INTEGER NOT NULL,
        appointment_booked INTEGER NOT NULL DEFAULT 0 CHECK(appointment_booked IN (0,1)),
        relance_started INTEGER NOT NULL DEFAULT 0 CHECK(relance_started IN (0,1)),
        reminder_sent_at INTEGER, next_attempt_at INTEGER NOT NULL DEFAULT 0,
        attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT,
        systeme_contact_id INTEGER
    );
    CREATE TABLE IF NOT EXISTS project_visits (
        prospect_id INTEGER NOT NULL REFERENCES prospects(id), tab_id TEXT NOT NULL,
        last_seen_at INTEGER NOT NULL, left_at INTEGER,
        PRIMARY KEY(prospect_id, tab_id)
    );
    CREATE INDEX IF NOT EXISTS prospects_pending ON prospects(appointment_booked, reminder_sent_at, next_attempt_at);');
    return $db;
}

function projectTokenValid(mixed $token): bool
{
    return is_string($token) && preg_match('/^[a-f0-9]{64}$/D', $token) === 1;
}

function projectRecord(PDO $db, array $payload, string $token, string $tab, int $now): array
{
    $db->beginTransaction();
    try {
        $sql = $db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql'
            ? 'INSERT INTO prospects(token_hash,payload,created_at) VALUES(?,?,?) ON DUPLICATE KEY UPDATE id=id'
            : 'INSERT OR IGNORE INTO prospects(token_hash,payload,created_at) VALUES(?,?,?)';
        $insert = $db->prepare($sql);
        $insert->execute([hash('sha256', $token), json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE), $now]);
        $created = $insert->rowCount() === 1;
        $find = $db->prepare('SELECT id,appointment_booked,relance_started FROM prospects WHERE token_hash=?');
        $find->execute([hash('sha256', $token)]);
        $row = $find->fetch();
        projectVisit($db, (int)$row['id'], $tab, 'present', $now);
        $db->commit();
        return $row + ['created' => $created];
    } catch (Throwable $error) {
        $db->rollBack();
        throw $error;
    }
}

function projectVisit(PDO $db, int $id, string $tab, string $event, int $now): void
{
    $sql = 'INSERT INTO project_visits(prospect_id,tab_id,last_seen_at,left_at) VALUES(?,?,?,?) ';
    $sql .= $db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql'
        ? 'ON DUPLICATE KEY UPDATE last_seen_at=VALUES(last_seen_at),left_at=VALUES(left_at)'
        : 'ON CONFLICT(prospect_id,tab_id) DO UPDATE SET last_seen_at=excluded.last_seen_at,left_at=excluded.left_at';
    $query = $db->prepare($sql);
    $query->execute([$id, $tab, $now, $event === 'leave' ? $now : null]);
}

function projectDue(PDO $db, int $id, int $now): bool
{
    $query = $db->prepare('SELECT MAX(COALESCE(left_at,last_seen_at + ?)) FROM project_visits WHERE prospect_id=?');
    $query->execute([PROJECT_PRESENCE_GRACE, $id]);
    $departure = $query->fetchColumn();
    return $departure !== null && (int)$departure + PROJECT_REMINDER_DELAY <= $now;
}
