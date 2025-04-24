<?php 
// controllers/UserController.php
require_once './models/User.php';
require_once './config/database.php';

if (isset($_GET['action'])) {
    $action = $_GET['action'];

    switch ($action) {
        case 'search_user':
            session_start();
            $currentUserId = $_SESSION['user_id'];
            $users = User::searchUsers($pdo, $currentUserId);
            include './views/friends/search.php';
            break;

        case 'send_request':
            session_start();
            $sender = $_SESSION['user_id'];
            $receiver = $_GET['id'];
            $stmt = $pdo->prepare("INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)");
            $stmt->execute([$sender, $receiver]);
            header("Location: ?action=search_user");
            break;

        case 'accept_request':
            $stmt = $pdo->prepare("UPDATE friend_requests SET status = 1 WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            header("Location: ?action=view_requests");
            break;

        case 'reject_request':
            $stmt = $pdo->prepare("UPDATE friend_requests SET status = 2 WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            header("Location: ?action=view_requests");
            break;

        case 'remove_friend':
            session_start();
            $currentUser = $_SESSION['user_id'];
            $friendId = $_GET['id'];
            $stmt = $pdo->prepare("
                DELETE FROM friend_requests
                WHERE (sender_id = ? AND receiver_id = ?)
                   OR (sender_id = ? AND receiver_id = ?)
                   AND status = 1
            ");
            $stmt->execute([$currentUser, $friendId, $friendId, $currentUser]);
            header("Location: ?action=view_friends");
            break;

        case 'view_requests':
            session_start();
            $userId = $_SESSION['user_id'];
            $stmt = $pdo->prepare("SELECT * FROM friend_requests WHERE receiver_id = ? AND status = 0");
            $stmt->execute([$userId]);
            $requests = $stmt->fetchAll();
            include './views/friends/requests.php';
            break;

        case 'view_friends':
            session_start();
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

?>