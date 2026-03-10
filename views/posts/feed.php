<!-- Ajoutez ceci pour chaque post dans la boucle -->
<div class="card mb-3" data-post-id="<?= $post['post_id'] ?>">
    <div class="card-body">
        <p><?= htmlspecialchars($post['content']) ?></p>
        <div class="d-flex gap-3">
            <!-- Bouton Like -->
            <button class="btn btn-outline-primary like-btn">
                <i class="bi bi-heart"></i> 
                <span class="like-count"><?= $post['like_count'] ?></span>
            </button>
            
            <!-- Bouton Commentaire -->
            <button class="btn btn-outline-secondary comment-toggle">
                <i class="bi bi-chat"></i> Commenter
            </button>
        </div>

        <!-- Section Commentaires (masquée par défaut) -->
        <div class="comments-section mt-3" style="display: none;">
            <form class="comment-form mb-3">
                <textarea class="form-control" placeholder="Votre commentaire..." required></textarea>
                <button type="submit" class="btn btn-primary mt-2">Envoyer</button>
            </form>
            <div class="comments-list">
                <!-- Chargé dynamiquement via JS -->
            </div>
        </div>
    </div>
</div>