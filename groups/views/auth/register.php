<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h4 class="mb-0">Créer un compte</h4>
                </div>
                <div class="card-body">
                    <form id="registerForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="username">Nom d'utilisateur</label>
                                    <input type="text" class="form-control" id="username" name="username" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="email" class="form-control" id="email" name="email" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="password">Mot de passe</label>
                                    <input type="password" class="form-control" id="password" name="password" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="confirm_password">Confirmer le mot de passe</label>
                                    <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="bio">Bio (optionnelle)</label>
                            <textarea class="form-control" id="bio" name="bio" rows="2"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="profile_picture">Photo de profil (optionnelle)</label>
                            <input type="file" class="form-control-file" id="profile_picture" name="profile_picture">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">S'inscrire</button>
                    </form>
                    <div class="text-center mt-3">
                        <a href="?page=login">Déjà un compte ? Se connecter</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    $('#registerForm').submit(function(e) {
        e.preventDefault();
        
        // Vérification du mot de passe
        if ($('#password').val() !== $('#confirm_password').val()) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        const formData = new FormData(this);
        
        $.ajax({
            url: 'api/auth/register.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                if (response.success) {
                    window.location.href = '?page=login';
                } else {
                    alert(response.message);
                }
            }
        });
    });
});
</script>