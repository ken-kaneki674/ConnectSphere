<?php 
$host= "localhost";
$dbname= "connectsphere";
$username= "root";
$password= "";


try {
    $pdo= new PDO("mysql:host=$host;dbname=$dbname; utf8mb4_general_ci	 ",$username, $password);
} catch (PDOException $e) {
    die("Erreur connexion: ".$e->getMessage());
}


?>