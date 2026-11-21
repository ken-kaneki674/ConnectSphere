<div class="d-flex justify-content-center align-items-center" style="min-height: 60vh;">
    <div class="text-center p-5 rounded shadow" style="background-color: #FFFFFF;">
        <?php if (isLoggedIn()): ?>
            <h1 class="mb-3" style="color: #5865F2;">Bienvenue, <?= e(currentUser()['username']) ?> 👋</h1>
            <a href="index.php?page=feed" class="btn me-2" style="background-color: #5865F2; color: white;">Voir le fil d'actualité</a>
            <a href="index.php?page=logout" class="btn" style="background-color: #F04747; color: white;">Se déconnecter</a>
        <?php else: ?>
            <h1 class="mb-4" style="color: #5865F2;">Bienvenue sur <span style="color: #2C2F33;">ConnectSphere</span></h1>
            <a href="index.php?page=login" class="btn me-2" style="background-color: #5865F2; color: white;">Connexion</a>
            <a href="index.php?page=register" class="btn btn-outline-primary" style="border-color: #99AAB5; color: #5865F2;">Créer un compte</a>
        <?php endif; ?>
    </div>
</div>
