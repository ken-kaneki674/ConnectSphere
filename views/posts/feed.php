<?php // Vue incluse par public/index.php (fil) et views/profile/view.php ; variable disponible : $posts ?>
<?php if (!isset($hideComposer) && isLoggedIn()): ?>
    <div class="card mb-4">
        <div class="card-body">
            <form method="POST" action="index.php?page=feed">
                <?= csrfField() ?>
                <input type="hidden" name="action" value="create">
                <textarea name="content" class="form-control mb-2" rows="3" placeholder="Partagez ce que vous pensez..." required></textarea>
                <button type="submit" class="btn btn-primary" style="background-color: #5865F2;">Publier</button>
            </form>
        </div>
    </div>
<?php elseif (!isLoggedIn()): ?>
    <div class="alert alert-info">
        <a href="index.php?page=login">Connectez-vous</a> pour publier, aimer et commenter.
    </div>
<?php endif; ?>

<?php if (empty($posts)): ?>
    <p class="text-muted text-center py-4">Aucune publication pour le moment.</p>
<?php endif; ?>

<?php foreach ($posts as $post): ?>
    <div class="card mb-3" data-post-id="<?= (int)$post['id'] ?>">
        <div class="card-header d-flex justify-content-between align-items-center">
            <div>
                <a href="index.php?page=profile&id=<?= (int)$post['user_id'] ?>" class="fw-bold text-decoration-none">
                    <?= e($post['username']) ?>
                </a>
                <small class="text-muted ms-2"><?= e($post['created_at']) ?></small>
            </div>
            <?php if (isLoggedIn() && (int)$post['user_id'] === (int)currentUser()['id']): ?>
                <form method="POST" action="index.php?page=feed" onsubmit="return confirm('Supprimer cette publication ?');">
                    <?= csrfField() ?>
                    <input type="hidden" name="action" value="delete">
                    <input type="hidden" name="post_id" value="<?= (int)$post['id'] ?>">
                    <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                </form>
            <?php endif; ?>
        </div>
        <div class="card-body">
            <p><?= nl2br(e($post['content'])) ?></p>
            <?php if (!empty($post['image_path'])): ?>
                <img src="<?= e($post['image_path']) ?>" class="img-fluid rounded mb-3" alt="">
            <?php endif; ?>
            <div class="d-flex gap-3">
                <!-- Bouton Like -->
                <button class="btn btn-outline-primary like-btn" <?= isLoggedIn() ? '' : 'disabled' ?>>
                    <i class="bi <?= $post['liked'] ? 'bi-heart-fill' : 'bi-heart' ?>"></i>
                    <span class="like-count"><?= (int)$post['likes_count'] ?></span>
                </button>

                <!-- Bouton Commentaire -->
                <button class="btn btn-outline-secondary comment-toggle">
                    <i class="bi bi-chat"></i> Commentaires (<span class="comment-count"><?= (int)$post['comments_count'] ?></span>)
                </button>
            </div>

            <!-- Section Commentaires (masquée par défaut) -->
            <div class="comments-section mt-3" style="display: none;">
                <?php if (isLoggedIn()): ?>
                    <form class="comment-form mb-3">
                        <textarea name="content" class="form-control" placeholder="Votre commentaire..." required></textarea>
                        <button type="submit" class="btn btn-primary mt-2">Envoyer</button>
                    </form>
                <?php endif; ?>
                <div class="comments-list">
                    <!-- Chargé dynamiquement via JS -->
                </div>
            </div>
        </div>
    </div>
<?php endforeach; ?>
