<?php
declare(strict_types=1);

class PublicationController {
    private GroupPost $postModel;
    private Group $groupModel;
    private GroupMember $groupMemberModel;

    public function __construct(
        GroupPost $postModel,
        Group $groupModel,
        GroupMember $groupMemberModel
    ) {
        $this->postModel = $postModel;
        $this->groupModel = $groupModel;
        $this->groupMemberModel = $groupMemberModel;
    }

    /**
     * Crée une nouvelle publication dans un groupe
     */
    public function create(int $groupId): void {
        $this->checkAuth();
        $this->checkCsrfToken();
        
        try {
            $currentUserId = (int)$_SESSION['user_id'];
            
            // Vérifier que l'utilisateur est membre du groupe
            if (!$this->groupMemberModel->isMember($groupId, $currentUserId)) {
                throw new RuntimeException("Vous devez être membre du groupe pour publier");
            }
            
            $content = trim($_POST['content'] ?? '');
            if (empty($content)) {
                throw new InvalidArgumentException("Le contenu ne peut pas être vide");
            }
            
            // Gérer l'upload d'image
            $imagePath = $this->handleImageUpload($_FILES['image'] ?? null);
            
            // Créer la publication
            $postId = $this->postModel->create(
                $groupId,
                $currentUserId,
                $content,
                $imagePath
            );
            
            $this->redirectWithSuccess(
                "/groups/view/$groupId",
                "Publication créée avec succès"
            );
            
        } catch (Exception $e) {
            $this->redirectWithError(
                "/groups/view/$groupId",
                "Erreur lors de la publication: " . $e->getMessage()
            );
        }
    }

    /**
     * Supprime une publication
     */
    public function delete(int $groupId, int $postId): void {
        $this->checkAuth();
        $this->checkCsrfToken();
        
        try {
            $currentUserId = (int)$_SESSION['user_id'];
            
            // Vérifier les permissions
            $post = $this->postModel->getById($postId);
            if (!$post) {
                throw new RuntimeException("Publication introuvable");
            }
            
            $isAdmin = $this->groupMemberModel->hasRole(
                $groupId, 
                $currentUserId, 
                ['admin', 'moderator']
            );
            
            if ($post['user_id'] !== $currentUserId && !$isAdmin) {
                throw new RuntimeException("Vous n'avez pas la permission de supprimer cette publication");
            }
            
            // Supprimer la publication
            $success = $this->postModel->delete($postId);
            
            if ($success) {
                $this->redirectWithSuccess(
                    "/groups/view/$groupId",
                    "Publication supprimée avec succès"
                );
            } else {
                throw new RuntimeException("Échec de la suppression");
            }
            
        } catch (Exception $e) {
            $this->redirectWithError(
                "/groups/view/$groupId",
                "Erreur lors de la suppression: " . $e->getMessage()
            );
        }
    }

    /**
     * Met à jour une publication
     */
    public function update(int $groupId, int $postId): void {
        $this->checkAuth();
        $this->checkCsrfToken();
        
        try {
            $currentUserId = (int)$_SESSION['user_id'];
            $content = trim($_POST['content'] ?? '');
            
            if (empty($content)) {
                throw new InvalidArgumentException("Le contenu ne peut pas être vide");
            }
            
            // Vérifier que l'utilisateur est l'auteur
            $post = $this->postModel->getById($postId);
            if (!$post || $post['user_id'] !== $currentUserId) {
                throw new RuntimeException("Permission refusée");
            }
            
            // Mettre à jour la publication
            $success = $this->postModel->update(
                $postId,
                $content,
                $_FILES['image'] ?? null
            );
            
            if ($success) {
                $this->redirectWithSuccess(
                    "/groups/view/$groupId",
                    "Publication mise à jour avec succès"
                );
            } else {
                throw new RuntimeException("Échec de la mise à jour");
            }
            
        } catch (Exception $e) {
            $this->redirectWithError(
                "/groups/view/$groupId",
                "Erreur lors de la mise à jour: " . $e->getMessage()
            );
        }
    }

    /**
     * Gère l'upload d'image pour les publications
     */
    private function handleImageUpload(?array $file): ?string {
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }
        
        // Validation du type et de la taille
        $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!array_key_exists($file['type'], $allowedTypes)) {
            throw new InvalidArgumentException("Format d'image non supporté");
        }
        
        if ($file['size'] > $maxSize) {
            throw new InvalidArgumentException("L'image est trop volumineuse (max 5MB)");
        }
        
        // Créer le répertoire si inexistant
        $uploadDir = __DIR__ . '/../../public/uploads/posts/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Générer un nom de fichier unique
        $extension = $allowedTypes[$file['type']];
        $filename = 'post_' . bin2hex(random_bytes(8)) . '.' . $extension;
        $destination = $uploadDir . $filename;
        
        // Déplacer le fichier uploadé
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new RuntimeException("Échec de l'enregistrement de l'image");
        }
        
        return $filename;
    }
}