<?php // Vue incluse par public/index.php ; variable disponible : $profile (null si introuvable) ?>
<?php if (!$profile): ?>
    <div class="alert alert-danger">Utilisateur introuvable.</div>
<?php else: ?>
    <?php $user = $profile['user']; ?>
    <div class="row">
        <div class="col-md-4 mb-4">
            <div class="card text-center">
                <div class="card-body">
                    <div class="display-4 mb-2">👤</div>
                    <h4><?= e($user['username']) ?></h4>
                    <p class="text-muted small">Membre depuis le <?= e(date('d/m/Y', strtotime($user['created_at']))) ?></p>

                    <div class="d-flex justify-content-around mb-3">
                        <div><h5><?= count($profile['posts']) ?></h5><small class="text-muted">Publications</small></div>
                        <div><h5><?= (int)$profile['groups_count'] ?></h5><small class="text-muted">Groupes</small></div>
                    </div>

                    <?php if ($profile['is_own']): ?>
                        <form method="POST" action="index.php?page=profile&id=<?= (int)$user['id'] ?>">
                            <?= csrfField() ?>
                            <input type="hidden" name="action" value="update_bio">
                            <textarea name="bio" class="form-control mb-2" rows="3" placeholder="Votre bio"><?= e($user['bio']) ?></textarea>
                            <button type="submit" class="btn btn-primary w-100">Mettre à jour</button>
                        </form>
                    <?php else: ?>
                        <p><?= nl2br(e($user['bio'] ?: 'Pas encore de bio.')) ?></p>
                        <a href="pages/message.php" class="btn btn-outline-primary w-100">Envoyer un message</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <div class="col-md-8">
            <h4 class="mb-3">Publications de <?= e($user['username']) ?></h4>
            <?php
            $posts = $profile['posts'];
            $hideComposer = true;
            include __DIR__ . '/../posts/feed.php';
            ?>
        </div>
    </div>
<?php endif; ?>
