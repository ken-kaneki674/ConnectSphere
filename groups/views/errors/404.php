<?php
// Définit le code de réponse HTTP
http_response_code(404);
?>

<div class="container my-5">
    <div class="row justify-content-center">
        <div class="col-md-8 text-center">
            <!-- Illustration visuelle -->
            <div class="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            </div>

            <!-- Message principal -->
            <h1 class="display-4 text-danger mb-3">404 - Page non trouvée</h1>
            <p class="lead mb-4">Désolé, la page que vous recherchez n'existe pas ou a été déplacée.</p>

            <!-- Suggestions -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body">
                    <h5 class="card-title">Essayez ceci :</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2">
                            <i class="fas fa-search me-2 text-primary"></i>
                            Vérifiez l'URL dans la barre d'adresse
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-home me-2 text-primary"></i>
                            <a href="/" class="text-decoration-none">Retour à la page d'accueil</a>
                        </li>
                        <li>
                            <i class="fas fa-envelope me-2 text-primary"></i>
                            <a href="mailto:support@connectsphere.com" class="text-decoration-none">Contactez le support</a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Recherche interne -->
            <div class="mb-4">
                <p>Ou essayez une recherche :</p>
                <form action="/search" method="get" class="w-75 mx-auto">
                    <div class="input-group">
                        <input type="text" name="q" class="form-control" placeholder="Rechercher sur ConnectSphere...">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Boutons d'action -->
            <div class="d-flex justify-content-center gap-3">
                <a href="/" class="btn btn-primary px-4">
                    <i class="fas fa-home me-2"></i>Accueil
                </a>
                <?php if (isset($_SESSION['user_id'])): ?>
                    <a href="/profile" class="btn btn-outline-primary px-4">
                        <i class="fas fa-user me-2"></i>Mon profil
                    </a>
                <?php else: ?>
                    <a href="/login" class="btn btn-outline-primary px-4">
                        <i class="fas fa-sign-in-alt me-2"></i>Connexion
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Journalisation de l'erreur (pour les admins) -->
<?php if (isset($_SESSION['is_admin']) && $_SESSION['is_admin']): ?>
    <div class="container mt-5">
        <div class="card border-danger">
            <div class="card-header bg-danger text-white">
                Détails techniques (Admin seulement)
            </div>
            <div class="card-body">
                <h5>Requête non trouvée :</h5>
                <code><?= htmlspecialchars($_SERVER['REQUEST_URI']) ?></code>
                
                <h5 class="mt-3">Stack Trace :</h5>
                <pre class="bg-light p-3"><?php debug_print_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS) ?></pre>
                
                <h5 class="mt-3">Référent :</h5>
                <p><?= isset($_SERVER['HTTP_REFERER']) ? htmlspecialchars($_SERVER['HTTP_REFERER']) : 'Aucun' ?></p>
            </div>
        </div>
    </div>
<?php endif; ?>