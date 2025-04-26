<?php
session_start();

if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy(); // Supprime toutes les données de session
    header("Location: ../public/index.php?page=login"); // Redirige vers la page de login
    exit;
}
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
session_start();

$userModel = new User($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['register'])) {
        $username = htmlspecialchars(trim($_POST['username']));
        $email = htmlspecialchars(trim($_POST['email']));
        $password = $_POST['password'];

        if ($userModel->create($username, $email, $password)) {
            $_SESSION['success'] = "Inscription réussie. Connectez-vous.";
            header("Location: ../views/auth/login.php");
            exit;
        } else {
            $_SESSION['error'] = "Erreur lors de l'inscription.";
            header("Location: ../views/auth/register.php");
            exit;
        }
    }

    if (isset($_POST['login'])) {
        $email = htmlspecialchars(trim($_POST['email']));
        $password = $_POST['password'];
        $user = $userModel->findByEmail($email);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user'] = $user;
            header("Location: ../public/index.php");
            exit;
        } else {
            $_SESSION['error'] = "Identifiants incorrects.";
            header("Location: ../views/auth/login.php");
            exit;
        }
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: ../views/auth/login.php");
    exit;
}
