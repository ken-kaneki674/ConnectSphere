document.addEventListener('DOMContentLoaded', () => {
    // Gestion des Likes
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.closest('.card').dataset.postId;
            fetch('controllers/CommentLikeController.php?action=like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: postId })
            })
            .then(response => response.json())
            .then(data => {
                const likeIcon = this.querySelector('i');
                if (data.status === 'liked') {
                    likeIcon.classList.add('bi-heart-fill');
                    likeIcon.classList.remove('bi-heart');
                } else {
                    likeIcon.classList.add('bi-heart');
                    likeIcon.classList.remove('bi-heart-fill');
                }
                this.querySelector('.like-count').textContent = data.count;
            });
        });
    });

    // Gestion des Commentaires
    document.querySelectorAll('.comment-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.closest('.card-body').querySelector('.comments-section');
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        });
    });

    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const postId = this.closest('.card').dataset.postId;
            const content = this.querySelector('textarea').value;

            fetch('controllers/CommentLikeController.php?action=comment', {
                method: 'POST',
                body: new FormData(this)
            })
            .then(response => response.json())
            .then(data => {
                const commentsList = this.nextElementSibling;
                commentsList.innerHTML = data.comments.map(comment => `
                    <div class="card mb-2">
                        <div class="card-body">
                            <h6>${comment.username}</h6>
                            <p>${comment.content}</p>
                            <small>${new Date(comment.created_at).toLocaleString()}</small>
                        </div>
                    </div>
                `).join('');
                this.reset();
            });
        });
    });
});