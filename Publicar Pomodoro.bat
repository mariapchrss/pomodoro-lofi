@echo off
chcp 65001 >nul
rem Publica o Pomodoro Lo-fi (cópia dos fãs) em https://pomodoro-lofi.web.app e as regras do Firestore.
rem Na primeira vez neste computador, rode antes: firebase login
cd /d "%~dp0"
echo Montando a copia dos fas...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0pomodoro-fas\montar.ps1"
if errorlevel 1 goto erro
echo.
echo Publicando no Firebase...
call firebase deploy --only hosting,firestore:rules --project pomodoro-lofi
if errorlevel 1 goto erro
echo.
echo Pronto! O site novo esta em https://pomodoro-lofi.web.app
pause
exit /b 0
:erro
echo.
echo Deu erro. Se for a primeira vez neste computador, rode "firebase login" e tente de novo.
pause
exit /b 1
