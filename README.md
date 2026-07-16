# Root Audio App

A small web app for playing the *Root* (board game) soundtrack on iPhone/iPad/PC. Runs directly in the browser, can be installed from Safari to the home screen as a PWA, and doesn't require any external hosting.

**Features:**
- Play/Pause control for whatever is currently playing
- Dropdown selection (Overworld, Winter, Lake, Mountain) + a large "Play Theme" button that loops the selected theme
- Battle button with 3 states: **Battle** → starts the Battle Theme on loop, **Roll Dice** → fades to a fixed point in the track and plays without looping until the end, **End Battle** → fades back to the currently selected theme
- Victory button plays the Victory Theme once
- Screen stays awake while something is playing (Wake Lock)

## 1. Get the music files

The audio files are **not** included in the repository (see `.gitignore`) – they need to be downloaded from YouTube yourself.

1. Add YouTube links to [links.txt](links.txt) (one URL per line, `#` for comments).
2. Run [download_audio.bat](download_audio.bat). The script downloads all links from `links.txt` via [yt-dlp](https://github.com/yt-dlp/yt-dlp) and saves them as MP3 (including thumbnail/metadata) into the `Downloads` folder.
3. Move the downloaded files from `Downloads` into the project folder and rename them to match exactly the following names (see `FILES` in [app.js](app.js)):

   ```
   ROOT OST - Overworld Theme.mp3
   Root OST - Winter Theme.mp3
   Root OST - Lake Theme.mp3
   Root OST - Mountain Theme.mp3
   Root OST - Battle Theme (No loop).mp3
   Root OST - Victory Theme.mp3
   ```

Requirement for `download_audio.bat`: [yt-dlp](https://github.com/yt-dlp/yt-dlp) must be installed (`winget install --id yt-dlp.yt-dlp`).

## 2. Adjust volume (optional)

The Battle theme in particular tends to be noticeably louder than the other tracks and usually needs to be turned down. [reduce_volume.py](reduce_volume.py) reduces the volume of an MP3 file by a percentage, e.g. down to 50% of the original volume:

```
python reduce_volume.py "Root OST - Battle Theme (No loop).mp3" "Root OST - Battle Theme (No loop).mp3" 50
```

Requirement: `pip install pydub audioop-lts` and an installed `ffmpeg`.

## 3. Run the app

**Locally (your own PC on the same Wi-Fi):**

Run [start-server.ps1](start-server.ps1) – starts a local web server and prints the URL to open on the iPhone in Safari:

```
powershell -ExecutionPolicy Bypass -File start-server.ps1
```

On the iPhone: open the URL in Safari → Share icon → **Add to Home Screen**. The app then launches full-screen without the Safari UI.

**Hosted via Home Assistant (persistent, no PC required):**

Copy all project files into `config/www/root-audio/` on your Home Assistant installation. The app is then reachable at:

```
http://<home-assistant-address>:8123/local/root-audio/index.html
```

No Home Assistant restart needed – the `www` folder is served automatically.
