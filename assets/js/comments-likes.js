// Likes et commentaires de la version PHP MVC (endpoint : public/pages/comment_like.php)
document.addEventListener('DOMContentLoaded', () => {
    const endpoint = 'pages/comment_like.php';
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    const csrfToken = csrfMeta ? csrfMeta.content : '';

    const escapeHtml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const post = (data) => {
        const body = new FormData();
        Object.entries(data).forEach(([key, value]) => body.append(key, value));
        body.append('csrf_token', csrfToken);
        return fetch(endpoint, { method: 'POST', body }).then(response => response.json());
    };

    const renderComments = (card, comments) => {
        card.querySelector('.comments-list').innerHTML = comments.length === 0
            ? '<p class="text-muted small mb-0">Aucun commentaire.</p>'
            : comments.map(comment => `
                <div class="card mb-2">
                    <div class="card-body py-2">
                        <h6 class="mb-1">${escapeHtml(comment.username)}</h6>
                        <p class="mb-1">${escapeHtml(comment.content)}</p>
                        <small class="text-muted">${escapeHtml(new Date(comment.created_at.replace(' ', 'T')).toLocaleString('fr-FR'))}</small>
                    </div>
                </div>
            `).join('');
        card.querySelector('.comment-count').textContent = comments.length;
    };

    // Gestion des Likes
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const postId = this.closest('.card[data-post-id]').dataset.postId;
            post({ action: 'toggle_like', post_id: postId })
                .then(data => {
                    if (data.error) return alert(data.error);
                    const likeIcon = this.querySelector('i');
                    likeIcon.classList.toggle('bi-heart-fill', data.status === 'liked');
                    likeIcon.classList.toggle('bi-heart', data.status !== 'liked');
                    this.querySelector('.like-count').textContent = data.count;
                });
        });
    });

    // Affichage des commentaires
    document.querySelectorAll('.comment-toggle').forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.card[data-post-id]');
            const section = card.querySelector('.comments-section');
            const opening = section.style.display === 'none';
            section.style.display = opening ? 'block' : 'none';

            if (opening && !section.dataset.loaded) {
                fetch(`${endpoint}?action=get_comments&post_id=${encodeURIComponent(card.dataset.postId)}`)
                    .then(response => response.json())
                    .then(data => {
                        section.dataset.loaded = '1';
                        renderComments(card, data.comments || []);
                    });
            }
        });
    });

    // Ajout d'un commentaire
    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const card = this.closest('.card[data-post-id]');
            const content = this.querySelector('textarea').value.trim();
            if (!content) return;

            post({ action: 'add_comment', post_id: card.dataset.postId, content })
                .then(data => {
                    if (data.error) return alert(data.error);
                    renderComments(card, data.comments);
                    this.reset();
                });
        });
    });
});
