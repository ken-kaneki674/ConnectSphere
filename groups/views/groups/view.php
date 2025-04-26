<?php 
require_once __DIR__ . '/../../templates/header.php';
require_once __DIR__ . '/../../config/auth.php';

// Vérification de la session utilisateur
if (!isset($_SESSION['user_id'])) {
    header('Location: /login');
    exit;
}
?>

<div class="container mt-4">
    <?php if (isset($error)): ?>
        <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
    <?php elseif (isset($group) && isset($members)): ?>
        <div class="row">
            <div class="col-md-8">
                <!-- En-tête du groupe -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h3><?= htmlspecialchars($group['name']) ?></h3>
                        <p class="mb-0"><?= htmlspecialchars($group['description']) ?></p>
                    </div>
                    <?php if (!empty($group['cover_image'])): ?>
                        <img src="/uploads/groups/<?= htmlspecialchars($group['cover_image']) ?>" class="card-img-top" alt="Image de couverture">
                    <?php endif; ?>
                    <div class="card-body">
                        <?php if (!$isMember): ?>
                            <button id="joinGroupBtn" class="btn btn-success">Rejoindre ce groupe</button>
                        <?php else: ?>
                            <div class="d-flex justify-content-between align-items-center">
                                <p class="text-success mb-0">Vous êtes membre de ce groupe</p>
                                <?php if ($canEdit): ?>
                                    <a href="/groups/edit/<?= $groupId ?>" class="btn btn-outline-primary">Modifier le groupe</a>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Contenu selon le type de groupe -->
                <?php if ($group['group_type'] === 'publication'): ?>
                    <!-- Formulaire de publication -->
                    <?php if ($isMember): ?>
                        <div class="card mb-4">
                            <div class="card-body">
                                <form id="createPostForm" enctype="multipart/form-data">
                                    <input type="hidden" name="group_id" value="<?= $groupId ?>">
                                    <div class="form-group">
                                        <textarea class="form-control" name="content" rows="3" 
                                                  placeholder="Partagez quelque chose avec le groupe..." required></textarea>
                                    </div>
                                    <div class="form-group">
                                        <input type="file" class="form-control-file" name="image" accept="image/*">
                                    </div>
                                    <button type="submit" class="btn btn-primary">Publier</button>
                                </form>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Liste des publications -->
                    <div id="groupPosts" class="mb-4">
                        <!-- Contenu chargé via AJAX -->
                        <div class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="sr-only">Chargement...</span>
                            </div>
                        </div>
                    </div>
                <?php else: ?>
                    <!-- Chat de groupe -->
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>Discussion du groupe</span>
                            <small class="text-muted"><?= count($members) ?> membres</small>
                        </div>
                        <div class="card-body">
                            <div id="groupChat" style="height: 400px; overflow-y: auto; margin-bottom: 15px;">
                                <div class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="sr-only">Chargement...</span>
                                    </div>
                                </div>
                            </div>
                            <?php if ($isMember): ?>
                                <form id="sendMessageForm">
                                    <input type="hidden" name="group_id" value="<?= $groupId ?>">
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="message" 
                                               placeholder="Tapez votre message..." required>
                                        <div class="input-group-append">
                                            <button class="btn btn-primary" type="submit">Envoyer</button>
                                        </div>
                                    </div>
                                </form>
                            <?php else: ?>
                                <div class="alert alert-info">
                                    Rejoignez le groupe pour participer à la discussion
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endif; ?>
            </div>

            <div class="col-md-4">
                <!-- Membres du groupe -->
                <div class="card mb-4">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Membres</span>
                        <span class="badge badge-primary"><?= count($members) ?></span>
                    </div>
                    <div class="card-body p-0">
                        <ul class="list-group list-group-flush">
                            <?php foreach ($members as $member): ?>
                                <li class="list-group-item d-flex align-items-center">
                                    <img src="/uploads/profiles/<?= htmlspecialchars($member['profile_picture'] ?? 'default.jpg') ?>" 
                                         class="rounded-circle mr-3" width="40" height="40" 
                                         alt="<?= htmlspecialchars($member['username']) ?>">
                                    <div class="flex-grow-1">
                                        <h6 class="mb-0"><?= htmlspecialchars($member['username']) ?></h6>
                                        <small class="text-muted">
                                            <?= $member['role'] === 'admin' ? 'Administrateur' : 'Membre' ?>
                                        </small>
                                    </div>
                                    <?php if ($canEdit && $member['user_id'] != $_SESSION['user_id']): ?>
                                        <div class="dropdown">
                                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                                    type="button" data-toggle="dropdown">
                                                <i class="fas fa-cog"></i>
                                            </button>
                                            <div class="dropdown-menu">
                                                <a class="dropdown-item change-role" href="#" 
                                                   data-user-id="<?= $member['user_id'] ?>" 
                                                   data-new-role="admin">
                                                    Promouvoir admin
                                                </a>
                                                <a class="dropdown-item change-role" href="#" 
                                                   data-user-id="<?= $member['user_id'] ?>" 
                                                   data-new-role="member">
                                                    Rétrograder
                                                </a>
                                                <div class="dropdown-divider"></div>
                                                <a class="dropdown-item text-danger remove-member" href="#" 
                                                   data-user-id="<?= $member['user_id'] ?>">
                                                    Exclure
                                                </a>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    <?php else: ?>
        <div class="alert alert-danger">Les données du groupe n'ont pas pu être chargées</div>
    <?php endif; ?>
</div>

<script>
$(document).ready(function() {
    const groupId = <?= $groupId ?? 0 ?>;
    const currentUserId = <?= $_SESSION['user_id'] ?? 0 ?>;
    const isMember = <?= $isMember ? 'true' : 'false' ?>;
    const canEdit = <?= $canEdit ? 'true' : 'false' ?>;
    const groupType = '<?= $group['group_type'] ?? '' ?>';

    // Gestion de la jonction au groupe
    $('#joinGroupBtn').click(function() {
        $.post('/api/groups/join', { group_id: groupId }, function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert(response.message || 'Erreur lors de la tentative de rejoindre le groupe');
            }
        }).fail(() => alert('Erreur réseau'));
    });

    // Gestion des publications (groupes de publication)
    if (groupType === 'publication' && isMember) {
        // Fonction pour charger les publications
        const loadPosts = () => {
            $.get(`/api/groups/${groupId}/posts`, function(response) {
                $('#groupPosts').html('');
                
                if (response.success && response.posts.length > 0) {
                    response.posts.forEach(post => {
                        $('#groupPosts').append(`
                            <div class="card mb-3 post-item" data-post-id="${post.id}">
                                <div class="card-body">
                                    <div class="d-flex mb-3">
                                        <img src="/uploads/profiles/${post.profile_picture || 'default.jpg'}" 
                                             class="rounded-circle mr-3" width="40" height="40" 
                                             alt="${post.username}">
                                        <div class="flex-grow-1">
                                            <h6 class="mb-0">${post.username}</h6>
                                            <small class="text-muted">
                                                ${new Date(post.created_at).toLocaleString()}
                                            </small>
                                        </div>
                                        ${post.user_id === currentUserId || canEdit ? `
                                        <div class="dropdown">
                                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                                    type="button" data-toggle="dropdown">
                                                <i class="fas fa-ellipsis-v"></i>
                                            </button>
                                            <div class="dropdown-menu dropdown-menu-right">
                                                ${post.user_id === currentUserId ? `
                                                <button class="dropdown-item edit-post">Modifier</button>
                                                ` : ''}
                                                <button class="dropdown-item text-danger delete-post">
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                        ` : ''}
                                    </div>
                                    <p class="post-content mb-2">${post.content}</p>
                                    ${post.image ? `
                                    <img src="/uploads/posts/${post.image}" 
                                         class="img-fluid rounded mb-3" 
                                         alt="Publication">
                                    ` : ''}
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">
                                            ${post.comments_count || 0} commentaires
                                        </small>
                                        <button class="btn btn-sm btn-outline-primary toggle-like"
                                                data-liked="${post.is_liked ? 'true' : 'false'}">
                                            <i class="far fa-thumbs-up"></i> ${post.likes_count || 0}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    $('#groupPosts').html(`
                        <div class="text-center py-4">
                            <p class="text-muted">Aucune publication pour le moment</p>
                            <p>Soyez le premier à partager quelque chose !</p>
                        </div>
                    `);
                }
            }).fail(() => {
                $('#groupPosts').html(`
                    <div class="alert alert-danger">
                        Erreur lors du chargement des publications
                    </div>
                `);
            });
        };

        // Envoyer une nouvelle publication
        $('#createPostForm').submit(function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            $.ajax({
                url: `/api/groups/${groupId}/posts`,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function(response) {
                    if (response.success) {
                        $('#createPostForm')[0].reset();
                        loadPosts();
                    } else {
                        alert(response.message || 'Erreur lors de la publication');
                    }
                },
                error: () => alert('Erreur réseau')
            });
        });

        // Chargement initial
        loadPosts();
    }

    // Gestion du chat (groupes de discussion)
    if (groupType === 'discussion' && isMember) {
        // ... (code du chat similaire à celui des publications)
    }

    // Gestion des membres (pour les admins)
    if (canEdit) {
        $('.change-role').click(function(e) {
            e.preventDefault();
            const userId = $(this).data('user-id');
            const newRole = $(this).data('new-role');
            
            $.post(`/api/groups/${groupId}/members/${userId}/role`, 
                { new_role: newRole }, 
                function(response) {
                    if (response.success) {
                        location.reload();
                    } else {
                        alert(response.message || 'Erreur lors du changement de rôle');
                    }
                }
            ).fail(() => alert('Erreur réseau'));
        });

        $('.remove-member').click(function(e) {
            e.preventDefault();
            if (!confirm('Êtes-vous sûr de vouloir exclure ce membre ?')) return;
            
            const userId = $(this).data('user-id');
            
            $.post(`/api/groups/${groupId}/members/${userId}/remove`, 
                function(response) {
                    if (response.success) {
                        location.reload();
                    } else {
                        alert(response.message || 'Erreur lors de l\'exclusion');
                    }
                }
            ).fail(() => alert('Erreur réseau'));
        });
    }
});
</script>

<?php require_once __DIR__ . '/../../templates/footer.php'; ?>