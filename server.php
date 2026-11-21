<?php
// Serveur PHP de développement pour l'API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Router pour l'API
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

// Supprimer le préfixe /api s'il existe
$path = str_replace('/api', '', $path);

// Simuler des réponses API
switch ($path) {
    case '/auth/login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data['username'] === 'demo' && $data['password'] === 'demo') {
                echo json_encode([
                    'user' => ['id' => 1, 'username' => 'demo', 'email' => 'demo@example.com'],
                    'token' => 'demo-token'
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
            }
        }
        break;
        
    case '/auth/register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            echo json_encode(['message' => 'User registered successfully']);
        }
        break;
        
    case '/posts':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            echo json_encode([
                [
                    'id' => 1,
                    'content' => 'Bienvenue sur ConnectSphere !',
                    'user' => ['username' => 'Admin', 'profile_picture' => null],
                    'created_at' => date('Y-m-d H:i:s'),
                    'likes_count' => 5
                ],
                [
                    'id' => 2,
                    'content' => 'Ceci est un post de test.',
                    'user' => ['username' => 'User1', 'profile_picture' => null],
                    'created_at' => date('Y-m-d H:i:s', strtotime('-1 hour')),
                    'likes_count' => 3
                ]
            ]);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode([
                'id' => rand(100, 999),
                'content' => $data['content'],
                'user' => ['username' => 'CurrentUser', 'profile_picture' => null],
                'created_at' => date('Y-m-d H:i:s'),
                'likes_count' => 0
            ]);
        }
        break;
        
    case preg_match('/^\/posts\/(\d+)\/comments$/', $path, $matches):
        $postId = $matches[1];
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            echo json_encode([
                ['id' => 1, 'content' => 'Super post !', 'user' => ['username' => 'User2'], 'created_at' => date('Y-m-d H:i:s')],
                ['id' => 2, 'content' => 'Merci pour le partage', 'user' => ['username' => 'User3'], 'created_at' => date('Y-m-d H:i:s', strtotime('-30 minutes'))]
            ]);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode([
                'id' => rand(100, 999),
                'content' => $data['content'],
                'user' => ['username' => 'CurrentUser'],
                'created_at' => date('Y-m-d H:i:s')
            ]);
        }
        break;
        
    case preg_match('/^\/posts\/(\d+)\/like$/', $path, $matches):
        $postId = $matches[1];
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            echo json_encode([
                'liked' => true,
                'like' => ['id' => rand(100, 999), 'user_id' => 1, 'post_id' => $postId]
            ]);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>
