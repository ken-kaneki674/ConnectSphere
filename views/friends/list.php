<?php
session_start();
$friends = $_SESSION['friends_list'] ?? [];
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mes amis</title>
</head>
<body>

<h1>Liste de mes amis</h1>

<?php if (!empty($friends)): ?>
    <ul>
        <?php foreach ($friends as $friend): ?>
            <li>
                <?php echo htmlspecialchars($friend['username']); ?>

                <!-- Bouton pour supprimer un ami -->
                <form method="POST" action="../../controllers/FriendController.php" style="display:inline;">
                    <input type="hidden" name="action" value="remove_friend">
                    <input type="hidden" name="friend_id" value="<?php echo $friend['id']; ?>">
                    <button type="submit">Supprimer</button>
                </form>
            </li>
        <?php endforeach; ?>
    </ul>
<?php else: ?>
    <p>Vous n'avez pas encore d'amis.</p>
<?php endif; ?>

</body>
</html>
