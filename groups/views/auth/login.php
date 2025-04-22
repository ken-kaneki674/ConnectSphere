<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h4 class="mb-0">Connexion</h4>
                </div>
                <div class="card-body">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" class="form-control" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Mot de passe</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                        <div class="form-group form-check">
                            <input type="checkbox" class="form-check-input" id="remember" name="remember">
                            <label class="form-check-label" for="remember">Se souvenir de moi</label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Se connecter</button>
                    </form>
                    <div class="text-center mt-3">
                        <a href="?page=register">Pas encore de compte ? S'inscrire</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        
        const formData = $(this).serialize();
        
        $.post('api/auth/login.php', formData, function(response) {
            if (response.success) {
                window.location.href = '?page=home';
            } else {
                alert(response.message);
            }
        });
    });
});
</script>