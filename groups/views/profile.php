<?php
require_once '../models/User.php';
$userModel = new User($db);

// Par défaut, affiche le profil de l'utilisateur connecté
$profileId = $_GET['id'] ?? $_SESSION['user_id'];
$isOwnProfile = ($profileId == $_SESSION['user_id']);
$user = $userModel->getUserById($profileId);

if (!$user) {
    echo '<div class="alert alert-danger">Utilisateur non trouvé</div>';
    return;
}
?>

<div class="container mt-4">
    <div class="row">
        <!-- Colonne de gauche - Profil -->
        <div class="col-md-4">
            <div class="card">
                <div class="card-body text-center">
                    <img src="uploads/profiles/<?= $user['profile_picture'] ?? 'default.jpg' ?>" 
                         class="rounded-circle mb-3" width="150" height="150">
                    <h3><?= htmlspecialchars($user['username']) ?></h3>
                    <p class="text-muted"><?= htmlspecialchars($user['bio'] ?? 'Pas de bio') ?></p>
                    
                    <?php if ($isOwnProfile): ?>
                        <a href="?page=profile&action=edit" class="btn btn-outline-primary btn-block">
                            <i class="fas fa-edit"></i> Modifier le profil
                        </a>
                    <?php else: ?>
                        <button class="btn btn-outline-primary btn-block" id="friendBtn">
                            <i class="fas fa-user-plus"></i> 
                            <span id="friendStatus">Ajouter comme ami</span>
                        </button>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Colonne de droite - Contenu -->
        <div class="col-md-8">
            <?php if (isset($_GET['action']) && $_GET['action'] === 'edit' && $isOwnProfile): ?>
                <!-- Formulaire d'édition -->
                <div class="card">
                    <div class="card-header">
                        <h4>Modifier le profil</h4>
                    </div>
                    <div class="card-body">
                        <form id="editProfileForm" enctype="multipart/form-data">
                            <div class="form-group">
                                <label>Photo de profil</label>
                                <div class="custom-file">
                                    <input type="file" class="custom-file-input" id="profilePicture" name="profile_picture">
                                    <label class="custom-file-label" for="profilePicture">Choisir une image</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Bio</label>
                                <textarea class="form-control" name="bio" rows="3"><?= htmlspecialchars($user['bio'] ?? '') ?></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Enregistrer</button>
                        </form>
                    </div>
                </div>
            <?php else: ?>
                <!-- Publications de l'utilisateur -->
                <div class="card">
                    <div class="card-header">
                        <ul class="nav nav-tabs card-header-tabs">
                            <li class="nav-item">
                                <a class="nav-link active" href="#posts" data-toggle="tab">Publications</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#friends" data-toggle="tab">Amis</a>
                            </li>
                        </ul>
                    </div>
                    <div class="card-body tab-content">
                        <div class="tab-pane active" id="posts">
                            <?php if ($isOwnProfile): ?>
                                <form id="createPostForm" class="mb-4">
                                    <div class="form-group">
                                        <textarea class="form-control" name="content" rows="3" 
                                                  placeholder="Partagez quelque chose..."></textarea>
                                    </div>
                                    <div class="form-group">
                                        <input type="file" class="form-control-file" name="image">
                                    </div>
                                    <button type="submit" class="btn btn-primary">Publier</button>
                                </form>
                            <?php endif; ?>

                            <div id="userPosts">
                                <!-- Les publications seront chargées ici via AJAX -->
                                <div class="text-center">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="sr-only">Chargement...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane" id="friends">
                            <div class="row" id="friendsList">
                                <!-- La liste d'amis sera chargée ici via AJAX -->
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    const profileId = <?= $profileId ?>;
    const isOwnProfile = <?= $isOwnProfile ? 'true' : 'false' ?>;

    // Charger les publications
    $.get(`api/posts/user.php?user_id=${profileId}`, function(data) {
        if (data.success) {
            let html = '';
            data.posts.forEach(post => {
                html += `
                <div class="post mb-4 border-bottom pb-4">
                    <div class="d-flex mb-3">
                        <img src="uploads/profiles/${post.user_avatar || 'default.jpg'}" 
                             class="rounded-circle mr-3" width="50" height="50">
                        <div>
                            <h5>${post.username}</h5>
                            <small class="text-muted">${new Date(post.created_at).toLocaleString()}</small>
                        </div>
                    </div>
                    <p>${post.content}</p>
                    ${post.image ? `<img src="uploads/posts/${post.image}" class="img-fluid mb-3 rounded">` : ''}
                </div>`;
            });
            $('#userPosts').html(html || '<p>Aucune publication</p>');
        }
    });

    // Charger les amis (si ce n'est pas notre propre profil)
    if (!isOwnProfile) {
        $.get(`api/friends/status.php?friend_id=${profileId}`, function(response) {
            if (response.success) {
                const status = response.status;
                let btnText = 'Ajouter comme ami';
                let disabled = false;

                if (status === 'pending') {
                    btnText = 'Demande en attente';
                    disabled = true;
                } else if (status === 'friends') {
                    btnText = 'Ami';
                }

                $('#friendStatus').text(btnText);
                if (disabled) {
                    $('#friendBtn').prop('disabled', true);
                }
            }
        });

        // Gestion du bouton ami
        $('#friendBtn').click(function() {
            $.post('api/friends/action.php', { 
                action: 'add', 
                friend_id: profileId 
            }, function(response) {
                if (response.success) {
                    $('#friendStatus').text('Demande en attente');
                    $('#friendBtn').prop('disabled', true);
                }
            });
        });
    }
});
</script>