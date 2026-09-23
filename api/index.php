<?php
// API REST PHP de ConnectSphere : même contrat que le backend Node.js (backend/routes).
// Démarrage : php -S localhost:8000 api/index.php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . (getenv('CORS_ORIGIN') ?: 'http://localhost:8080'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/lib.php';

try {
    require_once __DIR__ . '/../config/database.php';
} catch (PDOException $e) {
    error_log('DB connection error: ' . $e->getMessage());
    respond(['error' => 'Database unavailable'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = apiPath();
$body = requestBody();

try {
    // ---------- Auth ----------
    if ($path === '/auth/login' && $method === 'POST') {
        $login = trim((string)($body['username'] ?? ''));
        $password = (string)($body['password'] ?? '');
        if ($login === '' || $password === '') {
            respond(['error' => 'Username and password required'], 400);
        }
        $stmt = $pdo->prepare('SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1');
        $stmt->execute([$login, $login]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password'])) {
            respond(['error' => 'Invalid credentials'], 401);
        }
        respond(['user' => publicUser($user), 'token' => jwtSign($user)]);
    }

    if ($path === '/auth/register' && $method === 'POST') {
        $username = trim((string)($body['username'] ?? ''));
        $email = trim((string)($body['email'] ?? ''));
        $password = (string)($body['password'] ?? '');
        if ($username === '' || $email === '' || $password === '') {
            respond(['error' => 'All fields required'], 400);
        }
        if (strlen($password) < 6) {
            respond(['error' => 'Password must be at least 6 characters'], 400);
        }
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            respond(['error' => 'User already exists'], 409);
        }
        $pdo->prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
            ->execute([$username, $email, password_hash($password, PASSWORD_BCRYPT)]);
        respond(['message' => 'User created successfully'], 201);
    }

    if ($path === '/auth/profile' && $method === 'GET') {
        $me = requireAuth();
        $stmt = $pdo->prepare('SELECT id, username, email, bio, profile_picture FROM users WHERE id = ?');
        $stmt->execute([$me['id']]);
        $user = $stmt->fetch();
        if (!$user) {
            respond(['error' => 'User not found'], 404);
        }
        respond(publicUser($user));
    }

    // ---------- Posts ----------
    if ($path === '/posts') {
        if ($method === 'GET') {
            respond(getPosts($pdo, optionalAuth()['id'] ?? 0));
        }
        if ($method === 'POST') {
            $me = requireAuth();
            $content = trim((string)($body['content'] ?? ''));
            if ($content === '') {
                respond(['error' => 'Content required'], 400);
            }
            $pdo->prepare('INSERT INTO posts (user_id, content, image_path) VALUES (?, ?, ?)')
                ->execute([$me['id'], $content, $body['image_path'] ?? null]);
            respond(getPost($pdo, $me['id'], (int)$pdo->lastInsertId()), 201);
        }
    }

    if (preg_match('#^/posts/(\d+)$#', $path, $m)) {
        $postId = (int)$m[1];
        if ($method === 'GET') {
            $post = getPost($pdo, optionalAuth()['id'] ?? 0, $postId);
            $post ? respond($post) : respond(['error' => 'Post not found'], 404);
        }
        if ($method === 'DELETE') {
            $me = requireAuth();
            $stmt = $pdo->prepare('DELETE FROM posts WHERE id = ? AND user_id = ?');
            $stmt->execute([$postId, $me['id']]);
            $stmt->rowCount()
                ? respond(['message' => 'Post deleted successfully'])
                : respond(['error' => 'Post not found or unauthorized'], 404);
        }
    }

    if (preg_match('#^/(?:posts/(\d+)/comments|comments/(\d+))$#', $path, $m) && $method !== 'DELETE') {
        $postId = (int)($m[1] ?: $m[2]);
        if ($method === 'GET') {
            respond(getComments($pdo, $postId));
        }
        if ($method === 'POST') {
            $me = requireAuth();
            $content = trim((string)($body['content'] ?? ''));
            if ($content === '') {
                respond(['error' => 'Content required'], 400);
            }
            if (!postExists($pdo, $postId)) {
                respond(['error' => 'Post not found'], 404);
            }
            $pdo->prepare('INSERT INTO post_comments (post_id, user_id, content) VALUES (?, ?, ?)')
                ->execute([$postId, $me['id'], $content]);
            respond(getComment($pdo, (int)$pdo->lastInsertId()), 201);
        }
    }

    if (preg_match('#^/comments/(\d+)$#', $path, $m) && $method === 'DELETE') {
        $me = requireAuth();
        $stmt = $pdo->prepare('DELETE FROM post_comments WHERE id = ? AND user_id = ?');
        $stmt->execute([(int)$m[1], $me['id']]);
        $stmt->rowCount()
            ? respond(['message' => 'Comment deleted successfully'])
            : respond(['error' => 'Comment not found or unauthorized'], 404);
    }

    if (preg_match('#^/(?:posts/(\d+)/like|likes/(\d+))$#', $path, $m) && $method === 'POST') {
        $me = requireAuth();
        $postId = (int)($m[1] ?: $m[2]);
        if (!postExists($pdo, $postId)) {
            respond(['error' => 'Post not found'], 404);
        }
        respond(toggleLike($pdo, $postId, $me['id']));
    }

    if (preg_match('#^/(?:posts/(\d+)/likes|likes/(\d+))$#', $path, $m) && $method === 'GET') {
        $stmt = $pdo->prepare('
            SELECT pl.id, pl.user_id, pl.post_id, pl.created_at, u.username
            FROM post_likes pl JOIN users u ON pl.user_id = u.id
            WHERE pl.post_id = ? ORDER BY pl.created_at DESC');
        $stmt->execute([(int)($m[1] ?: $m[2])]);
        respond($stmt->fetchAll());
    }

    // ---------- Users ----------
    if ($path === '/users/search' && $method === 'GET') {
        requireAuth();
        $term = trim((string)($_GET['q'] ?? ''));
        if ($term === '') {
            respond([]);
        }
        $stmt = $pdo->prepare("
            SELECT id, username, profile_picture FROM users
            WHERE username LIKE ? AND is_active = 1
            ORDER BY username ASC LIMIT 20");
        $stmt->execute(['%' . addcslashes($term, '%_\\') . '%']);
        respond($stmt->fetchAll());
    }

    if (preg_match('#^/users/(\d+)$#', $path, $m) && $method === 'GET') {
        $stmt = $pdo->prepare('
            SELECT u.id, u.username, u.bio, u.profile_picture, u.created_at,
                   (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
                   (SELECT COUNT(*) FROM group_members WHERE user_id = u.id) AS groups_count,
                   (SELECT COUNT(*) FROM friend_requests
                     WHERE status = 1 AND (sender_id = u.id OR receiver_id = u.id)) AS friends_count
            FROM users u WHERE u.id = ? AND u.is_active = 1');
        $stmt->execute([(int)$m[1]]);
        $user = $stmt->fetch();
        if (!$user) {
            respond(['error' => 'User not found'], 404);
        }
        foreach (['id', 'posts_count', 'groups_count', 'friends_count'] as $key) {
            $user[$key] = (int)$user[$key];
        }
        respond($user);
    }

    if (preg_match('#^/users/(\d+)/posts$#', $path, $m) && $method === 'GET') {
        respond(getPosts($pdo, optionalAuth()['id'] ?? 0, 'WHERE p.user_id = ?', [(int)$m[1]]));
    }

    // ---------- Messages ----------
    if ($path === '/messages/conversations') {
        $me = requireAuth();
        if ($method === 'GET') {
            respond(getConversations($pdo, $me['id']));
        }
        if ($method === 'POST') {
            $recipient = null;
            if (!empty($body['recipientId'])) {
                $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
                $stmt->execute([(int)$body['recipientId']]);
                $recipient = $stmt->fetch();
            } elseif (!empty($body['username'])) {
                $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
                $stmt->execute([trim((string)$body['username'])]);
                $recipient = $stmt->fetch();
            }
            if (!$recipient) {
                respond(['error' => 'User not found'], 404);
            }
            if ((int)$recipient['id'] === $me['id']) {
                respond(['error' => 'Valid recipient required'], 400);
            }
            $stmt = $pdo->prepare('SELECT id FROM conversations
                WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)');
            $stmt->execute([$me['id'], $recipient['id'], $recipient['id'], $me['id']]);
            if ($existing = $stmt->fetch()) {
                respond(['conversationId' => (int)$existing['id']]);
            }
            $pdo->prepare('INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)')
                ->execute([$me['id'], $recipient['id']]);
            respond(['conversationId' => (int)$pdo->lastInsertId()], 201);
        }
    }

    if (preg_match('#^/messages/conversations/(\d+)$#', $path, $m)) {
        $me = requireAuth();
        $conversationId = (int)$m[1];
        if (!isParticipant($pdo, $conversationId, $me['id'])) {
            respond(['error' => 'Access denied'], 403);
        }
        if ($method === 'GET') {
            $stmt = $pdo->prepare('
                SELECT m.*, u.username FROM messages m JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = ? ORDER BY m.sent_at ASC, m.id ASC');
            $stmt->execute([$conversationId]);
            $messages = array_map(fn($msg) => formatMessage($msg, $me['id']), $stmt->fetchAll());
            $pdo->prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id <> ? AND is_read = 0')
                ->execute([$conversationId, $me['id']]);
            respond($messages);
        }
        if ($method === 'POST') {
            $content = trim((string)($body['content'] ?? ''));
            if ($content === '') {
                respond(['error' => 'Content required'], 400);
            }
            $pdo->prepare('INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)')
                ->execute([$conversationId, $me['id'], $content]);
            $messageId = (int)$pdo->lastInsertId();
            $pdo->prepare('UPDATE conversations SET updated_at = NOW() WHERE id = ?')->execute([$conversationId]);
            $stmt = $pdo->prepare('SELECT m.*, u.username FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?');
            $stmt->execute([$messageId]);
            respond(formatMessage($stmt->fetch(), $me['id']), 201);
        }
    }

    // ---------- Groups ----------
    if ($path === '/groups') {
        $me = requireAuth();
        if ($method === 'GET') {
            $stmt = $pdo->prepare("
                SELECT g.id FROM `groups` g
                LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?
                WHERE g.privacy = 'public' OR gm.id IS NOT NULL
                ORDER BY gm.id IS NULL, g.created_at DESC");
            $stmt->execute([$me['id']]);
            respond(array_map(fn($row) => getGroup($pdo, (int)$row['id'], $me['id']), $stmt->fetchAll()));
        }
        if ($method === 'POST') {
            $name = trim((string)($body['name'] ?? ''));
            if ($name === '') {
                respond(['error' => 'Group name required'], 400);
            }
            $privacy = ($body['privacy'] ?? '') === 'private' ? 'private' : 'public';
            $pdo->prepare('INSERT INTO `groups` (name, description, privacy, creator_id) VALUES (?, ?, ?, ?)')
                ->execute([$name, (string)($body['description'] ?? ''), $privacy, $me['id']]);
            $groupId = (int)$pdo->lastInsertId();
            $pdo->prepare("INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'admin')")
                ->execute([$groupId, $me['id']]);
            respond(getGroup($pdo, $groupId, $me['id']), 201);
        }
    }

    if (preg_match('#^/groups/(\d+)(?:/(join|leave))?$#', $path, $m)) {
        $me = requireAuth();
        $groupId = (int)$m[1];
        $action = $m[2] ?? '';
        $group = getGroup($pdo, $groupId, $me['id'], $action === '' && $method === 'GET' ? 100 : 5);
        if (!$group) {
            respond(['error' => 'Group not found'], 404);
        }

        if ($action === '' && $method === 'GET') {
            if ($group['privacy'] === 'private' && !$group['is_member']) {
                respond(['error' => 'Access denied'], 403);
            }
            respond($group);
        }
        if ($action === '' && $method === 'PUT') {
            if (!$group['is_admin']) {
                respond(['error' => 'Admin access required'], 403);
            }
            $name = trim((string)($body['name'] ?? $group['name']));
            if ($name === '') {
                respond(['error' => 'Group name required'], 400);
            }
            $privacy = ($body['privacy'] ?? $group['privacy']) === 'private' ? 'private' : 'public';
            $pdo->prepare('UPDATE `groups` SET name = ?, description = ?, privacy = ? WHERE id = ?')
                ->execute([$name, (string)($body['description'] ?? $group['description']), $privacy, $groupId]);
            respond(getGroup($pdo, $groupId, $me['id']));
        }
        if ($action === '' && $method === 'DELETE') {
            if (!$group['is_admin']) {
                respond(['error' => 'Admin access required'], 403);
            }
            $pdo->prepare('DELETE FROM `groups` WHERE id = ?')->execute([$groupId]);
            respond(['message' => 'Group deleted successfully']);
        }
        if ($action === 'join' && $method === 'POST') {
            if ($group['is_member']) {
                respond(['error' => 'Already a member'], 409);
            }
            if ($group['privacy'] === 'private') {
                respond(['error' => 'Private group'], 403);
            }
            $pdo->prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)')->execute([$groupId, $me['id']]);
            respond(getGroup($pdo, $groupId, $me['id']));
        }
        if ($action === 'leave' && $method === 'POST') {
            if (!$group['is_member']) {
                respond(['error' => 'Not a member'], 404);
            }
            $pdo->prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?')->execute([$groupId, $me['id']]);
            respond(getGroup($pdo, $groupId, $me['id']));
        }
    }

    if ($path === '' || $path === '/') {
        respond(['name' => 'ConnectSphere API (PHP)']);
    }

    respond(['error' => 'Route not found'], 404);
} catch (Throwable $e) {
    error_log('API error: ' . $e->getMessage());
    respond(['error' => 'Server error'], 500);
}
