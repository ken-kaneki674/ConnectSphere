<?php

require_once __DIR__ . '/../../includes/db.php';

if (isset($_SESSION['user'])) {
    header("Location: ../../public/index.php?page=home");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo "<script>alert('Veuillez remplir tous les champs');</script>";
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user'] = $user;
            header("Location: ../../public/index.php?page=home");
            exit();
        } else {
            echo "<script>alert('Email ou mot de passe incorrect');</script>";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Connexion – ConnectSphere</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="../../assets/css/styles.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
        body {
            background-color: #F5F5F5;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }

        .login-card {
            background-color: #FFFFFF;
            border-radius: 2rem;
            padding: 2rem;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }

        .btn-primary {
            background-color: #5865F2;
            border-color: #5865F2;
        }

        .btn-primary:hover {
            background-color: #4752c4;
            border-color: #4752c4;
        }

        a {
            color: #5865F2;
        }
    </style>
</head>
<body>

    <div class="login-card">
        <h2 class="text-center mb-4">🔐 Connexion à ConnectSphere</h2>
        <form method="POST">
            <div class="mb-3">
                <input type="email" name="email" class="form-control" placeholder="Adresse email" required>
            </div>
            <div class="mb-3">
                <input type="password" name="password" class="form-control" placeholder="Mot de passe" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Connexion</button>
        </form>
        <p class="text-center mt-3">
            Pas encore de compte ? <a href="../../public/index.php?page=register">Créer un compte</a>
        </p>
    </div>

</body>
</html>
