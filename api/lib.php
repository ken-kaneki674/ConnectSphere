<?php
// Fonctions partagées par l'API PHP (api/index.php)

function respond($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Chemin de la requête sans le préfixe /api (fonctionne avec « php -S » et sous Apache)
function apiPath(): string
{
    if (!empty($_SERVER['PATH_INFO'])) {
        $path = $_SERVER['PATH_INFO'];
    } else {
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $pos = strpos($path, '/api/');
        if ($pos !== false) {
            $path = substr($path, $pos + 4);
        } elseif (substr($path, -4) === '/api') {
            $path = '/';
        }
    }
    return rtrim($path, '/') ?: '/';
}

function requestBody(): array
{
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : $_POST;
}

// ---------- JWT (HS256), compatible avec les tokens du backend Node si le secret est le même ----------

function jwtSecret(): string
{
    $secret = getenv('JWT_SECRET');
    if (!$secret) {
        // Réutilise la configuration du backend Node si elle existe
        $envFile = __DIR__ . '/../backend/.env';
        if (is_readable($envFile)) {
            foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if (strpos($line, 'JWT_SECRET=') === 0) {
                    $secret = trim(substr($line, strlen('JWT_SECRET=')));
                }
            }
        }
    }
    if (!$secret) {
        error_log('JWT_SECRET is not configured');
        respond(['error' => 'Server misconfigured'], 500);
    }
    return $secret;
}

function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string
{
    return (string)base64_decode(strtr($data, '-_', '+/'));
}

function jwtSign(array $user): string
{
    $header = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $now = time();
    $payload = base64UrlEncode(json_encode([
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'iat' => $now,
        'exp' => $now + 24 * 3600,
    ]));
    $signature = base64UrlEncode(hash_hmac('sha256', "$header.$payload", jwtSecret(), true));
    return "$header.$payload.$signature";
}

function jwtVerify(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    [$header, $payload, $signature] = $parts;
    $expected = base64UrlEncode(hash_hmac('sha256', "$header.$payload", jwtSecret(), true));
    if (!hash_equals($expected, $signature)) {
        return null;
    }
    $data = json_decode(base64UrlDecode($payload), true);
    if (!is_array($data) || !isset($data['id']) || (isset($data['exp']) && $data['exp'] < time())) {
        return null;
    }
    $data['id'] = (int)$data['id'];
    return $data;
}

function bearerToken(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!$header && function_exists('getallheaders')) {
        $headers = array_change_key_case(getallheaders(), CASE_LOWER);
        $header = $headers['authorization'] ?? '';
    }
    return strpos($header, 'Bearer ') === 0 ? substr($header, 7) : null;
}

function requireAuth(): array
{
    $token = bearerToken();
    if (!$token) {
        respond(['error' => 'Access token required'], 401);
    }
    $user = jwtVerify($token);
    if (!$user) {
        respond(['error' => 'Invalid or expired token'], 401);
    }
    return $user;
}

function optionalAuth(): ?array
{
    $token = bearerToken();
    return $token ? jwtVerify($token) : null;
}

// ---------- Mise en forme ----------

function publicUser(array $user): array
{
    return [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'bio' => $user['bio'] ?? null,
        'profile_picture' => $user['profile_picture'] ?? null,
    ];
}

function formatPost(array $row): array
{
    return [
        'id' => (int)$row['id'],
        'user_id' => (int)$row['user_id'],
        'content' => $row['content'],
        'image_path' => $row['image_path'],
        'created_at' => $row['created_at'],
        'likes_count' => (int)$row['likes_count'],
        'comments_count' => (int)$row['comments_count'],
        'liked' => (bool)$row['liked'],
        'user' => [
            'id' => (int)$row['user_id'],
            'username' => $row['username'],
            'profile_picture' => $row['profile_picture'],
        ],
    ];
}

function formatComment(array $row): array
{
    return [
        'id' => (int)$row['id'],
        'post_id' => (int)$row['post_id'],
        'user_id' => (int)$row['user_id'],
        'content' => $row['content'],
        'created_at' => $row['created_at'],
        'user' => [
            'id' => (int)$row['user_id'],
            'username' => $row['username'],
            'profile_picture' => $row['profile_picture'],
        ],
    ];
}

function formatMessage(array $msg, int $userId): array
{
    return [
        'id' => (int)$msg['id'],
        'conversation_id' => (int)$msg['conversation_id'],
        'sender_id' => (int)$msg['sender_id'],
        'username' => $msg['username'],
        'content' => $msg['content'],
        'is_read' => (bool)$msg['is_read'],
        'created_at' => $msg['sent_at'],
        'is_sender' => (int)$msg['sender_id'] === $userId,
    ];
}

// ---------- Requêtes ----------

function getPosts(PDO $pdo, int $viewerId, string $where = '', array $params = []): array
{
    $stmt = $pdo->prepare("
        SELECT p.id, p.user_id, p.content, p.image_path, p.created_at,
               u.username, u.profile_picture,
               (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likes_count,
               (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) AS comments_count,
               EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        $where
        ORDER BY p.created_at DESC, p.id DESC");
    $stmt->execute(array_merge([$viewerId], $params));
    return array_map('formatPost', $stmt->fetchAll());
}

function getPost(PDO $pdo, int $viewerId, int $postId): ?array
{
    return getPosts($pdo, $viewerId, 'WHERE p.id = ?', [$postId])[0] ?? null;
}

function postExists(PDO $pdo, int $postId): bool
{
    $stmt = $pdo->prepare('SELECT id FROM posts WHERE id = ?');
    $stmt->execute([$postId]);
    return (bool)$stmt->fetch();
}

function getComments(PDO $pdo, int $postId): array
{
    $stmt = $pdo->prepare('
        SELECT c.*, u.username, u.profile_picture
        FROM post_comments c JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ? ORDER BY c.created_at ASC, c.id ASC');
    $stmt->execute([$postId]);
    return array_map('formatComment', $stmt->fetchAll());
}

function getComment(PDO $pdo, int $commentId): array
{
    $stmt = $pdo->prepare('
        SELECT c.*, u.username, u.profile_picture
        FROM post_comments c JOIN users u ON c.user_id = u.id
        WHERE c.id = ?');
    $stmt->execute([$commentId]);
    return formatComment($stmt->fetch());
}

function toggleLike(PDO $pdo, int $postId, int $userId): array
{
    $stmt = $pdo->prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?');
    $stmt->execute([$postId, $userId]);
    $liked = $stmt->rowCount() === 0;
    if ($liked) {
        $pdo->prepare('INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)')->execute([$postId, $userId]);
    }
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM post_likes WHERE post_id = ?');
    $stmt->execute([$postId]);
    return ['liked' => $liked, 'likes_count' => (int)$stmt->fetchColumn()];
}

function isParticipant(PDO $pdo, int $conversationId, int $userId): bool
{
    $stmt = $pdo->prepare('SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)');
    $stmt->execute([$conversationId, $userId, $userId]);
    return (bool)$stmt->fetch();
}

function getConversations(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare("
        SELECT c.id, c.updated_at,
               u.id AS other_id, u.username AS other_username, u.profile_picture AS other_profile_picture,
               (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC, id DESC LIMIT 1) AS last_message,
               (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id <> ? AND is_read = 0) AS unread
        FROM conversations c
        JOIN users u ON u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id)
        WHERE c.user1_id = ? OR c.user2_id = ?
        ORDER BY c.updated_at DESC");
    $stmt->execute([$userId, $userId, $userId, $userId]);

    return array_map(fn($conv) => [
        'id' => (int)$conv['id'],
        'user' => [
            'id' => (int)$conv['other_id'],
            'username' => $conv['other_username'],
            'profile_picture' => $conv['other_profile_picture'],
        ],
        'last_message' => $conv['last_message'] ?? 'Pas de message',
        'unread' => (int)$conv['unread'],
        'updated_at' => $conv['updated_at'],
    ], $stmt->fetchAll());
}

function getGroup(PDO $pdo, int $groupId, int $userId, int $membersLimit = 5): ?array
{
    $stmt = $pdo->prepare('
        SELECT g.*,
               (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members_count,
               (SELECT role FROM group_members WHERE group_id = g.id AND user_id = ?) AS my_role
        FROM `groups` g WHERE g.id = ?');
    $stmt->execute([$userId, $groupId]);
    $group = $stmt->fetch();
    if (!$group) {
        return null;
    }

    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.profile_picture, gm.role, gm.joined_at
        FROM group_members gm JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = ?
        ORDER BY gm.role = 'admin' DESC, u.username ASC
        LIMIT " . (int)$membersLimit);
    $stmt->execute([$groupId]);

    $myRole = $group['my_role'];
    unset($group['my_role']);
    $group['id'] = (int)$group['id'];
    $group['creator_id'] = (int)$group['creator_id'];
    $group['members_count'] = (int)$group['members_count'];
    $group['is_member'] = $myRole !== null;
    $group['is_admin'] = $myRole === 'admin';
    $group['members'] = $stmt->fetchAll();
    return $group;
}
