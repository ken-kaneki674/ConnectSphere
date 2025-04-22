<?php
require_once '../models/Group.php';

class GroupController {
    private $groupModel;

    public function __construct($db) {
        $this->groupModel = new Group($db);
    }

    public function createGroup($data, $userId) {
        // Validation des données
        if (empty($data['name']) || empty($data['description']) || empty($data['type'])) {
            return ['success' => false, 'message' => 'Tous les champs obligatoires doivent être remplis'];
        }

        $groupId = $this->groupModel->create(
            $data['name'],
            $data['description'],
            $userId,
            $data['type'],
            $data['is_private'] ?? false,
            $data['cover_image'] ?? null
        );

        // Ajouter le créateur comme admin
        $this->groupModel->addMember($groupId, $userId, 'admin');

        return ['success' => true, 'group_id' => $groupId];
    }

    public function getUserGroups($userId) {
        return $this->groupModel->getUserGroups($userId);
    }

    public function searchGroups($query, $type = null) {
        return $this->groupModel->search($query, $type);
    }

    public function getGroupDetails($groupId, $userId) {
        $group = $this->groupModel->getById($groupId);
        if (!$group) {
            return ['success' => false, 'message' => 'Groupe non trouvé'];
        }

        $isMember = false;
        $members = $this->groupModel->getMembers($groupId);
        foreach ($members as $member) {
            if ($member['id'] == $userId) {
                $isMember = true;
                break;
            }
        }

        return [
            'success' => true,
            'group' => $group,
            'is_member' => $isMember,
            'members' => $members
        ];
    }

    public function joinGroup($groupId, $userId) {
        // Vérifier si l'utilisateur n'est pas déjà membre
        $members = $this->groupModel->getMembers($groupId);
        foreach ($members as $member) {
            if ($member['id'] == $userId) {
                return ['success' => false, 'message' => 'Vous êtes déjà membre de ce groupe'];
            }
        }

        $success = $this->groupModel->addMember($groupId, $userId);
        return ['success' => $success, 'message' => $success ? 'Vous avez rejoint le groupe' : 'Erreur lors de la jonction'];
    }
}
?>