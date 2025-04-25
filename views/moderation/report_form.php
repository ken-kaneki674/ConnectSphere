<div class="card shadow-sm">
    <div class="card-header bg-primary text-white">
        <h3 class="mb-0">
            <i class="bi bi-flag-fill me-2"></i>
            Signaler <?= $targetType === 'user' ? 'un utilisateur' : 'une publication' ?>
        </h3>
    </div>
    
    <div class="card-body">
        <form method="post" action="<?= $baseUrl ?>/moderation.php">
            <input type="hidden" name="target_type" value="<?= htmlspecialchars($targetType) ?>">
            <input type="hidden" name="target_id" value="<?= (int)$targetId ?>">
            
            <div class="mb-3">
                <label for="reportReason" class="form-label">Raison du signalement</label>
                <select class="form-select" id="reportReason" name="reason" required>
                    <option value="">Sélectionnez une raison...</option>
                    <option value="spam">Spam ou publicité</option>
                    <option value="inappropriate">Contenu inapproprié</option>
                    <option value="harassment">Harcèlement</option>
                    <option value="hate_speech">Discours haineux</option>
                    <option value="other">Autre</option>
                </select>
            </div>
            
            <div class="mb-3">
                <label for="reportDetails" class="form-label">Détails supplémentaires</label>
                <textarea class="form-control" id="reportDetails" name="details" rows="4" 
                          placeholder="Décrivez brièvement le problème..."></textarea>
            </div>
            
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="button" class="btn btn-secondary me-md-2" onclick="history.back()">
                    <i class="bi bi-arrow-left me-1"></i> Annuler
                </button>
                <button type="submit" name="report_submit" class="btn btn-danger">
                    <i class="bi bi-send-fill me-1"></i> Envoyer le signalement
                </button>
            </div>
        </form>
    </div>
</div>