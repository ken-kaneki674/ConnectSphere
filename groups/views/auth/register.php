<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h4 class="mb-0">Inscription</h4>
                </div>
                <div class="card-body">
                    <!-- Conteneur d'erreurs générales -->
                    <div id="form-errors" class="mb-3"></div>
                    
                    <form id="registerForm" enctype="multipart/form-data">
                        <input type="hidden" name="csrf_token" value="<?= generateCsrfToken() ?>">
                        <!-- Champ Username -->
                        <div class="mb-3">
                            <label for="username" class="form-label">Nom d'utilisateur</label>
                            <input type="text" class="form-control" id="username" name="username" required>
                            <div id="username-feedback" class="invalid-feedback"></div>
                        </div>
                        
                        <!-- Champ Email -->
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email" required>
                            <div id="email-feedback" class="invalid-feedback"></div>
                        </div>
                        
                        <!-- Champ Mot de passe -->
                        <div class="mb-3">
                            <label for="password" class="form-label">Mot de passe</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                            <div id="password-feedback" class="invalid-feedback"></div>
                        </div>
                        
                        <!-- Confirmation mot de passe -->
                        <div class="mb-3">
                            <label for="password_confirm" class="form-label">Confirmez le mot de passe</label>
                            <input type="password" class="form-control" id="password_confirm" name="password_confirm" required>
                            <div id="password_confirm-feedback" class="invalid-feedback"></div>
                        </div>
                        
                        <!-- Photo de profil -->
                        <div class="mb-3">
                            <label for="profile_picture" class="form-label">Photo de profil (optionnel)</label>
                            <input type="file" class="form-control" id="profile_picture" name="profile_picture" accept="image/jpeg, image/png">
                            <div id="profile_picture-feedback" class="invalid-feedback"></div>
                            <div class="form-text">Formats acceptés : JPEG, PNG (max 2MB)</div>
                        </div>
                        
                        <!-- Bio -->
                        <div class="mb-3">
                            <label for="bio" class="form-label">Bio (optionnel)</label>
                            <textarea class="form-control" id="bio" name="bio" rows="3"></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-100 py-2">
                            S'inscrire
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>


<script>
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        
        try {
            // Désactiver le bouton
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> En cours...';
            
            // Envoyer les données
            const formData = new FormData(form);
            const response = await fetch('api/auth/register.php', {
                method: 'POST',
                body: formData
            });
            
            // Vérifier la réponse
            if (!response.ok) throw response;
            const data = await response.json();
            
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                showFormErrors(data.errors || { form: data.message });
            }
        } catch (error) {
            if (error.json) {
                error.json().then(errData => {
                    showFormErrors(errData.errors || { form: errData.message });
                });
            } else {
                showFormErrors({ form: 'Erreur réseau' });
            }
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
    
    function showFormErrors(errors) {
        // Réinitialiser les erreurs
        document.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        
        document.querySelectorAll('.invalid-feedback').forEach(el => {
            el.textContent = '';
        });
        
        // Afficher les nouvelles erreurs
        for (const [field, message] of Object.entries(errors)) {
            const input = document.getElementById(field);
            const feedback = document.getElementById(`${field}-feedback`);
            
            if (input) input.classList.add('is-invalid');
            if (feedback) feedback.textContent = message;
        }
    }
});
</script>