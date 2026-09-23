<?php
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/User.php';

class AuthController {
    private $userModel;

    public function __construct($pdo) {
        $this->userModel = new User($pdo);
    }

    // Retourne un message d'erreur, ou redirige en cas de succès
    public function login() {
        if (!checkCsrf()) {
            return "Session expirée, veuillez réessayer.";
        }

        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if ($email === '' || $password === '') {
            return "Veuillez remplir tous les champs.";
        }

        $user = $this->userModel->findByEmail($email);
        if (!$user || !password_verify($password, $user['password'])) {
            return "Email ou mot de passe incorrect.";
        }

        session_regenerate_id(true);
        unset($user['password']);
        $_SESSION['user'] = $user;
        redirect('index.php?page=feed');
    }

    public function register() {
        if (!checkCsrf()) {
            return "Session expirée, veuillez réessayer.";
        }

        $username = trim($_POST['username'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if ($username === '' || $email === '' || $password === '') {
            return "Veuillez remplir tous les champs.";
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return "Adresse email invalide.";
        }
        if (strlen($password) < 6) {
            return "Le mot de passe doit contenir au moins 6 caractères.";
        }
        if ($this->userModel->exists($username, $email)) {
            return "Ce nom d'utilisateur ou cet email est déjà utilisé.";
        }

        $this->userModel->create($username, $email, $password);
        flash('success', "Inscription réussie. Connectez-vous.");
        redirect('index.php?page=login');
    }

    public function logout() {
        $_SESSION = [];
        session_destroy();
        redirect('index.php?page=login');
    }
}
