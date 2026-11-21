<?php // Vue incluse par public/index.php ; variable disponible : $groups ?>
<div class="row">
    <div class="col-lg-4 mb-4">
        <div class="card">
            <div class="card-header fw-bold">Créer un groupe</div>
            <div class="card-body">
                <form method="POST" action="index.php?page=groups">
                    <?= csrfField() ?>
                    <input type="hidden" name="action" value="create">
                    <div class="mb-2">
                        <input type="text" name="name" class="form-control" placeholder="Nom du groupe" maxlength="100" required>
                    </div>
                    <div class="mb-2">
                        <textarea name="description" class="form-control" rows="3" placeholder="Description"></textarea>
                    </div>
                    <div class="mb-2">
                        <select name="privacy" class="form-select">
                            <option value="public">Public</option>
                            <option value="private">Privé</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Créer</button>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-8">
        <h2 class="mb-3">👥 Groupes</h2>

        <?php if (empty($groups)): ?>
            <p class="text-muted">Aucun groupe pour le moment. Créez le premier !</p>
        <?php endif; ?>

        <?php foreach ($groups as $group): ?>
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">
                        <?= e($group['name']) ?>
                        <?php if ($group['privacy'] === 'private'): ?>
                            <span class="badge bg-secondary">Privé</span>
                        <?php endif; ?>
                    </h5>
                    <p class="text-muted small mb-2">
                        <?= (int)$group['members_count'] ?> membre(s) · créé par <?= e($group['creator_name']) ?>
                    </p>
                    <p class="card-text"><?= nl2br(e($group['description'])) ?></p>

                    <form method="POST" action="index.php?page=groups" class="d-inline"
                        <?= $group['my_role'] === 'admin' ? "onsubmit=\"return confirm('Supprimer ce groupe ?');\"" : '' ?>>
                        <?= csrfField() ?>
                        <input type="hidden" name="group_id" value="<?= (int)$group['id'] ?>">
                        <?php if ($group['my_role'] === null): ?>
                            <button name="action" value="join" class="btn btn-sm btn-primary">Rejoindre</button>
                        <?php elseif ($group['my_role'] === 'admin'): ?>
                            <span class="badge bg-primary me-2">Admin</span>
                            <button name="action" value="delete" class="btn btn-sm btn-outline-danger">Supprimer</button>
                        <?php else: ?>
                            <span class="badge bg-success me-2">Membre</span>
                            <button name="action" value="leave" class="btn btn-sm btn-outline-danger">Quitter</button>
                        <?php endif; ?>
                    </form>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>
