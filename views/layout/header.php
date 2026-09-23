<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?= e(csrfToken()) ?>">
    <title>ConnectSphere</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="../assets/css/styles.css" rel="stylesheet">
</head>
<body style="background-color: #F5F5F5;">
<nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #5865F2;">
    <div class="container">
        <a class="navbar-brand fw-bold" href="index.php">🌐 ConnectSphere</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav me-auto">
                <li class="nav-item"><a class="nav-link" href="index.php?page=feed">Fil d'actualité</a></li>
                <?php if (isLoggedIn()): ?>
                    <li class="nav-item"><a class="nav-link" href="index.php?page=messages">Messages</a></li>
                    <li class="nav-item"><a class="nav-link" href="index.php?page=groups">Groupes</a></li>
                <?php endif; ?>
            </ul>
            <ul class="navbar-nav">
                <?php if (isLoggedIn()): ?>
                    <li class="nav-item">
                        <a class="nav-link" href="index.php?page=profile&id=<?= (int)currentUser()['id'] ?>">
                            👤 <?= e(currentUser()['username']) ?>
                        </a>
                    </li>
                    <li class="nav-item"><a class="nav-link" href="index.php?page=logout">Déconnexion</a></li>
                <?php else: ?>
                    <li class="nav-item"><a class="nav-link" href="index.php?page=login">Connexion</a></li>
                    <li class="nav-item"><a class="nav-link" href="index.php?page=register">Inscription</a></li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</nav>

<div class="container mt-3">
    <?php foreach (takeFlashes() as $flash): ?>
        <div class="alert alert-<?= e($flash['type']) ?> alert-dismissible fade show">
            <?= e($flash['message']) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endforeach; ?>
</div>
