@echo off
REM Скрипт для деплоя React приложения (Windows)
REM Использование: deploy.bat [версия]

set VERSION=%1
if "%VERSION%"=="" set VERSION=1.0.0

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BUILD_DATE=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%

echo 🚀 Начинаем деплой версии %VERSION%...

REM 1. Обновляем версию в файле
echo 📝 Обновляем версию в version.ts...
(
echo // Версия приложения - обновляйте при каждом деплое
echo export const APP_VERSION = '%VERSION%';
echo export const BUILD_DATE = '%BUILD_DATE%';
) > src\config\version.ts

REM 2. Обновляем версию в index.html (требует PowerShell или ручное обновление)
echo 📝 Обновляем версию в index.html...
powershell -Command "(Get-Content index.html) -replace '<meta name=\"app-version\" content=\".*\">', '<meta name=\"app-version\" content=\"%VERSION%\">' | Set-Content index.html"

REM 3. Билдим приложение
echo 🔨 Собираем production билд...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка при сборке!
    exit /b 1
)

echo ✅ Билд успешно создан!
echo.
echo 📦 Следующие шаги:
echo 1. Скопируйте содержимое dist/ на сервер
echo 2. Обновите локальный fallback для следующего релиза:
echo    xcopy /E /I /Y dist\* ..\assets\web\
echo.
echo ✨ Версия %VERSION% готова к деплою!


