<?php if (isset($_SESSION['user_id']) && $_SESSION['user_id'] != $user['id']): ?>
<div class="dropdown mt-2">
    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" 
            id="profileActions" data-bs-toggle="dropdown" aria-expanded="false">
        Actions
    </button>
    <ul class="dropdown-menu" aria-labelledby="profileActions">
        <li>
            <a class="dropdown-item report-btn" href="#" 
               data-target-type="user" 
               data-target-id="<?= $user['id'] ?>">
                Signaler cet utilisateur
            </a>
        </li>
        <li>
            <a class="dropdown-item block-user-btn" href="#"
               data-user-id="<?= $user['id'] ?>"
               data-user-name="<?= htmlspecialchars($user['username']) ?>">
                Bloquer cet utilisateur
            </a>
        </li>
    </ul>
</div>
<?php endif; ?>

<!-- Inclure le modal de signalement -->
<?php include __DIR__.'/../moderation/report_form.php'; ?>