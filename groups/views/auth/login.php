<?php
// Vérifie si l'utilisateur est déjà connecté
require_once $_SERVER['DOCUMENT_ROOT'] . '/config/auth.php';
if (isLoggedIn()) {
    header('Location: /home');
    exit;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - ConnectSphere</title>
    <!-- Bootstrap 5 CSS -->
    <link href="/assets/css/bootstrap.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="/assets/css/all.min.css">
    <!-- CSS personnalisé -->
    <link href="/assets/css/auth.css" rel="stylesheet">
</head>
<body class="auth-page">
    <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
            <div class="col-lg-5 col-md-7">
                <div class="card auth-card shadow-lg">
                    <div class="card-header bg-primary text-white text-center py-4">
                        <h2><i class="fas fa-users me-2"></i>ConnectSphere</h2>
                        <p class="mb-0">Connectez-vous à votre compte</p>
                    </div>
                    <div class="card-body p-4">
                        <!-- Messages d'erreur/succès -->
                        <div id="auth-message" class="alert alert-danger d-none"></div>
                        
                        <form id="loginForm" novalidate>
                            <!-- Token CSRF -->
                            <input type="hidden" id="csrf_token" name="csrf_token" value="<?= generateCsrfToken() ?>">
                            
                            <!-- Champ Email -->
                            <div class="mb-3">
                                <label for="email" class="form-label">Adresse Email</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                    <input type="email" class="form-control" id="email" name="email" 
                                           required autocomplete="email" autofocus
                                           placeholder="votre@email.com">
                                </div>
                                <div class="invalid-feedback">Veuillez entrer une adresse email valide</div>
                            </div>
                            
                            <!-- Champ Mot de passe -->
                            <div class="mb-3">
                                <label for="password" class="form-label">Mot de passe</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                    <input type="password" class="form-control" id="password" name="password" 
                                           required autocomplete="current-password"
                                           placeholder="••••••••">
                                    <button class="btn btn-outline-secondary toggle-password" type="button">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div class="invalid-feedback">Veuillez entrer votre mot de passe</div>
                            </div>
                            
                            <!-- Options -->
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="remember" name="remember">
                                    <label class="form-check-label" for="remember">Se souvenir de moi</label>
                                </div>
                                <a href="/forgot-password" class="text-decoration-none">Mot de passe oublié ?</a>
                            </div>
                            
                            <!-- Bouton de soumission -->
                            <button type="submit" class="btn btn-primary w-100 py-2" id="loginBtn">
                                <span class="spinner-border spinner-border-sm d-none" role="status"></span>
                                <span class="btn-text">Se connecter</span>
                            </button>
                            
                            <!-- Séparateur -->
                            <div class="text-center my-3 text-muted">OU</div>
                            
                            <!-- Boutons sociaux -->
                            <div class="d-grid gap-2">
                                <a href="#" class="btn btn-outline-primary">
                                    <i class="fab fa-google me-2"></i>Continuer avec Google
                                </a>
                                <a href="#" class="btn btn-outline-dark">
                                    <i class="fab fa-github me-2"></i>Continuer avec GitHub
                                </a>
                            </div>
                        </form>
                    </div>
                    <div class="card-footer text-center py-3">
                        <p class="mb-0">Pas encore de compte ? <a href="/register" class="text-decoration-none">S'inscrire</a></p>
                    </div>
                </div>
                
                <!-- Mentions légales -->
                <div class="text-center mt-3 text-muted small">
                    En vous connectant, vous acceptez nos <a href="#" class="text-decoration-none">Conditions d'utilisation</a> 
                    et notre <a href="#" class="text-decoration-none">Politique de confidentialité</a>.
                </div>
            </div>
        </div>
    </div>

    <!-- JavaScript -->
    <script src="/assets/js/jquery.js"></script>
    <script src="/assets/js/bootstrap.js"></script>
    <script>
    $(document).ready(function() {
        console.log('Document ready');
        
        // Afficher/masquer le mot de passe
        $('.toggle-password').click(function() {
            const icon = $(this).find('i');
            const input = $('#password');
            if (input.attr('type') === 'password') {
                input.attr('type', 'text');
                icon.removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                input.attr('type', 'password');
                icon.removeClass('fa-eye-slash').addClass('fa-eye');
            }
        });

        // Fonction pour afficher les erreurs
        function showError(message) {
            const alert = $('#auth-message');
            alert.removeClass('d-none').addClass('alert-danger');
            alert.html(`<i class="fas fa-exclamation-circle me-2"></i>${message}`);
            alert[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Validation du formulaire
        $('#loginForm').on('submit', function(e) {
            console.log('Form submission intercepted');
            e.preventDefault();
            
            const form = $(this);
            const btn = $('#loginBtn');
            
            // Validation frontale
            if (!form[0].checkValidity()) {
                console.log('Form validation failed');
                e.stopPropagation();
                form.addClass('was-validated');
                return;
            }

            // Désactiver le bouton
            btn.prop('disabled', true);
            btn.find('.spinner-border').removeClass('d-none');
            btn.find('.btn-text').text('Connexion...');

            // Envoyer les données
            $.ajax({
                url: '/api/auth/login.php',
                type: 'POST',
                data: form.serialize(),
                dataType: 'json',
                success: function(response) {
                    console.log('API response:', response);
                    if (response.success) {
                        window.location.href = response.redirect || '/home';
                    } else {
                        showError(response.message || 'Identifiants incorrects');
                    }
                },
                error: function(xhr) {
                    console.log('API error:', xhr);
                    let message = 'Erreur lors de la connexion';
                    try {
                        const response = JSON.parse(xhr.responseText);
                        message = response.message || message;
                    } catch (e) {
                        message = xhr.statusText || message;
                    }
                    showError(message);
                },
                complete: function() {
                    btn.prop('disabled', false);
                    btn.find('.spinner-border').addClass('d-none');
                    btn.find('.btn-text').text('Se connecter');
                }
            });
        });
    });
    </script>
</body>
</html>