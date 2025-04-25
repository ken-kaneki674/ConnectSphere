
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Fil d'actualité</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>

<h2>Créer une publication</h2>
<form id="post-form" enctype="multipart/form-data">
    <textarea name="content" placeholder="Exprime-toi..." required></textarea><br>
    <input type="file" name="image" accept="image/*"><br>
    <button type="submit">Publier</button>
</form>

<div id="post-list">
    <?php include 'fetch_posts.php'; ?>
</div>

<script>
    
    
$(document).ready(function() {
    // Lors de la soumission du formulaire de publication
    $('#post-form').submit(function(e) {
        e.preventDefault();
        
        var formData = new FormData(this);
        
        $.ajax({
            url: 'process_post.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                // Ajouter le nouveau post au début de la liste des posts
                $('#post-list').prepend(response);
                $('#post-form')[0].reset(); // Réinitialiser le formulaire
            },
            error: function() {
                alert("Une erreur s'est produite lors de la publication.");
            }
        });
    });

    // Gestion des likes
    $(document).on('click', '.like-btn', function() {
        var postDiv = $(this).closest('.post');
        var postId = postDiv.data('post-id');
        var likeCount = postDiv.find('.like-count');

        $.ajax({
            url: 'like_post.php', // Assurez-vous que ce fichier est configuré pour gérer les likes
            type: 'POST',
            data: { post_id: postId },
            success: function(data) {
                if (data === 'liked') {
                    $(this).addClass('liked');
                    likeCount.text(parseInt(likeCount.text()) + 1);
                } else {
                    $(this).removeClass('liked');
                    likeCount.text(parseInt(likeCount.text()) - 1);
                }
            }
        });
    });

    // Affichage/masquage des commentaires
    $(document).on('click', '.comment-toggle', function() {
        $(this).closest('.post').find('.comments').toggleClass('show');
    });

    // Soumission des commentaires
    $(document).on('submit', '.comment-form', function(e) {
        e.preventDefault();
        var postDiv = $(this).closest('.post');
        var postId = postDiv.data('post-id');
        var input = $(this).find('input');

        $.ajax({
            url: 'add_comment.php', // Assurez-vous que ce fichier est configuré pour gérer les commentaires
            type: 'POST',
            data: { post_id: postId, content: input.val() },
            success: function(data) {
                postDiv.find('.comments').append(data);
                input.val(''); // Réinitialiser l'input
            }
        });
    });
});
$(document).on('click', '.comment-toggle', function() {
    console.log("Clic sur commenter !");
    $(this).closest('.post').find('.comments').toggleClass('show');
});


</script>


</body>
</html>