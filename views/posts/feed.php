<div class="card-footer bg-transparent">
    <!-- Boutons like, commentaire, etc. -->
    
    <?php if (isset($_SESSION['user_id'])): ?>
    <div class="dropdown d-inline-block">
        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" 
                data-bs-toggle="dropdown" aria-expanded="false">
            Plus
        </button>
        <ul class="dropdown-menu">
            <li>
                <a class="dropdown-item report-btn" href="#"
                   data-target-type="post"
                   data-target-id="<?= $post['id'] ?>">
                    Signaler cette publication
                </a>
            </li>
        </ul>
    </div>
    <?php endif; ?>
</div>