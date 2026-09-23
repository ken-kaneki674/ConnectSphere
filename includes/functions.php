<?php
// Fonctions utilitaires de la version PHP MVC

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Échappe une valeur pour l'afficher dans du HTML
function e($value): string
{
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function currentUser(): ?array
{
    return $_SESSION['user'] ?? null;
}

function isLoggedIn(): bool
{
    return isset($_SESSION['user']['id']);
}

function redirect(string $url): void
{
    header("Location: $url");
    exit;
}

function requireLogin(): void
{
    if (!isLoggedIn()) {
        redirect('index.php?page=login');
    }
}

// Messages « flash » affichés une seule fois
function flash(string $type, string $message): void
{
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function takeFlashes(): array
{
    $flashes = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $flashes;
}

// Jeton CSRF pour les formulaires POST
function csrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrfField(): string
{
    return '<input type="hidden" name="csrf_token" value="' . e(csrfToken()) . '">';
}

function checkCsrf(): bool
{
    $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    return is_string($token) && hash_equals(csrfToken(), $token);
}
