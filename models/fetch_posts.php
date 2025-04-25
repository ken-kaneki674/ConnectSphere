<?php
require 'db.php';


$stmt = $pdo->query("SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC");
$posts = $stmt->fetchAll();
?>

<?php foreach ($posts as $post): ?>
    <div class="post" data-post-id="<?= $post['id'] ?>">
        <a href="profile.php?id=<?= $post['user_id'] ?>" class="username">
            <strong><?= htmlspecialchars($post['username']) ?></strong>
        </a>

        <p><?= nl2br(htmlspecialchars($post['content'])) ?></p>

        <?php if (!empty($post['image_path'])): ?>
            <img src="<?= htmlspecialchars($post['image_path']) ?>" width="300">
        <?php endif; ?>

        <div>
            <button class="like-btn"><i class="fas fa-thumbs-up"></i> J’aime</button>
            <span class="like-count"><?= $post['likes'] ?? 0 ?></span>
            <button class="comment-toggle"><i class="fas fa-comment"></i> Commenter</button>
        </div>

        <div class="comments">
            <form class="comment-form">
                <input type="text" name="content" placeholder="Écris un commentaire...">
                <button type="submit"><i class="fas fa-paper-plane"></i></button>
            </form>
        </div>

        <small><?= htmlspecialchars($post['created_at']) ?></small>
    </div>
    <hr>
<?php endforeach; ?>
