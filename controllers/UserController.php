<?php 
// controllers/UserController.php

require_once './models/User.php';
require_once './config/database.php';

// Démarrer la session si elle ne l’est pas encore
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Vérifie si une action est définie
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    switch ($action) {

        case 'search_user':
            $currentUserId = $_SESSION['user_id'];
            $users = User::searchUsers($pdo, $currentUserId);
            include './views/friends/search.php';
            break;

        case 'send_request':
            $sender = $_SESSION['user_id'];
            $receiver = isset($_GET['id']) ? (int)$_GET['id'] : 0;

            if ($receiver > 0) {
                // Vérifier que la demande n’existe pas déjà
                $check = $pdo->prepare("SELECT 1 FROM friend_requests WHERE 
                    (sender_id = ? AND receiver_id = ?) OR 
                    (sender_id = ? AND receiver_id = ?)");
                $check->execute([$sender, $receiver, $receiver, $sender]);

                if ($check->rowCount() === 0) {
                    $stmt = $pdo->prepare("INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)");
                    $stmt->execute([$sender, $receiver]);
                }
            }

            header("Location: ?action=search_user");
            break;

        case 'accept_request':
            $requestId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

            if ($requestId > 0) {
                $stmt = $pdo->prepare("UPDATE friend_requests SET status = 1 WHERE id = ?");
                $stmt->execute([$requestId]);
            }

            header("Location: ?action=view_requests");
            break;

        case 'reject_request':
            $requestId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

            if ($requestId > 0) {
                $stmt = $pdo->prepare("DELETE FROM friend_requests WHERE id = ?");
                $stmt->execute([$requestId]);
            }

            header("Location: ?action=view_requests");
            break;

        case 'remove_friend':
            $currentUser = $_SESSION['user_id'];
            $friendId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

            if ($friendId > 0) {
                $stmt = $pdo->prepare("
                    DELETE FROM friend_requests
                    WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
                    AND status = 1
                ");
                $stmt->execute([$currentUser, $friendId, $friendId, $currentUser]);
            }

            header("Location: ?action=view_friends");
            break;

        case 'view_requests':
            $userId = $_SESSION['user_id'];
            $stmt = $pdo->prepare("SELECT * FROM friend_requests WHERE receiver_id = ? AND status = 0");
            $stmt->execute([$userId]);
            $requests = $stmt->fetchAll();
            include './views/friends/requests.php';
            break;

        case 'view_friends':
            $userId = $_SESSION['user_id'];
            $stmt = $pdo->prepare("
                SELECT u.id, u.username, u.profile_picture
                FROM users u
                JOIN friend_requests f ON (
                    (f.sender_id = :id AND f.receiver_id = u.id)
                    OR (f.receiver_id = :id AND f.sender_id = u.id)
                )
                WHERE f.status = 1
            ");
            $stmt->execute(['id' => $userId]);
            $friends = $stmt->fetchAll();
            include './views/friends/list.php';
            break;
    }
}
