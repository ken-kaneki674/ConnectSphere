<?php
// Inclure l'en-tête ou tout autre fichier nécessaire
require_once '../../config/database.php'; 
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rechercher des utilisateurs</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Rechercher des utilisateurs</h1>

        <!-- Formulaire de recherche -->
        <form method="POST" action="../../controllers/FriendController.php">
            <div class="mb-3">
                <label for="keyword" class="form-label">Entrez un pseudo ou un nom</label>
                <input type="text" class="form-control" id="keyword" name="keyword" required>
            </div>
            <button type="submit" class="btn btn-primary" name="action" value="search_users">Rechercher</button>
        </form>

        <?php if (isset($results) && !empty($results)): ?>
            <h2 class="mt-5">Résultats de la recherche</h2>
            <div class="list-group">
                <?php foreach ($results as $user): ?>
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <img src="<?= $user['profile_picture'] ?>" alt="Profil" class="rounded-circle" style="width: 40px; height: 40px; margin-right: 10px;">
                            <span><?= htmlspecialchars($user['username']) ?></span>
                        </div>
                        <form method="POST" action="../../controllers/FriendController.php" class="d-inline">
                            <button type="submit" class="btn btn-success btn-sm" name="action" value="send_request">Ajouter</button>
                            <input type="hidden" name="receiver_id" value="<?= $user['id'] ?>">
                        </form>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php elseif (isset($results)): ?>
            <p>Aucun utilisateur trouvé.</p>
        <?php endif; ?>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
