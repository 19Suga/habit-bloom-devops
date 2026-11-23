@echo off
setlocal
title Habit Bloom

where node >nul 2>nul
if errorlevel 1 goto :node_error

echo Instalando dependencias del proyecto...
call npm install
if errorlevel 1 goto :install_error
call npm run setup
if errorlevel 1 goto :install_error

echo.
echo Habit Bloom se abrira en http://localhost:5173
echo Para detener el proyecto, presiona Ctrl+C.
echo.
call npm run dev
goto :end

:node_error
echo.
echo No se encontro Node.js. Instala Node.js 20 o superior y vuelve a intentarlo.
pause
goto :end

:install_error
echo.
echo No fue posible instalar las dependencias. Comprueba tu conexion a Internet.
pause

:end
endlocal
