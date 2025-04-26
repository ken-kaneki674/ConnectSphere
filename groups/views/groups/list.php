<?php
/**
 * Vue pour lister les groupes
 * 
 * @var array $groups Liste des groupes à afficher
 * @var array $currentUser Informations sur l'utilisateur connecté
 * @var string $searchQuery Terme de recherche (optionnel)
 */
?>

<div class="container mt-4">
    <!-- Barre de recherche et filtre -->
    <div class="row mb-4">
        <div class="col-md-8">
            <form method="get" class="search-form">
                <div class="input-group">
                    <input type="text" 
                           name="q" 
                           class="form-control" 
                           placeholder="Rechercher des groupes..." 
                           value="<?= htmlspecialchars($searchQuery ?? '') ?>">
                    <select name="type" class="form-select" style="max-width: 150px;">
                        <option value="">Tous types</option>
                        <option value="publication" <?= ($_GET['type'] ?? '') === 'publication' ? 'selected' : '' ?>>Groupes de publication</option>
                        <option value="discussion" <?= ($_GET['type'] ?? '') === 'discussion' ? 'selected' : '' ?>>Groupes de discussion</option>
                    </select>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </form>
        </div>
        <div class="col-md-4 text-end">
            <a href="/groups/create" class="btn btn-success">
                <i class="fas fa-plus-circle"></i> Créer un groupe
            </a>
        </div>
    </div>

    <!-- Onglets -->
    <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
            <a class="nav-link <?= !isset($_GET['filter']) ? 'active' : '' ?>" 
               href="?page=groups">Tous les groupes</a>
        </li>
        <li class="nav-item">
            <a class="nav-link <?= ($_GET['filter'] ?? '') === 'my' ? 'active' : '' ?>" 
               href="?page=groups&filter=my">Mes groupes</a>
        </li>
        <li class="nav-item">
            <a class="nav-link <?= ($_GET['filter'] ?? '') === 'popular' ? 'active' : '' ?>" 
               href="?page=groups&filter=popular">Populaires</a>
        </li>
    </ul>

    <!-- Liste des groupes -->
    <?php if (empty($groups)): ?>
        <div class="alert alert-info text-center py-4">
            <i class="fas fa-users fs-1 mb-3"></i>
            <h4>Aucun groupe trouvé</h4>
            <p class="mb-0">Soyez le premier à créer un groupe !</p>
        </div>
    <?php else: ?>
        <div class="row">
            <?php foreach ($groups as $group): ?>
                <?php
                $isMember = false;
                $isAdmin = false;
                
                // Vérifier l'appartenance au groupe
                if (isset($currentUser)) {
                    foreach ($group['members'] ?? [] as $member) {
                        if ($member['id'] === $currentUser['id']) {
                            $isMember = true;
                            $isAdmin = $member['role'] === 'admin';
                            break;
                        }
                    }
                }
                ?>
                
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100 shadow-sm group-card">
                        <!-- Image de couverture -->
                        <?php if ($group['cover_image']): ?>
                            <img src="/uploads/groups/<?= htmlspecialchars($group['cover_image']) ?>" 
                                 class="card-img-top cover-image" 
                                 alt="Image de couverture du groupe <?= htmlspecialchars($group['name']) ?>">
                        <?php else: ?>
                            <div class="cover-image-placeholder bg-secondary"></div>
                        <?php endif; ?>
                        
                        <!-- Badge de type de groupe -->
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-<?= $group['group_type'] === 'publication' ? 'info' : 'primary' ?>">
                                <?= $group['group_type'] === 'publication' ? 'Publication' : 'Discussion' ?>
                            </span>
                            <?php if ($group['is_private']): ?>
                                <span class="badge bg-warning">
                                    <i class="fas fa-lock"></i> Privé
                                </span>
                            <?php endif; ?>
                        </div>
                        
                        <div class="card-body">
                            <!-- Titre et description -->
                            <h5 class="card-title">
                                <a href="?page=groups&action=view&id=<?= $group['id'] ?>" 
                                   class="text-decoration-none">
                                    <?= htmlspecialchars($group['name']) ?>
                                </a>
                            </h5>
                            
                            <p class="card-text text-muted">
                                <?= nl2br(htmlspecialchars(truncate($group['description'] ?? '', 120))) ?>
                            </p>
                            
                            <!-- Métriques -->
                            <div class="d-flex justify-content-between small text-muted mb-3">
                                <div>
                                    <i class="fas fa-users"></i> 
                                    <?= $group['member_count'] ?? count($group['members'] ?? []) ?> membres
                                </div>
                                <div>
                                    Créé <?= formatDate($group['created_at']) ?>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Actions -->
                        <div class="card-footer bg-white">
                            <?php if ($isMember): ?>
                                <?php if ($isAdmin): ?>
                                    <span class="badge bg-danger me-2">
                                        <i class="fas fa-crown"></i> Admin
                                    </span>
                                <?php endif; ?>
                                <a href="?page=groups&action=leave&id=<?= $group['id'] ?>" 
                                   class="btn btn-outline-danger btn-sm">
                                    Quitter
                                </a>
                            <?php else: ?>
                                <a href="?page=groups&action=join&id=<?= $group['id'] ?>" 
                                   class="btn btn-primary btn-sm">
                                    Rejoindre
                                </a>
                            <?php endif; ?>
                            
                            <a href="?page=groups&action=view&id=<?= $group['id'] ?>" 
                               class="btn btn-outline-secondary btn-sm float-end">
                                Voir détails
                            </a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        
        <!-- Pagination -->
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                <li class="page-item <?= ($currentPage ?? 1) <= 1 ? 'disabled' : '' ?>">
                    <a class="page-link" href="?page=groups&p=<?= ($currentPage ?? 1) - 1 ?>">
                        &laquo; Précédent
                    </a>
                </li>
                <?php for ($i = 1; $i <= ($totalPages ?? 1); $i++): ?>
                    <li class="page-item <?= ($currentPage ?? 1) === $i ? 'active' : '' ?>">
                        <a class="page-link" href="?page=groups&p=<?= $i ?>">
                            <?= $i ?>
                        </a>
                    </li>
                <?php endfor; ?>
                <li class="page-item <?= ($currentPage ?? 1) >= ($totalPages ?? 1) ? 'disabled' : '' ?>">
                    <a class="page-link" href="?page=groups&p=<?= ($currentPage ?? 1) + 1 ?>">
                        Suivant &raquo;
                    </a>
                </li>
            </ul>
        </nav>
    <?php endif; ?>
</div>

<!-- CSS intégré pour cette vue -->
<style>
    .group-card {
        transition: transform 0.2s;
    }
    .group-card:hover {
        transform: translateY(-5px);
    }
    .cover-image {
        height: 150px;
        object-fit: cover;
    }
    .cover-image-placeholder {
        height: 150px;
        opacity: 0.1;
    }
    .search-form .form-select {
        width: auto;
    }
</style>

<!-- Fonctions utilitaires (à déplacer dans un helper si réutilisées) -->
<?php
function truncate(string $text, int $length): string {
    if (strlen($text) <= $length) return $text;
    return substr($text, 0, $length) . '...';
}

function formatDate(string $date): string {
    $now = new DateTime();
    $date = new DateTime($date);
    $diff = $now->diff($date);
    
    if ($diff->y > 0) return "il y a {$diff->y} an" . ($diff->y > 1 ? 's' : '');
    if ($diff->m > 0) return "il y a {$diff->m} mois";
    if ($diff->d > 1) return "il y a {$diff->d} jours";
    if ($diff->d == 1) return "hier";
    return "aujourd'hui";
}
?>