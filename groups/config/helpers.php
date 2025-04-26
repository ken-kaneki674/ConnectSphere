<?php
function checkAuth(): void {
    if (!isset($_SESSION['user_id'])) {
        $_SESSION['redirect'] = $_SERVER['REQUEST_URI'];
        redirect('/login');
    }
}

function checkCsrfToken(): void {
    if (empty($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        throw new RuntimeException('Token CSRF invalide');
    }
}

function render(string $view, array $data = []): void {
    extract($data);
    require __DIR__ . "/../views/{$view}.php";
}

function redirect(string $url): void {
    header("Location: {$url}");
    exit;
}

function redirectWithError(string $url, string $message): void {
    $_SESSION['error'] = $message;
    redirect($url);
}

function redirectWithSuccess(string $url, string $message): void {
    $_SESSION['success'] = $message;
    redirect($url);
}

function logError(Exception $e): void {
    error_log('[' . date('Y-m-d H:i:s') . '] ' . $e->getMessage() . "\n" . $e->getTraceAsString());
}