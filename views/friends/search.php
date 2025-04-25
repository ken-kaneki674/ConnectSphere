<?php
session_start();
$results = $_SESSION['search_results'] ?? [];
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Recherche d'amis</title>
</head>
<body>

<h1>Recherche d'utilisateurs</h1>

<!-- Formulaire de recherche -->
<form method="POST" action="../../controllers/FriendController.php">
    <input type="hidden" name="action" value="search_users">
    <input type="text" name="keyword" placeholder="Entrez un pseudo..." required>
    <button type="submit">Rechercher</button>
</form>

<hr>

<!-- Affichage des résultats -->
<h2>Résultats de la recherche :</h2>

<?php if (!empty($results)): ?>
    <ul>
        <?php foreach ($results as $user): ?>
            <li>
                <?php echo htmlspecialchars($user['username']); ?>

                <!-- Bouton pour envoyer une demande d'ami -->
                <form method="POST" action="../../controllers/FriendController.php" style="display:inline;">
                    <input type="hidden" name="action" value="send_request">
                    <input type="hidden" name="receiver_id" value="<?php echo $user['id']; ?>">
                    <button type="submit">Ajouter en ami</button>
                </form>
            </li>
        <?php endforeach; ?>
    </ul>
<?php else: ?>
    <p>Aucun utilisateur trouvé.</p>
<?php endif; ?>

</body>
</html>
