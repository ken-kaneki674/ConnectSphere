<?php
// Vérifie si l'utilisateur est connecté
$isLoggedIn = isset($_SESSION['user_id']);
?>

<div class="container mt-5">
    <div class="jumbotron text-center bg-light p-5 rounded">
        <h1 class="display-4">Bienvenue sur ConnectSphere</h1>
        <p class="lead">Le réseau social qui vous connecte à ce qui compte vraiment</p>
        <hr class="my-4">
        
        <?php if ($isLoggedIn): ?>
            <div class="row">
                <div class="col-md-4 mb-3">
                    <a href="/groups" class="btn btn-primary btn-block py-3">
                        <i class="fas fa-users fa-2x mb-2"></i><br>
                        Mes Groupes
                    </a>
                </div>
                <div class="col-md-4 mb-3">
                    <a href="/profile" class="btn btn-success btn-block py-3">
                        <i class="fas fa-user-circle fa-2x mb-2"></i><br>
                        Mon Profil
                    </a>
                </div>
                <div class="col-md-4 mb-3">
                    <a href="posts/create.php" class="btn btn-info btn-block py-3">
                        <i class="fas fa-edit fa-2x mb-2"></i><br>
                        Nouveau Post
                    </a>
                </div>
            </div>
        <?php else: ?>
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Commencez dès maintenant</h5>
                            <a href="/register" class="btn btn-primary btn-lg mr-3">S'inscrire</a>
                            <a href="/login" class="btn btn-outline-secondary btn-lg">Se connecter</a>
                        </div>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <?php if ($isLoggedIn): ?>
        <div class="row mt-5">
            <div class="col-md-8 mx-auto">
                <h3 class="text-center mb-4">Dernières activités</h3>
                <div class="card">
                    <div class="card-body" id="activity-feed">
                        <!-- Les activités seront chargées ici via AJAX -->
                        <div class="text-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="sr-only"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
        $(document).ready(function() {
            // Chargement des activités
            $.get('api/activities.php', function(data) {
                if (data.success) {
                    let html = '';
                    data.activities.forEach(activity => {
                        html += `
                        <div class="activity-item mb-3 p-3 border-bottom">
                            <div class="d-flex">
                                <img src="uploads/profiles/${activity.user_avatar || 'default.jpg'}" 
                                     class="rounded-circle mr-3" width="50" height="50">
                                <div>
                                    <h6>${activity.username}</h6>
                                    <p class="mb-1">${activity.content}</p>
                                    <small class="text-muted">${new Date(activity.created_at).toLocaleString()}</small>
                                </div>
                            </div>
                        </div>`;
                    });
                    $('#activity-feed').html(html || '<p>Aucune activité récente</p>');
                }
            });
        });
        </script>
    <?php endif; ?>
</div>