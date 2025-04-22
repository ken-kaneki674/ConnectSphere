<?php
require_once '../models/GroupPost.php';
require_once '../models/Group.php';

class GroupPostController {
    private $postModel;
    private $groupModel;

    public function __construct($db) {
        $this->postModel = new GroupPost($db);
        $this->groupModel = new Group($db);
    }

    public function createPost($groupId, $userId, $content, $image = null) {
        // Vérifier que l'utilisateur est membre du groupe
        $isMember = false;
        $members = $this->groupModel->getMembers($groupId);
        foreach ($members as $member) {
            if ($member['id'] == $userId) {
                $isMember = true;
                break;
            }
        }

        if (!$isMember) {
            return ['success' => false, 'message' => 'Vous devez être membre du groupe pour poster'];
        }

        $postId = $this->postModel->create($groupId, $userId, $content, $image);
        return ['success' => (bool)$postId, 'post_id' => $postId];
    }

    public function getGroupPosts($groupId, $userId, $page = 1, $perPage = 10) {
        // Vérifier que l'utilisateur est membre du groupe
        $isMember = false;
        $members = $this->groupModel->getMembers($groupId);
        foreach ($members as $member) {
            if ($member['id'] == $userId) {
                $isMember = true;
                break;
            }
        }

        if (!$isMember) {
            return ['success' => false, 'message' => 'Vous devez être membre du groupe pour voir les publications'];
        }

        $offset = ($page - 1) * $perPage;
        $posts = $this->postModel->getPostsByGroup($groupId, $perPage, $offset);
        return ['success' => true, 'posts' => $posts];
    }
}
?>