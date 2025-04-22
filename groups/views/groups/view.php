<?php 
require_once '../../templates/header.php';
require_once '../config/auth.php'; // Assure que l'utilisateur est connecté

$groupId = $_GET['id'] ?? 0;
$groupController = new GroupController($db);
$groupDetails = $groupController->getGroupDetails($groupId, $_SESSION['user_id']);
?>

<div class="container mt-4">
    <?php if (!$groupDetails['success']): ?>
        <div class="alert alert-danger"><?= $groupDetails['message'] ?></div>
    <?php else: ?>
        <div class="row">
            <div class="col-md-8">
                <!-- En-tête du groupe -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h3><?= htmlspecialchars($groupDetails['group']['name']) ?></h3>
                        <p class="mb-0"><?= htmlspecialchars($groupDetails['group']['description']) ?></p>
                    </div>
                    <?php if ($groupDetails['group']['cover_image']): ?>
                        <img src="../uploads/groups/<?= $groupDetails['group']['cover_image'] ?>" class="card-img-top" alt="Cover image">
                    <?php endif; ?>
                    <div class="card-body">
                        <?php if (!$groupDetails['is_member']): ?>
                            <button id="joinGroupBtn" class="btn btn-success">Rejoindre ce groupe</button>
                        <?php else: ?>
                            <p class="text-success">Vous êtes membre de ce groupe</p>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Contenu selon le type de groupe -->
                <?php if ($groupDetails['group']['group_type'] == 'publication'): ?>
                    <!-- Formulaire de publication -->
                    <div class="card mb-4">
                        <div class="card-body">
                            <form id="createPostForm" enctype="multipart/form-data">
                                <input type="hidden" name="group_id" value="<?= $groupId ?>">
                                <div class="form-group">
                                    <textarea class="form-control" name="content" rows="3" placeholder="Partagez quelque chose avec le groupe..." required></textarea>
                                </div>
                                <div class="form-group">
                                    <input type="file" class="form-control-file" name="image">
                                </div>
                                <button type="submit" class="btn btn-primary">Publier</button>
                            </form>
                        </div>
                    </div>

                    <!-- Liste des publications -->
                    <div id="groupPosts">
                        <!-- Les publications seront chargées ici via AJAX -->
                    </div>
                <?php else: ?>
                    <!-- Chat de groupe -->
                    <div class="card">
                        <div class="card-header">Discussion du groupe</div>
                        <div class="card-body">
                            <div id="groupChat" style="height: 400px; overflow-y: auto; margin-bottom: 15px;"></div>
                            <form id="sendMessageForm">
                                <input type="hidden" name="group_id" value="<?= $groupId ?>">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="message" placeholder="Tapez votre message..." required>
                                    <div class="input-group-append">
                                        <button class="btn btn-primary" type="submit">Envoyer</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                <?php endif; ?>
            </div>

            <div class="col-md-4">
                <!-- Membres du groupe -->
                <div class="card mb-4">
                    <div class="card-header">Membres (<?= count($groupDetails['members']) ?>)</div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            <?php foreach ($groupDetails['members'] as $member): ?>
                                <li class="list-group-item d-flex align-items-center">
                                    <img src="../uploads/profiles/<?= $member['profile_picture'] ?? 'default.jpg' ?>" class="rounded-circle mr-3" width="40" height="40" alt="Profile picture">
                                    <div>
                                        <h6 class="mb-0"><?= htmlspecialchars($member['username']) ?></h6>
                                        <small class="text-muted"><?= $member['role'] == 'admin' ? 'Admin' : 'Membre' ?></small>
                                    </div>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>

<script>
$(document).ready(function() {
    var groupId = <?= $groupId ?>;
    var isMember = <?= $groupDetails['is_member'] ? 'true' : 'false' ?>;
    var groupType = '<?= $groupDetails['group']['group_type'] ?>';

    // Gestion de la jonction au groupe
    $('#joinGroupBtn').click(function() {
        $.post('../api/groups/join.php', { group_id: groupId }, function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert(response.message);
            }
        });
    });

    // Gestion des publications (pour les groupes de publication)
    if (groupType === 'publication' && isMember) {
        // Charger les publications
        function loadPosts() {
            $.get('../api/groups/posts.php', { group_id: groupId }, function(response) {
                if (response.success) {
                    $('#groupPosts').html('');
                    response.posts.forEach(function(post) {
                        $('#groupPosts').append(`
                            <div class="card mb-3">
                                <div class="card-body">
                                    <div class="d-flex mb-3">
                                        <img src="../uploads/profiles/${post.profile_picture || 'default.jpg'}" class="rounded-circle mr-3" width="40" height="40" alt="Profile picture">
                                        <div>
                                            <h6 class="mb-0">${post.username}</h6>
                                            <small class="text-muted">${new Date(post.created_at).toLocaleString()}</small>
                                        </div>
                                    </div>
                                    <p>${post.content}</p>
                                    ${post.image ? `<img src="../uploads/posts/${post.image}" class="img-fluid mb-3" alt="Post image">` : ''}
                                </div>
                            </div>
                        `);
                    });
                }
            });
        }

        // Envoyer une nouvelle publication
        $('#createPostForm').submit(function(e) {
            e.preventDefault();
            
            var formData = new FormData(this);
            
            $.ajax({
                url: '../api/groups/posts/create.php',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function(response) {
                    if (response.success) {
                        $('#createPostForm')[0].reset();
                        loadPosts();
                    } else {
                        alert(response.message);
                    }
                }
            });
        });

        loadPosts();
    }

    // Gestion du chat (pour les groupes de discussion)
    if (groupType === 'discussion' && isMember) {
        var lastMessageTime = null;
        
        // Charger les messages
        function loadMessages() {
            $.get('../api/groups/messages.php', { group_id: groupId }, function(response) {
                if (response.success && response.messages.length > 0) {
                    $('#groupChat').html('');
                    response.messages.reverse().forEach(function(msg) {
                        appendMessage(msg);
                    });
                    lastMessageTime = response.messages[response.messages.length - 1].sent_at;
                    $('#groupChat').scrollTop($('#groupChat')[0].scrollHeight);
                }
            });
        }
        
        // Ajouter un message à l'affichage
        function appendMessage(msg) {
            $('#groupChat').append(`
                <div class="mb-3">
                    <div class="d-flex ${msg.sender_id == <?= $_SESSION['user_id'] ?> ? 'justify-content-end' : ''}">
                        <div class="${msg.sender_id == <?= $_SESSION['user_id'] ?> ? 'bg-primary text-white' : 'bg-light'} p-3 rounded" style="max-width: 70%;">
                            <div class="d-flex align-items-center mb-1">
                                <img src="../uploads/profiles/${msg.profile_picture || 'default.jpg'}" class="rounded-circle mr-2" width="25" height="25" alt="Profile picture">
                                <strong>${msg.username}</strong>
                            </div>
                            <p class="mb-0">${msg.message}</p>
                            <small class="d-block text-right ${msg.sender_id == <?= $_SESSION['user_id'] ?> ? 'text-white-50' : 'text-muted'}">${new Date(msg.sent_at).toLocaleTimeString()}</small>
                        </div>
                    </div>
                </div>
            `);
        }
        
        // Envoyer un message
        $('#sendMessageForm').submit(function(e) {
            e.preventDefault();
            
            var message = $(this).find('[name="message"]').val().trim();
            if (message === '') return;
            
            $.post('../api/groups/messages/send.php', { 
                group_id: groupId, 
                message: message 
            }, function(response) {
                if (response.success) {
                    $('#sendMessageForm')[0].reset();
                } else {
                    alert(response.message);
                }
            });
        });
        
        // Vérifier les nouveaux messages
        function checkNewMessages() {
            if (!lastMessageTime) return;
            
            $.get('../api/groups/messages/new.php', { 
                group_id: groupId, 
                since: lastMessageTime 
            }, function(response) {
                if (response.success && response.messages.length > 0) {
                    response.messages.forEach(function(msg) {
                        appendMessage(msg);
                    });
                    lastMessageTime = response.messages[response.messages.length - 1].sent_at;
                    $('#groupChat').scrollTop($('#groupChat')[0].scrollHeight);
                }
            });
        }
        
        loadMessages();
        setInterval(checkNewMessages, 3000); // Vérifier toutes les 3 secondes
    }
});
</script>

<?php require_once '../templates/footer.php'; ?>