@echo off
chcp 65001 >nul
rem Gera o "Instalar Pomodoro Lo-fi.exe" na pasta saida.
rem So precisa gerar de novo se mudar o programa (main.js, preload.js, icone). O site atualiza sozinho.
cd /d "%~dp0"
if not exist node_modules call npm install --no-fund --no-audit
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npx electron-builder --win nsis
if errorlevel 1 goto erro
echo.
echo Pronto! O instalador esta em: %~dp0saida\Instalar Pomodoro Lo-fi.exe
explorer /select,"%~dp0saida\Instalar Pomodoro Lo-fi.exe"
pause
exit /b 0
:erro
echo.
echo Deu erro ao gerar o instalador.
pause
exit /b 1
