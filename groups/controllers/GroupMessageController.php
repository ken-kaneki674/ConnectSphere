<?php
require_once '../models/GroupMessage.php';
require_once '../models/Group.php';

class GroupMessageController {
    private $messageModel;
    private $groupModel;

    public function __construct($db) {
        $this->messageModel = new GroupMessage($db);
        $this->groupModel = new Group($db);
    }

    public function sendMessage($groupId, $userId, $message) {
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
            return ['success' => false, 'message' => 'Vous devez être membre du groupe pour envoyer des messages'];
        }

        if (empty(trim($message))) {
            return ['success' => false, 'message' => 'Le message ne peut pas être vide'];
        }

        $success = $this->messageModel->sendMessage($groupId, $userId, $message);
        return ['success' => $success, 'message' => $success ? 'Message envoyé' : 'Erreur lors de l\'envoi'];
    }

    public function getMessages($groupId, $userId, $limit = 50) {
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
            return ['success' => false, 'message' => 'Vous devez être membre du groupe pour voir les messages'];
        }

        $messages = $this->messageModel->getMessages($groupId, $limit);
        return ['success' => true, 'messages' => $messages];
    }

    public function getNewMessages($groupId, $userId, $since) {
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
            return ['success' => false, 'message' => 'Vous devez être membre du groupe pour voir les messages'];
        }

        $messages = $this->messageModel->getLastMessagesSince($groupId, $since);
        return ['success' => true, 'messages' => $messages];
    }
}
?>