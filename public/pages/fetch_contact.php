<?php
// Inclure le fichier de connexion à la base de données
require_once __DIR__ . '/../../includes/db.php';
session_start();

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user'])) {
    echo "Vous devez être connecté pour voir vos contacts.";
    exit();
}

$userId = $_SESSION['user']['id'];

// Préparer la requête pour récupérer les utilisateurs ayant une conversation avec l'utilisateur actuel
$stmt = $pdo->prepare("
    SELECT u.id, u.username FROM users u
    JOIN (
        SELECT user1_id AS id FROM conversations WHERE user2_id = ?
        UNION
        SELECT user2_id AS id FROM conversations WHERE user1_id = ?
    ) AS conv ON u.id = conv.id
    WHERE u.id != ?   -- Exclure l'utilisateur actuel
");
$stmt->execute([$userId, $userId, $userId]);

// Récupérer tous les contacts
$contacts = $stmt->fetchAll();

// Vérifier s'il y a des contacts à afficher
if (count($contacts) > 0) {
    // Afficher les contacts
    foreach ($contacts as $contact) {
        echo "<div class='contact-item mb-2 p-2 border rounded' style='cursor:pointer' data-id='{$contact['id']}'>
                {$contact['username']}
            </div>";
    }
} else {
    // Afficher un message si aucun contact n'est trouvé
    echo "<p>Aucun contact trouvé. Démarrez une conversation pour ajouter des contacts.</p>";
}
?>
