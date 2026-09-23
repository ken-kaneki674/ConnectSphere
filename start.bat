@echo off
echo 🚀 Démarrage de ConnectSphere...
echo.

echo 📦 Installation des dépendances backend...
cd backend
call npm install
if not exist .env (
    copy .env.example .env > nul
    echo ⚠️  backend\.env créé depuis .env.example : pensez à définir JWT_SECRET et les accès MySQL.
)
echo.

echo 🔥 Démarrage du backend Node.js...
start "Backend" cmd /k "npm start"
echo Backend démarré sur http://localhost:8000
echo.

echo ⏱️  Attente de 3 secondes...
timeout /t 3 /nobreak > nul

echo 📦 Installation des dépendances frontend...
cd ..
call npm install
echo.

echo 🎨 Démarrage du frontend Vue.js...
start "Frontend" cmd /k "npm run serve"
echo Frontend démarré sur http://localhost:8080
echo.

echo ✅ ConnectSphere est prêt !
echo 🌐 Frontend: http://localhost:8080
echo 🔌 Backend API: http://localhost:8000/api
echo.
echo 🗄️  Base requise : importez connectsphere_schema.sql dans MySQL avant la première utilisation.
echo.
echo 🔑 Compte de test:
echo    Username: demo
echo    Password: demo
echo.
pause
