<?php
require_once(__DIR__ . '/../../config/database.php');

if (isset($_POST['validate'])) {
    if (!empty($_POST['username']) && !empty($_POST['email']) && !empty($_POST['password'])) {
        $username = htmlspecialchars($_POST['username']);
        $email = htmlspecialchars($_POST['email']);
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

        $req = $pdo->prepare("INSERT INTO users(username, email, password) VALUES (?, ?, ?)");
        $req->execute([$username, $email, $password]);

        header("Location: index.php");
        exit();
    } else {
        echo "<script>alert('Veuillez remplir tous les champs');</script>";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Inscription - ConnectSphere</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
  <style>
    body {
      background-color: #F5F5F5;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .register-card {
      background-color: #FFFFFF;
      padding: 2.5rem;
      border-radius: 1.5rem;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 450px;
    }
    .btn-success {
      background-color: #43B581;
      border-color: #43B581;
    }
    .btn-success:hover {
      background-color: #3ba771;
      border-color: #3ba771;
    }
    .btn-outline-danger {
      color: #F04747;
      border-color: #F04747;
    }
    .btn-outline-danger:hover {
      background-color: #F04747;
      color: white;
    }
    h2 {
      color: #2C2F33;
    }
  </style>
</head>
<body>
  <div class="register-card">
    <h2 class="text-center mb-4">👤 Inscription ConnectSphere</h2>
    <form action="" method="POST">
      <div class="mb-3">
        <input type="text" name="username" placeholder="Entrez votre nom" class="form-control" required>
      </div>
      <div class="mb-3">
        <input type="email" name="email" placeholder="Entrez votre email" class="form-control" required>
      </div>
      <div class="mb-3">
        <input type="password" name="password" placeholder="Entrez votre mot de passe" class="form-control" required>
      </div>
      <button type="submit" name="validate" class="btn btn-success w-100">Soumettre</button>
      <button type="reset" class="btn btn-outline-danger w-100 mt-2">Annuler</button>
    </form>
  </div>
</body>
</html>
