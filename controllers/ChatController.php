<?php
declare(strict_types=1);

class ChatController {
    private GroupMessage $messageModel;
    private Group $groupModel;
    private GroupMember $groupMemberModel;

    public function __construct(
        GroupMessage $messageModel,
        Group $groupModel, 
        GroupMember $groupMemberModel
    ) {
        $this->messageModel = $messageModel;
        $this->groupModel = $groupModel;
        $this->groupMemberModel = $groupMemberModel;
    }

    /**
     * Envoie un message dans le chat du groupe
     */
    public function sendMessage(int $groupId): void {
        $this->checkAuth();
        
        try {
            $currentUserId = (int)$_SESSION['user_id'];
            $message = trim($_POST['message'] ?? '');
            
            // Vérifier que l'utilisateur est membre du groupe
            if (!$this->groupMemberModel->isMember($groupId, $currentUserId)) {
                throw new RuntimeException("Vous devez être membre du groupe pour participer");
            }
            
            if (empty($message)) {
                throw new InvalidArgumentException("Le message ne peut pas être vide");
            }
            
            // Envoyer le message
            $messageId = $this->messageModel->create(
                $groupId,
                $currentUserId,
                $message
            );
            
            // Réponse JSON pour les requêtes AJAX
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message_id' => $messageId,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
        } catch (Exception $e) {
            header('Content-Type: application/json');
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Récupère les messages d'un groupe
     */
    public function getMessages(int $groupId): void {
        $this->checkAuth();
        
        try {
            $currentUserId = (int)$_SESSION['user_id'];
            
            // Vérifier que l'utilisateur est membre du groupe
            if (!$this->groupMemberModel->isMember($groupId, $currentUserId)) {
                throw new RuntimeException("Accès refusé");
            }
            
            // Paramètres de pagination
            $limit = min((int)($_GET['limit'] ?? 50), 100);
            $offset = (int)($_GET['offset'] ?? 0);
            
            // Récupérer les messages
            $messages = $this->messageModel->getMessages($groupId, $limit, $offset);
            
            // Formater les messages pour la réponse
            $formattedMessages = array_map(function($message) {
                return [
                    'id' => $message['id'],
                    'content' => htmlspecialchars($message['content']),
                    'sender' => [
                        'id' => $message['sender_id'],
                        'username' => htmlspecialchars($message['username']),
                        'avatar' => $message['profile_picture']
                    ],
                    'timestamp' => $message['sent_at'],
                    'is_own' => $message['sender_id'] === $_SESSION['user_id']
                ];
            }, $messages);
            
            // Réponse JSON
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'messages' => $formattedMessages
            ]);
            
        } catch (Exception $e) {
            header('Content-Type: application/json');
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Supprime un message du chat
     */
    public function deleteMessage(int $groupId, int $messageId): void {
        $this->checkAuth();
        $this->checkCsrfToken();
        
        try {
            $currentUserId = (int)$_SESSION['user_id'];
            
            // Vérifier les permissions
            $message = $this->messageModel->getById($messageId);
            if (!$message) {
                throw new RuntimeException("Message introuvable");
            }
            
            $isAdmin = $this->groupMemberModel->hasRole(
                $groupId, 
                $currentUserId, 
                ['admin', 'moderator']
            );
            
            if ($message['sender_id'] !== $currentUserId && !$isAdmin) {
                throw new RuntimeException("Vous n'avez pas la permission de supprimer ce message");
            }
            
            // Supprimer le message
            $success = $this->messageModel->delete($messageId);
            
            // Réponse JSON
            header('Content-Type: application/json');
            echo json_encode([
                'success' => $success,
                'message' => $success ? "Message supprimé" : "Échec de la suppression"
            ]);
            
        } catch (Exception $e) {
            header('Content-Type: application/json');
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
}