@echo off
rem Opens the Culture Ivoire TikTok Studio: double-click, then use the page.
cd /d "%~dp0"
title Studio Culture Ivoire - laisser ouvert, fermer pour arreter
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3457"
node marketing\tiktok\studio.mjs
pause
