<?php
session_start();
$requests = $_SESSION['friend_requests'] ?? [];
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Demandes d'amis</title>
</head>
<body>

<h1>Demandes d'amis reçues</h1>

<?php if (!empty($requests)): ?>
    <ul>
        <?php foreach ($requests as $request): ?>
            <li>
                <?php echo htmlspecialchars($request['username']); ?>

                <!-- Bouton accepter -->
                <form method="POST" action="../../controllers/FriendController.php" style="display:inline;">
                    <input type="hidden" name="action" value="accept_request">
                    <input type="hidden" name="request_id" value="<?php echo $request['id']; ?>">
                    <button type="submit">Accepter</button>
                </form>

                <!-- Bouton refuser -->
                <form method="POST" action="../../controllers/FriendController.php" style="display:inline;">
                    <input type="hidden" name="action" value="refuse_request">
                    <input type="hidden" name="request_id" value="<?php echo $request['id']; ?>">
                    <button type="submit">Refuser</button>
                </form>
            </li>
        <?php endforeach; ?>
    </ul>
<?php else: ?>
    <p>Aucune demande en attente.</p>
<?php endif; ?>

</body>
</html>
