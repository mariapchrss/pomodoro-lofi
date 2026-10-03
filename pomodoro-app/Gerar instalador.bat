@echo off
chcp 65001 >nul
rem Gera o instalador do programa em %LOCALAPPDATA%\pomodoro-lofi-saida (fora do OneDrive, que prende arquivo no meio).
rem So precisa gerar de novo se mudar o PROGRAMA (main.js, preload.js, pet.html, icone). O site atualiza sozinho.
rem Antes de gerar, aumente a "version" no package.json (1.0.1 -> 1.0.2...).
cd /d "%~dp0"
if not exist node_modules call npm install --no-fund --no-audit
set CSC_IDENTITY_AUTO_DISCOVERY=false
set SAIDA=%LOCALAPPDATA%\pomodoro-lofi-saida
set N=0
:tentar
set /a N+=1
call npx electron-builder --win nsis --publish never
if not errorlevel 1 goto ok
if %N% GEQ 4 goto erro
echo.
echo O antivirus prendeu um arquivo no meio. Tentando de novo (%N% de 4)...
timeout /t 5 >nul
goto tentar
:ok
echo.
echo Pronto! O instalador esta em: %SAIDA%\Instalar-Pomodoro-Lo-fi.exe
echo Para os programas ja instalados se atualizarem sozinhos, a versao nova tem que ir para Releases no GitHub
echo com 3 arquivos: Instalar-Pomodoro-Lo-fi.exe, Instalar-Pomodoro-Lo-fi.exe.blockmap e latest.yml
explorer /select,"%SAIDA%\Instalar-Pomodoro-Lo-fi.exe"
pause
exit /b 0
:erro
echo.
echo Deu erro ao gerar o instalador.
pause
exit /b 1
