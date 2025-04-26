<?php
/**
 * Vue pour créer un nouveau groupe
 */
?>
<div class="container py-4">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h2 class="h4 mb-0"><i class="fas fa-plus-circle me-2"></i>Créer un nouveau groupe</h2>
                </div>
                <div class="card-body">
                    <form id="createGroupForm" enctype="multipart/form-data">
                        <!-- Token CSRF -->
                        <input type="hidden" name="csrf_token" value="<?= generateCsrfToken() ?>">
                        
                        <!-- Nom du groupe -->
                        <div class="mb-3">
                            <label for="groupName" class="form-label">Nom du groupe *</label>
                            <input type="text" class="form-control" id="groupName" name="name" required
                                   minlength="3" maxlength="50"
                                   placeholder="Donnez un nom à votre groupe">
                            <div class="invalid-feedback">Le nom doit contenir entre 3 et 50 caractères</div>
                        </div>
                        
                        <!-- Description -->
                        <div class="mb-3">
                            <label for="groupDescription" class="form-label">Description *</label>
                            <textarea class="form-control" id="groupDescription" name="description" 
                                      rows="3" required maxlength="500"
                                      placeholder="Décrivez l'objectif de ce groupe"></textarea>
                            <div class="invalid-feedback">La description est obligatoire (500 caractères max)</div>
                        </div>
                        
                        <!-- Type de groupe -->
                        <div class="mb-3">
                            <label class="form-label">Type de groupe *</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="type" 
                                       id="typePublication" value="publication" checked>
                                <label class="form-check-label" for="typePublication">
                                    <i class="fas fa-newspaper text-info me-1"></i> Groupe de publication
                                    <small class="text-muted d-block">Pour partager des posts et articles</small>
                                </label>
                            </div>
                            <div class="form-check mt-2">
                                <input class="form-check-input" type="radio" name="type" 
                                       id="typeDiscussion" value="discussion">
                                <label class="form-check-label" for="typeDiscussion">
                                    <i class="fas fa-comments text-primary me-1"></i> Groupe de discussion
                                    <small class="text-muted d-block">Pour échanger en temps réel</small>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Visibilité -->
                        <div class="mb-3">
                            <label for="groupVisibility" class="form-label">Visibilité *</label>
                            <select class="form-select" id="groupVisibility" name="is_private">
                                <option value="0">Public</option>
                                <option value="1">Privé</option>
                            </select>
                            <small class="text-muted">
                                Les groupes publics sont visibles par tous, les groupes privés nécessitent une invitation
                            </small>
                        </div>
                        
                        <!-- Image de couverture -->
                        <div class="mb-4">
                            <label for="groupCover" class="form-label">Image de couverture</label>
                            <input type="file" class="form-control" id="groupCover" 
                                   name="cover_image" accept="image/jpeg, image/png">
                            <small class="text-muted">
                                Formats acceptés : JPEG, PNG (max 2MB). Taille recommandée : 1200x400px
                            </small>
                            <div class="invalid-feedback">Format ou taille invalide</div>
                            <!-- Aperçu de l'image -->
                            <div class="mt-2 text-center">
                                <img id="coverPreview" src="#" alt="Aperçu de l'image" 
                                     class="img-fluid rounded d-none" style="max-height: 200px;">
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary py-2">
                                <i class="fas fa-save me-1"></i> Créer le groupe
                            </button>
                            <a href="?page=groups" class="btn btn-outline-secondary">
                                Annuler
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Scripts spécifiques -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Aperçu de l'image
    document.getElementById('groupCover').addEventListener('change', function(e) {
        const preview = document.getElementById('coverPreview');
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.classList.remove('d-none');
            }
            reader.readAsDataURL(file);
        }
    });
    
    // Validation du formulaire
    const form = document.getElementById('createGroupForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Création en cours...';
            
            const formData = new FormData(form);
            const response = await fetch('api/groups/create.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) throw data;
            
            window.location.href = `?page=groups&action=view&id=${data.group_id}`;
            
        } catch (error) {
            console.error(error);
            alert(error.message || 'Une erreur est survenue');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
});
</script>

<!-- Style spécifique -->
<style>
#coverPreview {
    border: 2px dashed #dee2e6;
    transition: all 0.3s;
}
#coverPreview:hover {
    border-color: #0d6efd;
}
.form-check-label small {
    font-size: 0.8em;
}
</style>