<?php
require_once '../../config/database.php';
require_once '../../models/Post.php';

$post = new Post();
$posts = $post->getPostsWithCommentsAndLikes();

echo json_encode($posts);
?>
