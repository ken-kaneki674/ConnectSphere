<?php
// config/database.php
$host = 'localhost';
$dbname = 'ConnectSphere';
$user = 'root'; // À remplacer par vos identifiants
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion DB : " . $e->getMessage());
}
?>