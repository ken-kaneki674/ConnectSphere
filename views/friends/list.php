<?php
require_once '../../config/database.php';
require_once '../../includes/functions.php';
require_once '../layout/header.php';

$current_user_id = 1; // ⚠️ À remplacer par $_SESSION['user_id'] en production

// Récupérer les amis (relations validées)
$stmt = $pdo->prepare("
    SELECT u.id, u.username, u.profile_picture
    FROM users u
    INNER JOIN friend_requests fr
        ON (u.id = fr.sender_id OR u.id = fr.receiver_id)
    WHERE (fr.sender_id = :user_id OR fr.receiver_id = :user_id)
      AND fr.status = 1
      AND u.id != :user_id
");
$stmt->execute(['user_id' => $current_user_id]);
$friends = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="container mt-4">
    <h2>👥 Mes amis</h2>

    <?php if (!empty($friends)): ?>
        <div class="list-group">
            <?php foreach ($friends as $friend): ?>
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <img src="<?= $friend['profile_picture'] ?: '/assets/images/default.png' ?>" alt="Profil" class="rounded-circle me-2" width="40" height="40">
                        <strong><?= htmlspecialchars($friend['username']) ?></strong>
                    </div>
                    <form method="POST" action="../../controllers/FriendController.php" onsubmit="return confirm('Supprimer cet ami ?');">
                        <input type="hidden" name="action" value="remove_friend">
                        <input type="hidden" name="friend_id" value="<?= $friend['id'] ?>">
                        <button class="btn btn-outline-danger btn-sm">Supprimer</button>
                    </form>
                </div>
            <?php endforeach; ?>
        </div>
    <?php else: ?>
        <p>Tu n’as pas encore d’amis 😢</p>
    <?php endif; ?>
</div>

<?php require_once '../layout/footer.php'; ?>
