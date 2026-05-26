@echo off
echo Iniciando PhishGuard...

start "PhishGuard Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn api:app --reload"

timeout /t 3 /nobreak > nul

start "PhishGuard Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173