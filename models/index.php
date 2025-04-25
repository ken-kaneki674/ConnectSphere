<?php
require 'db.php';
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1; // TEMPORAIRE pour les tests
}


$posts = $pdo->query("SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC")->fetchAll();
?>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
body {
    font-family: Arial, sans-serif;
    background-color: #f0f2f5;
    padding: 20px;
}
.post {
    background-color: white;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.post img {
    max-width: 100%;
    border-radius: 10px;
    margin-top: 10px;
}
.post-actions {
    display: flex;
    gap: 20px;
    margin-top: 10px;
}
.like-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #555;
}
.like-btn.liked {
    color: #1877f2;
}
.comment-toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #555;
}
.comments {
    margin-top: 10px;
    display: none;
}
.comments.show {
    display: block;
}
.comment {
    background: #f1f1f1;
    padding: 8px;
    margin-top: 5px;
    border-radius: 5px;
}
.comment-form {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}
.comment-form input[type="text"] {
    flex: 1;
    padding: 8px;
    border-radius: 20px;
    border: 1px solid #ccc;
}
.comment-form button {
    padding: 8px 12px;
    border: none;
    background-color: #1877f2;
    color: white;
    border-radius: 20px;
    cursor: pointer;
}
</style>

<div id="post-list">

<script>
document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const postDiv = this.closest('.post');
        const postId = postDiv.dataset.postId;
        const likeCount = this.querySelector('.like-count');

        fetch('like_post.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'post_id=' + postId
        })
        .then(res => res.text())
        .then(data => {
            if (data === 'liked') {
                this.classList.add('liked');
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            } else {
                this.classList.remove('liked');
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            }
        });
    });
});

document.querySelectorAll('.comment-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
        this.closest('.post').querySelector('.comments').classList.toggle('show');
    });
});

document.querySelectorAll('.comment-form').forEach(form => {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const postDiv = this.closest('.post');
        const postId = postDiv.dataset.postId;
        const input = this.querySelector('input');

        fetch('add_comment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'post_id=' + postId + '&content=' + encodeURIComponent(input.value)
        })
        .then(res => res.text())
        .then(html => {
            postDiv.querySelector('.comments').insertAdjacentHTML('beforeend', html);
            input.value = '';
        });
    });
});
</script>
