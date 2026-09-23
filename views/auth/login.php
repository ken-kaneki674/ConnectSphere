<?php // Vue incluse par public/index.php ; variable disponible : $error ?>
<style>
    .login-card {
        background-color: #FFFFFF;
        border-radius: 2rem;
        padding: 2rem;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 400px;
    }
    .login-card .btn-primary {
        background-color: #5865F2;
        border-color: #5865F2;
    }
    .login-card .btn-primary:hover {
        background-color: #4752c4;
        border-color: #4752c4;
    }
    .login-card a {
        color: #5865F2;
    }
</style>

<div class="d-flex justify-content-center">
    <div class="login-card">
        <h2 class="text-center mb-4">🔐 Connexion à ConnectSphere</h2>

        <?php if (!empty($error)): ?>
            <div class="alert alert-danger"><?= e($error) ?></div>
        <?php endif; ?>

        <form method="POST" action="index.php?page=login">
            <?= csrfField() ?>
            <div class="mb-3">
                <input type="email" name="email" class="form-control" placeholder="Adresse email"
                       value="<?= e($_POST['email'] ?? '') ?>" required>
            </div>
            <div class="mb-3">
                <input type="password" name="password" class="form-control" placeholder="Mot de passe" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Connexion</button>
        </form>
        <p class="text-center mt-3">
            Pas encore de compte ? <a href="index.php?page=register">Créer un compte</a>
        </p>
    </div>
</div>
