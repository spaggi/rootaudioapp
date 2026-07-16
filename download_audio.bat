@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title YouTube Audio Downloader

echo ================================================
echo   YouTube Audio Downloader
echo   MP3 in bester Qualitaet
echo ================================================
echo.

:: Verzeichnis des Skripts als Basis
set "SCRIPT_DIR=%~dp0"
set "LINKS_FILE=%SCRIPT_DIR%links.txt"
set "OUTPUT_DIR=%SCRIPT_DIR%Downloads"

:: Prüfen ob yt-dlp verfügbar ist
where yt-dlp >nul 2>&1
if errorlevel 1 (
    echo [FEHLER] yt-dlp wurde nicht gefunden!
    echo.
    echo Bitte installiere yt-dlp mit:
    echo   winget install --id yt-dlp.yt-dlp
    echo.
    echo Danach ein neues Terminal-Fenster oeffnen.
    pause
    exit /b 1
)

:: Links-Datei prüfen
if not exist "%LINKS_FILE%" (
    echo [FEHLER] links.txt nicht gefunden: %LINKS_FILE%
    pause
    exit /b 1
)

:: Download-Ordner erstellen
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo [INFO] Lese Links aus: %LINKS_FILE%
echo [INFO] Speichert nach:  %OUTPUT_DIR%
echo.

set "COUNT=0"
set "SUCCESS=0"
set "FAILED=0"

:: Zeilen durchgehen
for /f "usebackq tokens=* delims=" %%L in ("%LINKS_FILE%") do (
    set "LINE=%%L"
    :: Leerzeilen und Kommentare überspringen
    if "!LINE!" neq "" (
        if "!LINE:~0,1!" neq "#" (
            set /a COUNT+=1
            echo [!COUNT!] Downloading: !LINE!
            yt-dlp -x --audio-format mp3 --audio-quality 0 --embed-thumbnail --embed-metadata -o "%OUTPUT_DIR%\%%(title)s.%%(ext)s" "!LINE!"
            if errorlevel 1 (
                echo     [FEHLER] Download fehlgeschlagen.
                set /a FAILED+=1
            ) else (
                echo     [OK] Erfolgreich heruntergeladen.
                set /a SUCCESS+=1
            )
            echo.
        )
    )
)

if !COUNT! == 0 (
    echo [HINWEIS] Keine Links in links.txt gefunden.
    echo Trage YouTube-URLs ein (eine pro Zeile^) und starte erneut.
) else (
    echo ================================================
    echo   Fertig! !SUCCESS! von !COUNT! erfolgreich.
    if !FAILED! GTR 0 echo   !FAILED! Fehler aufgetreten.
    echo   Dateien gespeichert in: %OUTPUT_DIR%
    echo ================================================
)

echo.
pause