<?php // Vue incluse par public/index.php ; variable disponible : $error ?>
<style>
    .register-card {
        background-color: #FFFFFF;
        padding: 2.5rem;
        border-radius: 1.5rem;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
        width: 100%;
        max-width: 450px;
    }
    .register-card .btn-success {
        background-color: #43B581;
        border-color: #43B581;
    }
    .register-card .btn-success:hover {
        background-color: #3ba771;
        border-color: #3ba771;
    }
    .register-card .btn-outline-danger {
        color: #F04747;
        border-color: #F04747;
    }
    .register-card .btn-outline-danger:hover {
        background-color: #F04747;
        color: white;
    }
    .register-card h2 {
        color: #2C2F33;
    }
</style>

<div class="d-flex justify-content-center">
    <div class="register-card">
        <h2 class="text-center mb-4">👤 Inscription ConnectSphere</h2>

        <?php if (!empty($error)): ?>
            <div class="alert alert-danger"><?= e($error) ?></div>
        <?php endif; ?>

        <form action="index.php?page=register" method="POST">
            <?= csrfField() ?>
            <div class="mb-3">
                <input type="text" name="username" placeholder="Entrez votre nom" class="form-control"
                       maxlength="50" value="<?= e($_POST['username'] ?? '') ?>" required>
            </div>
            <div class="mb-3">
                <input type="email" name="email" placeholder="Entrez votre email" class="form-control"
                       value="<?= e($_POST['email'] ?? '') ?>" required>
            </div>
            <div class="mb-3">
                <input type="password" name="password" placeholder="Entrez votre mot de passe (6 caractères min.)"
                       class="form-control" minlength="6" required>
            </div>
            <button type="submit" class="btn btn-success w-100">Soumettre</button>
            <button type="reset" class="btn btn-outline-danger w-100 mt-2">Annuler</button>
        </form>
        <p class="text-center mt-3">
            Déjà inscrit ? <a href="index.php?page=login">Se connecter</a>
        </p>
    </div>
</div>
