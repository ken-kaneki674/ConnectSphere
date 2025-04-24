<?php
require_once '../../config/database.php';
require_once '../../includes/functions.php';
require_once '../layout/header.php';

$current_user_id = 1; // À remplacer par l'utilisateur connecté via session

// Récupérer les demandes reçues (status = 0)
$stmt = $pdo->prepare("
    SELECT fr.id, u.id AS sender_id, u.username, u.profile_picture 
    FROM friend_requests fr
    JOIN users u ON fr.sender_id = u.id
    WHERE fr.receiver_id = ? AND fr.status = 0
");
$stmt->execute([$current_user_id]);
$requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="container mt-4">
    <h2>📩 Demandes d’amis reçues</h2>

    <?php if (!empty($requests)): ?>
        <div class="list-group">
            <?php foreach ($requests as $request): ?>
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <img src="<?= $request['profile_picture'] ?: '/assets/images/default.png' ?>" alt="Profil" class="rounded-circle me-2" width="40" height="40">
                        <strong><?= htmlspecialchars($request['username']) ?></strong>
                    </div>
                    <div class="d-flex gap-2">
                        <form method="POST" action="../../controllers/FriendController.php">
                            <input type="hidden" name="action" value="accept_request">
                            <input type="hidden" name="request_id" value="<?= $request['id'] ?>">
                            <button class="btn btn-success btn-sm">Accepter</button>
                        </form>
                        <form method="POST" action="../../controllers/FriendController.php">
                            <input type="hidden" name="action" value="refuse_request">
                            <input type="hidden" name="request_id" value="<?= $request['id'] ?>">
                            <button class="btn btn-danger btn-sm">Refuser</button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php else: ?>
        <p>Pas de nouvelles demandes d’amis.</p>
    <?php endif; ?>
</div>

<?php require_once '../layout/footer.php'; ?>
