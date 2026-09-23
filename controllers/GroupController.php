<?php
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/Group.php';

class GroupController {
    private $groupModel;

    public function __construct($pdo) {
        $this->groupModel = new Group($pdo);
    }

    public function getGroups() {
        return $this->groupModel->getVisibleGroups(currentUser()['id']);
    }

    // Traite les formulaires de la page des groupes (création, adhésion, départ, suppression)
    public function handlePost() {
        requireLogin();
        if (!checkCsrf()) {
            flash('danger', "Session expirée, veuillez réessayer.");
            redirect('index.php?page=groups');
        }

        $userId = currentUser()['id'];
        $groupId = (int)($_POST['group_id'] ?? 0);

        switch ($_POST['action'] ?? '') {
            case 'create':
                $name = trim($_POST['name'] ?? '');
                if ($name === '') {
                    flash('danger', "Le nom du groupe est obligatoire.");
                } else {
                    $this->groupModel->create($userId, $name, trim($_POST['description'] ?? ''), $_POST['privacy'] ?? 'public');
                    flash('success', "Groupe créé !");
                }
                break;
            case 'join':
                $this->groupModel->join($groupId, $userId)
                    ? flash('success', "Vous avez rejoint le groupe.")
                    : flash('danger', "Impossible de rejoindre ce groupe.");
                break;
            case 'leave':
                $this->groupModel->leave($groupId, $userId)
                    ? flash('success', "Vous avez quitté le groupe.")
                    : flash('danger', "Impossible de quitter ce groupe.");
                break;
            case 'delete':
                $this->groupModel->delete($groupId, $userId)
                    ? flash('success', "Groupe supprimé.")
                    : flash('danger', "Suppression impossible.");
                break;
        }

        redirect('index.php?page=groups');
    }
}
