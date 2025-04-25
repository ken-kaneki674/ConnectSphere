<div class="card shadow-sm">
    <div class="card-header bg-primary text-white">
        <h3 class="mb-0">
            <i class="bi bi-speedometer2 me-2"></i>Tableau de bord de modération
        </h3>
    </div>
    
    <div class="card-body">
        <?php if (empty($reports)): ?>
            <div class="alert alert-info">
                <i class="bi bi-info-circle-fill me-2"></i>Aucun signalement à afficher
            </div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Raison</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($reports as $report): ?>
                        <tr>
                            <td><?= $report['id'] ?></td>
                            <td><?= ucfirst($report['target_type']) ?></td>
                            <td><?= htmlspecialchars($report['reason']) ?></td>
                            <td><?= date('d/m/Y H:i', strtotime($report['created_at'])) ?></td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <a href="<?= $baseUrl ?>/moderation.php?action=report_form&target_type=user&target_id=1" 
                                       class="btn btn-outline-primary" title="Voir détails">
                                        <i class="bi bi-eye-fill"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
        
        <div class="mt-4">
            <a href="<?= $baseUrl ?>/moderation.php?action=report_form&target_type=user&target_id=1" 
               class="btn btn-primary me-2">
               <i class="bi bi-flag-fill me-1"></i> Nouveau signalement
            </a>
        </div>
    </div>
</div>