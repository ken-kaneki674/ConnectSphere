@echo off
echo ========================================================
echo   Lancement de ConnectSphere Mobile (React Native)
echo ========================================================

echo 1. Demarrage du Backend Express API (Port 8000)...
start "ConnectSphere API" cmd /k "cd /d %~dp0\backend && npm start"

echo 2. Demarrage de l'Application Mobile Expo / React Native...
start "ConnectSphere Mobile" cmd /k "cd /d %~dp0\mobile && npx expo start -c"

echo ========================================================
echo   ConnectSphere Mobile est pret !
echo   - Scannez le QR Code avec Expo Go sur votre telephone
echo   - Appuyez sur 'w' pour tester sur navigateur Web
echo   - Appuyez sur 'a' pour lancer sur Android Emulator
echo ========================================================
pause
