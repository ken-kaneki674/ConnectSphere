function getDBConnection() {
    $config = require __DIR__.'/database.php';
    try {
        return new PDO(
            "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}",
            $config['username'],
            $config['password'],
            $config['options'] ?? [] // Utilise les options définies ou un tableau vide par défaut
        );
    } catch (PDOException $e) {
        die("Erreur de connexion : ".$e->getMessage());
    }
}