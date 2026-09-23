<?php
// controllers/MessageController.php — logique des endpoints AJAX de public/pages/*.php
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/Message.php';
require_once __DIR__ . '/../models/User.php';

class MessageController {
    private $messageModel;
    private $userModel;

    public function __construct($pdo) {
        $this->messageModel = new Message($pdo);
        $this->userModel = new User($pdo);
    }

    private function userId() {
        if (!isLoggedIn()) {
            http_response_code(401);
            exit("Vous devez être connecté.");
        }
        return (int)currentUser()['id'];
    }

    private function requireCsrf() {
        if (!checkCsrf()) {
            http_response_code(403);
            exit("Session expirée, rechargez la page.");
        }
    }

    // Liste HTML des contacts
    public function contacts() {
        $contacts = $this->messageModel->getContacts($this->userId());

        if (count($contacts) === 0) {
            echo "<p>Aucun contact trouvé. Démarrez une conversation pour ajouter des contacts.</p>";
            return;
        }

        foreach ($contacts as $contact) {
            $badge = $contact['unread'] > 0 ? " <span class='badge bg-danger'>" . (int)$contact['unread'] . "</span>" : '';
            echo "<div class='contact-item mb-2 p-2 border rounded' style='cursor:pointer' data-id='" . (int)$contact['id'] . "'>"
                . e($contact['username']) . $badge
                . "</div>";
        }
    }

    // Fil HTML des messages avec un contact
    public function messages($receiver_id) {
        $userId = $this->userId();
        $conversationId = $this->messageModel->findConversation($userId, (int)$receiver_id);
        if (!$conversationId) {
            return;
        }

        foreach ($this->messageModel->getMessages($conversationId, $userId) as $msg) {
            $class = (int)$msg['sender_id'] === $userId ? 'you' : 'them';
            echo "<div class='message $class mb-2'>
                    <div class='p-2 bg-light rounded d-inline-block'>" . nl2br(e($msg['content'])) . "</div><br>
                    <small class='text-muted'>" . e($msg['sent_at']) . "</small>
                  </div>";
        }
    }

    public function send($receiver_id, $content) {
        $userId = $this->userId();
        $this->requireCsrf();
        $receiver_id = (int)$receiver_id;
        $content = trim((string)$content);

        if ($content === '' || $receiver_id === $userId || !$this->userModel->findById($receiver_id)) {
            http_response_code(400);
            exit("Message invalide.");
        }

        $conversationId = $this->messageModel->findConversation($userId, $receiver_id)
            ?? $this->messageModel->createConversation($userId, $receiver_id);
        $this->messageModel->send($conversationId, $userId, $content);
    }

    public function startConversation($username) {
        $userId = $this->userId();
        $this->requireCsrf();
        $username = trim((string)$username);

        $target = $username !== '' ? $this->userModel->findByUsername($username) : null;
        if (!$target || (int)$target['id'] === $userId) {
            echo "Utilisateur introuvable.";
            return;
        }

        if ($this->messageModel->findConversation($userId, $target['id'])) {
            echo "Conversation déjà existante.";
            return;
        }

        $this->messageModel->createConversation($userId, $target['id']);
        echo "Conversation démarrée avec " . e($target['username']) . ".";
    }
}
