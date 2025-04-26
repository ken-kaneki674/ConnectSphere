<?php http_response_code(500); ?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erreur Serveur</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6 text-center">
                <div class="card shadow">
                    <div class="card-header bg-danger text-white">
                        <h2><i class="fas fa-exclamation-triangle"></i> Erreur 500</h2>
                    </div>
                    <div class="card-body">
                        <p class="lead">Une erreur interne du serveur s'est produite</p>
                        
                        <?php if (ENVIRONMENT === 'development'): ?>
                            <div class="alert alert-warning mt-3">
                                <strong>Détails techniques :</strong>
                                <pre class="mt-2"><?= htmlspecialchars($e->getMessage()) ?></pre>
                            </div>
                        <?php endif; ?>

                        <a href="/" class="btn btn-primary mt-3">
                            <i class="fas fa-home"></i> Retour à l'accueil
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>