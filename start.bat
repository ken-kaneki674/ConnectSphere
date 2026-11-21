@echo off
echo ========================================================
echo   Lancement de ConnectSphere (Reseau Social)
echo ========================================================

echo 1. Demarrage du serveur API PHP (Port 8000)...
start "ConnectSphere API" cmd /k "cd /d %~dp0 && php -S localhost:8000 server.php"

echo 2. Demarrage du Frontend Vue.js (Port 8080)...
start "ConnectSphere Frontend" cmd /k "cd /d %~dp0 && npm run serve"

echo Application lancee !
echo Interface web : http://localhost:8080
echo API Backend   : http://localhost:8000
echo Compte test   : demo / demo
pause
