<?php
declare(strict_types=1);

class GroupController {
    private Group $groupModel;
    private GroupMember $groupMemberModel;
    private User $userModel;

    public function __construct(
        Group $groupModel, 
        GroupMember $groupMemberModel,
        User $userModel
    ) {
        $this->groupModel = $groupModel;
        $this->groupMemberModel = $groupMemberModel;
        $this->userModel = $userModel;
    }

    public function view(int $groupId): void {
        try {
            // Validation
            if ($groupId <= 0) {
                throw new InvalidArgumentException("ID de groupe invalide");
            }
    
            // Récupération des données
            $group = $this->groupModel->getById($groupId);
            if (!$group) {
                throw new RuntimeException("Groupe non trouvé");
            }
    
            $currentUserId = $_SESSION['user_id'] ?? 0;
            $members = $this->groupMemberModel->getMembers($groupId);
            $isMember = $this->groupMemberModel->isMember($groupId, (int)$currentUserId);
            $canEdit = $this->canUserEditGroup($groupId);
    
            // Préparation des données pour la vue
            $groupDetails = [
                'success' => true,
                'message' => '',
                'group' => $group,
                'members' => $members,
                'is_member' => $isMember,
                'can_edit' => $canEdit
            ];
    
            $this->render('groups/view', [
                'groupDetails' => $groupDetails,
                'groupId' => $groupId
            ]);
    
        } catch (Exception $e) {
            $this->render('groups/view', [
                'groupDetails' => [
                    'success' => false,
                    'message' => $e->getMessage(),
                    'group' => null,
                    'members' => [],
                    'is_member' => false,
                    'can_edit' => false
                ],
                'groupId' => $groupId
            ]);
        }
    }

    /**
     * Affiche la liste des groupes avec filtres
     */
    public function index(): void {
        try {
            $currentUserId = $_SESSION['user_id'] ?? null;
            $searchQuery = $_GET['q'] ?? '';
            $groupType = $_GET['type'] ?? null;
            $filter = $_GET['filter'] ?? 'all';

            if ($filter === 'my' && $currentUserId) {
                $groups = $this->groupModel->getUserGroups((int) $currentUserId, true);
            } elseif ($filter === 'popular') {
                $groups = $this->groupModel->search('', null, 50);
                usort($groups, fn($a, $b) => $b['member_count'] <=> $a['member_count']);
                $groups = array_slice($groups, 0, 20);
            } else {
                $groups = $this->groupModel->search($searchQuery, $groupType);
            }

            $this->render('groups/list', [
                'groups' => $groups,
                'searchQuery' => $searchQuery,
                'currentUserId' => $currentUserId,
                'filter' => $filter
            ]);

        } catch (Exception $e) {
            $this->logError($e);
            $this->redirectWithError('/groups', 'Erreur lors du chargement des groupes');
        }
    }

    public function listGroups() {
        $this->checkAuth();
        
        $currentUserId = $_SESSION['user_id'];
        $search = $_GET['q'] ?? '';
        $filter = $_GET['filter'] ?? 'all';
        $type = $_GET['type'] ?? null;
        $page = $_GET['p'] ?? 1;
        $perPage = 12;
    
        try {
            $groups = $this->groupModel->getFilteredGroups(
                $currentUserId,
                $search,
                $filter,
                $type,
                $page,
                $perPage
            );
    
            $totalGroups = $this->groupModel->countFilteredGroups(
                $currentUserId,
                $search,
                $filter,
                $type
            );
    
            $this->render('groups/list', [
                'groups' => $groups,
                'currentUserId' => $currentUserId,
                'search' => $search,
                'filter' => $filter,
                'type' => $type,
                'currentPage' => $page,
                'totalPages' => ceil($totalGroups / $perPage),
                'nonce' => bin2hex(random_bytes(16)) // Pour CSP
            ]);
    
        } catch (Exception $e) {
            $this->redirectWithError('/groups', 'Erreur de chargement: '.$e->getMessage());
        }
    }

    /**
     * Affiche le formulaire de création de groupe
     */
    public function createForm(): void {
        $this->checkAuth();
        $this->render('groups/create');
    }

    /**
     * Traite la création d'un nouveau groupe
     */
    public function create(): void {
        header('Content-Type: application/json');
        
        try {
            // Conversion explicite de l'ID utilisateur
            $creatorId = (int)$_SESSION['user_id'];
            if ($creatorId <= 0) {
                throw new RuntimeException("Session utilisateur invalide");
            }
    
            $coverImage = $this->handleCoverImageUpload($_FILES['cover_image'] ?? null);
            
            $groupId = $this->groupModel->create(
                trim($_POST['name']),
                trim($_POST['description']),
                $creatorId,  // Maintenant un int garanti
                $_POST['type'],
                isset($_POST['is_private']),
                $coverImage
            );
    
            echo json_encode([
                'success' => true,
                'redirect' => "/groups/view/{$groupId}"
            ]);
    
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Gère l'adhésion à un groupe
     */
    public function join(int $groupId): void {
        $this->checkAuth();
        $this->checkCsrfToken();

        try {
            $this->groupMemberModel->addMember($groupId, $_SESSION['user_id']);
            $this->redirectWithSuccess(
                "/groups/view/{$groupId}",
                'Vous avez rejoint le groupe!'
            );
        } catch (Exception $e) {
            $this->logError($e);
            $this->redirectWithError("/groups/view/{$groupId}", 'Erreur lors de l\'adhésion');
        }
    }

    /**
     * Gère la sortie d'un groupe
     */
    public function leave(int $groupId): void {
        $this->checkAuth();
        $this->checkCsrfToken();

        try {
            $this->groupMemberModel->removeMember($groupId, $_SESSION['user_id']);
            $this->redirectWithSuccess('/groups', 'Vous avez quitté le groupe');
        } catch (Exception $e) {
            $this->logError($e);
            $this->redirectWithError("/groups/view/{$groupId}", 'Erreur lors de la sortie');
        }
    }

    /**
     * Supprime un groupe
     */
    public function delete(int $groupId): void {
        $this->checkAuth();
        $this->checkCsrfToken();

        try {
            if (!$this->canUserEditGroup($groupId)) {
                throw new RuntimeException('Permissions insuffisantes');
            }

            $this->groupModel->delete($groupId);
            $this->redirectWithSuccess('/groups', 'Groupe supprimé');

        } catch (Exception $e) {
            $this->logError($e);
            $this->redirectWithError("/groups/view/{$groupId}", 'Erreur lors de la suppression');
        }
    }

    /**
     * Gère l'upload de l'image de couverture
     */
    private function handleCoverImageUpload(?array $file): ?string {
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png'];
        $maxSize = 2 * 1024 * 1024; // 2MB

        if (!array_key_exists($file['type'], $allowedTypes)) {
            throw new InvalidArgumentException('Format d\'image non supporté');
        }

        if ($file['size'] > $maxSize) {
            throw new InvalidArgumentException('L\'image est trop volumineuse (max 2MB)');
        }

        $uploadDir = __DIR__ . '/../../public/uploads/groups/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $filename = 'group_' . bin2hex(random_bytes(8)) . '.' . $allowedTypes[$file['type']];
        $destination = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new RuntimeException('Échec de l\'enregistrement de l\'image');
        }

        return $filename;
    }

    /**
     * Vérifie les permissions d'édition
     */
    private function canUserEditGroup(int $groupId): bool {
        if (!isset($_SESSION['user_id'])) {
            return false;
        }
    
        $userId = (int)$_SESSION['user_id'];
        $group = $this->groupModel->getById($groupId);
        
        // Le créateur a toujours les droits
        if ($group['creator_id'] === $userId) {
            return true;
        }
    
        // Vérifie si l'utilisateur a un rôle admin
        return $this->groupMemberModel->hasRole($groupId, $userId, ['admin']);
    }

    /**
     * Vérifie l'authentification
     */
    private function checkAuth(): void {
        if (!isset($_SESSION['user_id'])) {
            $_SESSION['redirect'] = $_SERVER['REQUEST_URI'];
            $this->redirect('/login');
        }
    }

    /**
     * Vérifie le token CSRF
     */
    private function checkCsrfToken(): void {
        if (empty($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
            throw new RuntimeException('Token CSRF invalide');
        }
    }

    /**
     * Affiche une vue
     */
    protected function render(string $view, array $data = []): void {
        $viewPath = realpath(__DIR__ . '/../views/' . $view . '.php');
        $headerPath = realpath(__DIR__ . '/../templates/header.php');
        $footerPath = realpath(__DIR__ . '/../templates/footer.php');
    
        if (!file_exists($viewPath)) {
            throw new RuntimeException("View file not found: {$viewPath}");
        }
    
        extract($data);
        
        require $headerPath;
        require $viewPath;
        require $footerPath;
    }

    /**
     * Redirige vers une URL
     */
    private function redirect(string $url): void {
        header("Location: {$url}");
        exit;
    }

    /**
     * Redirige avec un message d'erreur
     */
    private function redirectWithError(string $url, string $message): void {
        $_SESSION['error'] = $message;
        $this->redirect($url);
    }

    /**
     * Redirige avec un message de succès
     */
    private function redirectWithSuccess(string $url, string $message): void {
        $_SESSION['success'] = $message;
        $this->redirect($url);
    }

    /**
     * Log les erreurs
     */
    private function logError(Exception $e): void {
        error_log('[' . date('Y-m-d H:i:s') . '] ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    }
}