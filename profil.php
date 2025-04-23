<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo "<div class='alert alert-warning text-center mt-5'>Utilisateur non connecté</div>";
    exit();
}

$user_id = $_SESSION['user_id'];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $bio = $_POST['bio'];
    $new_password = $_POST['password'];
    $params = [
        ':username' => $username,
        ':email' => $email,
        ':bio' => $bio,
        ':id' => $user_id
    ];

    $sql = "UPDATE users SET username = :username, email = :email, bio = :bio";

    if (!empty($_FILES['profile_picture']['name'])) {
        $profile_picture = basename($_FILES['profile_picture']['name']);
        $target = "uploads/" . $profile_picture;
        move_uploaded_file($_FILES['profile_picture']['tmp_name'], $target);
        $sql .= ", profile_picture = :profile_picture";
        $params[':profile_picture'] = $profile_picture;
    }

    if (!empty($new_password)) {
        $hashed = password_hash($new_password, PASSWORD_DEFAULT);
        $sql .= ", password = :password";
        $params[':password'] = $hashed;
    }

    $sql .= " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    header("Location: profil.php");
    exit();
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
$mode_edit = isset($_GET['edit']);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Profil</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .card-profile {
            max-width: 600px;
            margin: 3rem auto;
        }
        .profile-pic {
            max-width: 120px;
            height: auto;
            border-radius: 50%;
        }
    </style>
</head>
<body class="bg-light">
    <div class="container">
        <div class="card card-profile shadow-sm p-4">
            <h3 class="text-center text-primary mb-4">Mon Profil</h3>

            <?php if ($mode_edit): ?>
                <form method="POST" enctype="multipart/form-data">
                    <div class="mb-3">
                        <label class="form-label">Nom d'utilisateur :</label>
                        <input type="text" class="form-control" name="username" value="<?= htmlspecialchars($user['username']) ?>" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email :</label>
                        <input type="email" class="form-control" name="email" value="<?= htmlspecialchars($user['email']) ?>" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Bio :</label>
                        <textarea class="form-control" name="bio" rows="3"><?= htmlspecialchars($user['bio']) ?></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Photo de profil :</label>
                        <input type="file" class="form-control" name="profile_picture">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nouveau mot de passe :</label>
                        <input type="password" class="form-control" name="password" placeholder="Laisse vide si inchangé">
                    </div>
                    <button type="submit" class="btn btn-success">Enregistrer</button>
                    <a href="profil.php" class="btn btn-secondary">Annuler</a>
                </form>

            <?php else: ?>
                <?php if (!empty($user['profile_picture'])): ?>
                    <div class="text-center mb-3">
                        <img src="uploads/<?= htmlspecialchars($user['profile_picture']) ?>" alt="Photo de profil" class="profile-pic">
                    </div>
                <?php endif; ?>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item"><strong>Nom d'utilisateur :</strong> <?= htmlspecialchars($user['username']) ?></li>
                    <li class="list-group-item"><strong>Email :</strong> <?= htmlspecialchars($user['email']) ?></li>
                    <li class="list-group-item"><strong>Bio :</strong> <?= nl2br(htmlspecialchars($user['bio'])) ?></li>
                </ul>
                <div class="text-center mt-3">
                    <a href="profil.php?edit=1" class="btn btn-primary">Modifier mon profil</a>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
