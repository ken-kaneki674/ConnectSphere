<?php
/**
 * Vue pour éditer un groupe
 */
$group = $group ?? null;
?>
<div class="container py-4">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h2 class="h4 mb-0"><i class="fas fa-edit me-2"></i>Modifier le groupe</h2>
                </div>
                <div class="card-body">
                    <?php if ($group): ?>
                        <form id="editGroupForm" enctype="multipart/form-data">
                            <input type="hidden" name="csrf_token" value="<?= generateCsrfToken() ?>">
                            
                            <!-- Nom du groupe -->
                            <div class="mb-3">
                                <label for="groupName" class="form-label">Nom du groupe *</label>
                                <input type="text" class="form-control" id="groupName" name="name" required
                                       value="<?= htmlspecialchars($group['name']) ?>"
                                       minlength="3" maxlength="50">
                                <div class="invalid-feedback">Le nom doit contenir entre 3 et 50 caractères</div>
                            </div>
                            
                            <!-- Description -->
                            <div class="mb-3">
                                <label for="groupDescription" class="form-label">Description *</label>
                                <textarea class="form-control" id="groupDescription" name="description" 
                                          rows="3" required maxlength="500"><?= 
                                    htmlspecialchars($group['description']) 
                                ?></textarea>
                                <div class="invalid-feedback">La description est obligatoire (500 caractères max)</div>
                            </div>
                            
                            <!-- Type de groupe -->
                            <div class="mb-3">
                                <label class="form-label">Type de groupe *</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="type" 
                                           id="typePublication" value="publication"
                                           <?= $group['group_type'] === 'publication' ? 'checked' : '' ?>>
                                    <label class="form-check-label" for="typePublication">
                                        <i class="fas fa-newspaper text-info me-1"></i> Groupe de publication
                                    </label>
                                </div>
                                <div class="form-check mt-2">
                                    <input class="form-check-input" type="radio" name="type" 
                                           id="typeDiscussion" value="discussion"
                                           <?= $group['group_type'] === 'discussion' ? 'checked' : '' ?>>
                                    <label class="form-check-label" for="typeDiscussion">
                                        <i class="fas fa-comments text-primary me-1"></i> Groupe de discussion
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Visibilité -->
                            <div class="mb-3">
                                <label for="groupVisibility" class="form-label">Visibilité *</label>
                                <select class="form-select" id="groupVisibility" name="is_private">
                                    <option value="0" <?= !$group['is_private'] ? 'selected' : '' ?>>Public</option>
                                    <option value="1" <?= $group['is_private'] ? 'selected' : '' ?>>Privé</option>
                                </select>
                            </div>
                            
                            <!-- Image de couverture -->
                            <div class="mb-4">
                                <label for="groupCover" class="form-label">Image de couverture</label>
                                <?php if ($group['cover_image']): ?>
                                    <div class="mb-2">
                                        <img src="/uploads/groups/<?= htmlspecialchars($group['cover_image']) ?>" 
                                             class="img-fluid rounded" style="max-height: 200px;">
                                        <div class="form-check mt-2">
                                            <input class="form-check-input" type="checkbox" 
                                                   id="removeCover" name="remove_cover">
                                            <label class="form-check-label" for="removeCover">
                                                Supprimer l'image actuelle
                                            </label>
                                        </div>
                                    </div>
                                <?php endif; ?>
                                <input type="file" class="form-control" id="groupCover" 
                                       name="cover_image" accept="image/jpeg, image/png">
                                <small class="text-muted">
                                    Formats acceptés : JPEG, PNG (max 2MB)
                                </small>
                            </div>
                            
                            <div class="d-flex justify-content-between">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> Enregistrer
                                </button>
                                <a href="/groups/view/<?= $group['id'] ?>" class="btn btn-outline-secondary">
                                    Annuler
                                </a>
                            </div>
                        </form>
                    <?php else: ?>
                        <div class="alert alert-danger">Groupe introuvable</div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('editGroupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enregistrement...';
        
        const formData = new FormData(form);
        const response = await fetch('/groups/update/<?= $group['id'] ?? 0 ?>', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de la mise à jour');
        }
        
        window.location.href = `/groups/view/<?= $group['id'] ?? 0 ?>`;
        
    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert(error.message);
        console.error('Erreur détaillée:', error);
    }
});
</script>