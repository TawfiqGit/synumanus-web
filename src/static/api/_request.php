<?php
/**
 * Helpers HTTP partagés pour les endpoints Synumanus.
 *
 * Le mode local est activé uniquement avec :
 * SYNUMANUS_LOCAL_MOCK=1
 */

declare(strict_types=1);

// Avec dist/ comme racine HTTP, .env reste dans son parent privé.
// Les variables fournies par l'hébergeur gardent la priorité.
synumanusLoadPrivateEnv();

function synumanusLoadPrivateEnv(): void
{
    $path = dirname(__DIR__, 2) . '/.env';
    if (!is_readable($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES);
    if ($lines === false) {
        return;
    }
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        if (!preg_match('/^[A-Z_][A-Z0-9_]*$/', $key) || getenv($key) !== false) {
            continue;
        }
        $value = trim($value);
        if (strlen($value) >= 2 && in_array($value[0], ['"', "'"], true)
            && $value[0] === substr($value, -1)) {
            $value = substr($value, 1, -1);
        }
        putenv($key . '=' . $value);
    }
}

/**
 * synumanusIsLocalMock(): bool
 * Indique si les intégrations externes doivent être simulées localement.
 */
function synumanusIsLocalMock(): bool
{
    return getenv('SYNUMANUS_LOCAL_MOCK') === '1';
}

/**
 * synumanusRequestMethod(): string
 * Retourne la méthode HTTP normalisée.
 */
function synumanusRequestMethod(): string
{
    return strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
}

/**
 * synumanusReadRequestPayload(): array<string,mixed>
 * Lit GET, POST formulaire ou POST JSON.
 */
function synumanusReadRequestPayload(): array
{
    $method = synumanusRequestMethod();

    if ($method === 'GET') {
        return is_array($_GET) ? $_GET : [];
    }

    if (!empty($_POST) && is_array($_POST)) {
        return $_POST;
    }

    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    if (str_contains($contentType, 'application/x-www-form-urlencoded')) {
        parse_str($raw, $parsed);
        return is_array($parsed) ? $parsed : [];
    }

    try {
        $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        throw new InvalidArgumentException('JSON invalide.', 0, $error);
    }

    if (!is_array($decoded)) {
        throw new InvalidArgumentException('Payload invalide.');
    }

    return $decoded;
}

/**
 * synumanusBool(mixed $value): bool
 * Convertit true, 1, "true", "yes", "on" en booléen.
 */
function synumanusBool(mixed $value): bool
{
    if (is_bool($value)) {
        return $value;
    }

    return filter_var($value, FILTER_VALIDATE_BOOLEAN);
}

/**
 * synumanusLogLocalRequest(string $channel, array $payload): void
 * Journalise une requête mock afin de vérifier les données envoyées localement.
 */
function synumanusLogLocalRequest(string $channel, array $payload): void
{
    $defaultLog = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'var' . DIRECTORY_SEPARATOR . 'local-requests.log';
    $logPath = trim((string) getenv('SYNUMANUS_LOCAL_LOG')) ?: $defaultLog;
    $directory = dirname($logPath);

    if (!is_dir($directory)) {
        @mkdir($directory, 0775, true);
    }

    $entry = [
        'date' => gmdate('c'),
        'channel' => $channel,
        'method' => synumanusRequestMethod(),
        'payload' => $payload,
    ];

    @file_put_contents(
        $logPath,
        json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

/**
 * synumanusTextLength(string $value): int
 * Longueur UTF-8 avec fallback si l’extension mbstring n’est pas disponible.
 */
function synumanusTextLength(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}
