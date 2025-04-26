<style>
    /* Animation des cartes */
.group-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.group-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

/* Style des badges */
.badge-role {
    font-size: 0.8rem;
    padding: 0.35em 0.65em;
}

/* Responsive */
@media (max-width: 768px) {
    .group-card {
        margin-bottom: 1.5rem;
    }
}
</style>
<?php
// Define the truncate function
function truncate($text, $length) {
    return strlen($text) > $length ? substr($text, 0, $length) . '...' : $text;
}
?>
<div class="container mt-4">
    <!-- Barre de recherche/filtres -->
    <div class="card mb-4">
        <div class="card-body">
            <form method="get" class="row g-3">
                <div class="col-md-6">
                    <input type="text" name="q" class="form-control" 
                           placeholder="Rechercher..." value="<?= htmlspecialchars($search) ?>">
                </div>
                <div class="col-md-3">
                    <select name="type" class="form-select">
                        <option value="">Tous types</option>
                        <?php foreach (['publication', 'discussion', 'project'] as $t): ?>
                            <option value="<?= $t ?>" <?= $type === $t ? 'selected' : '' ?>>
                                <?= ucfirst($t) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-3">
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-search"></i> Filtrer
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Liste des groupes -->
    <?php if (empty($groups)): ?>
        <div class="text-center py-5">
            <i class="fas fa-users fa-4x text-muted mb-3"></i>
            <h3>Aucun groupe trouvé</h3>
            <p class="text-muted">Essayez de modifier vos critères de recherche</p>
            <a href="/groups/create" class="btn btn-primary mt-3">
                <i class="fas fa-plus"></i> Créer un groupe
            </a>
        </div>
    <?php else: ?>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <?php foreach ($groups as $group): ?>
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <!-- Image de couverture -->
                        <div class="position-relative">
                            <?php if ($group['cover_image']): ?>
                                <img src="/uploads/groups/<?= htmlspecialchars($group['cover_image']) ?>" 
                                     class="card-img-top" 
                                     style="height: 150px; object-fit: cover;">
                            <?php else: ?>
                                <div class="bg-secondary" style="height: 150px;"></div>
                            <?php endif; ?>
                            
                            <!-- Badges -->
                            <div class="position-absolute top-0 end-0 m-2">
                                <?php if ($group['is_private']): ?>
                                    <span class="badge bg-dark">
                                        <i class="fas fa-lock"></i> Privé
                                    </span>
                                <?php endif; ?>
                                <span class="badge bg-info">
                                    <?= ucfirst($group['type']) ?>
                                </span>
                            </div>
                        </div>
                        
                        <div class="card-body">
                            <h5 class="card-title">
                                <a href="/groups/view/<?= $group['id'] ?>" class="text-decoration-none">
                                    <?= htmlspecialchars($group['name']) ?>
                                </a>
                            </h5>
                            <p class="card-text text-muted">
                                <?= htmlspecialchars(truncate($group['description'], 100)) ?>
                            </p>
                        </div>
                        
                        <div class="card-footer bg-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="fas fa-users"></i> 
                                    <?= $group['member_count'] ?> membres
                                </small>
                                
                                <?php if ($group['user_role']): ?>
                                    <span class="badge bg-<?= $group['user_role'] === 'admin' ? 'primary' : 'secondary' ?>">
                                        <?= $group['user_role'] === 'admin' ? 'Admin' : 'Membre' ?>
                                    </span>
                                <?php else: ?>
                                    <a href="/groups/join/<?= $group['id'] ?>" class="btn btn-sm btn-success">
                                        Rejoindre
                                    </a>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        
        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
            <nav class="mt-4">
                <ul class="pagination justify-content-center">
                    <li class="page-item <?= $currentPage <= 1 ? 'disabled' : '' ?>">
                        <a class="page-link" href="?<?= http_build_query(array_merge($_GET, ['p' => $currentPage - 1])) ?>">
                            &laquo; Précédent
                        </a>
                    </li>
                    
                    <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                        <li class="page-item <?= $i == $currentPage ? 'active' : '' ?>">
                            <a class="page-link" href="?<?= http_build_query(array_merge($_GET, ['p' => $i])) ?>">
                                <?= $i ?>
                            </a>
                        </li>
                    <?php endfor; ?>
                    
                    <li class="page-item <?= $currentPage >= $totalPages ? 'disabled' : '' ?>">
                        <a class="page-link" href="?<?= http_build_query(array_merge($_GET, ['p' => $currentPage + 1])) ?>">
                            Suivant &raquo;
                        </a>
                    </li>
                </ul>
            </nav>
        <?php endif; ?>
    <?php endif; ?>
</div>

<script nonce="<?= $nonce ?>">
// Fonction pour tronquer le texte
function truncate(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Gestion AJAX pour rejoindre un groupe
document.querySelectorAll('.join-group').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const groupId = button.dataset.groupId;
        
        try {
            const response = await fetch(`/api/groups/${groupId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': '<?= $_SESSION['csrf_token'] ?>'
                }
            });
            
            const data = await response.json();
            if (data.success) {
                location.reload();
            } else {
                alert(data.message || 'Erreur lors de la tentative de rejoindre le groupe');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur réseau');
        }
    });
});
</script>