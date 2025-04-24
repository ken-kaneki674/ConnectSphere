<?php
require_once '../config/database.php';
require_once '../models/User.php';
session_start();

$current_user_id = 1; // ⚠️ Remplacer par $_SESSION['user_id'] en prod

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    switch ($action) {
        case 'send_request':
            if (!empty($_POST['receiver_id'])) {
                $receiver_id = (int) $_POST['receiver_id'];

                // Vérifier si la demande existe déjà
                $check = $pdo->prepare("SELECT * FROM friend_requests WHERE 
                    (sender_id = ? AND receiver_id = ?) OR 
                    (sender_id = ? AND receiver_id = ?)");
                $check->execute([$current_user_id, $receiver_id, $receiver_id, $current_user_id]);

                if ($check->rowCount() === 0) {
                    $stmt = $pdo->prepare("INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)");
                    $stmt->execute([$current_user_id, $receiver_id]);
                }
            }
            header('Location: ../views/friends/search.php');
            break;

        case 'accept_request':
            if (!empty($_POST['request_id'])) {
                $request_id = (int) $_POST['request_id'];
                $stmt = $pdo->prepare("UPDATE friend_requests SET status = 1 WHERE id = ? AND receiver_id = ?");
                $stmt->execute([$request_id, $current_user_id]);
            }
            header('Location: ../views/friends/requests.php');
            break;

        case 'refuse_request':
            if (!empty($_POST['request_id'])) {
                $request_id = (int) $_POST['request_id'];
                $stmt = $pdo->prepare("DELETE FROM friend_requests WHERE id = ? AND receiver_id = ?");
                $stmt->execute([$request_id, $current_user_id]);
            }
            header('Location: ../views/friends/requests.php');
            break;

        case 'remove_friend':
            if (!empty($_POST['friend_id'])) {
                $friend_id = (int) $_POST['friend_id'];
                $stmt = $pdo->prepare("DELETE FROM friend_requests WHERE 
                    ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) 
                    AND status = 1");
                $stmt->execute([$current_user_id, $friend_id, $friend_id, $current_user_id]);
            }
            header('Location: ../views/friends/list.php');
            break;

        case 'search_users':
            if (!empty($_POST['keyword'])) {
                $keyword = $_POST['keyword'];
                $results = User::searchUsersByUsername($pdo, $current_user_id, $keyword);
                include '../views/friends/search.php';
            } else {
                header('Location: ../views/friends/search.php');
            }
            break;

        case 'list_friends':
            $stmt = $pdo->prepare("
                SELECT u.id, u.username, u.profile_picture
                FROM users u
                INNER JOIN friend_requests fr
                    ON (u.id = fr.sender_id OR u.id = fr.receiver_id)
                WHERE (fr.sender_id = :user_id OR fr.receiver_id = :user_id)
                  AND fr.status = 1
                  AND u.id != :user_id
            ");
            $stmt->execute(['user_id' => $current_user_id]);

            $friends = $stmt->fetchAll();
            include '../views/friends/list.php';
            break;

        default:
            header('Location: ../public/index.php');
            break;
    }
} else {
    header('Location: ../public/index.php');
    exit;
}
