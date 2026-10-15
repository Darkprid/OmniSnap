const fs = require('fs');
const path = require('path');

const promoDir = path.join(__dirname, 'promo_kit');
if (!fs.existsSync(promoDir)) {
  fs.mkdirSync(promoDir, { recursive: true });
}

// 1. Reddit Posts
const redditContent = `# 📌 Plantillas Listas para Reddit

## 1. r/SideProject (https://reddit.com/r/SideProject)
**Título:**
I built OmniSnap: a 100% free & open-source browser extension to save videos in original quality, extract audio, and capture PNG frames (No paywalls, no ads)

**Texto:**
Hey everyone! 👋

I got tired of media downloader extensions that inject ads, track your browsing history, or ask for a $10/month subscription after 3 downloads.

So I created **OmniSnap**: a lightweight, open-source browser extension (Manifest V3) for Google Chrome, Microsoft Edge, and Brave.

### ⚡ Key Features:
- **Original Source Quality:** Directly captures streams from X (Twitter), Reddit (automatically merges separate video + audio streams), TikTok (1080p source), Instagram, Pinterest, and standard HTML5 players.
- **Instant Download Shortcut:** Hold \`Shift + Click\` on any video button for immediate max-quality download.
- **Local Audio Extraction:** Uses the native Chrome Offscreen Audio API to decode clean WAV tracks in-browser (no remote server conversion).
- **High-Res Frame Capture:** One-click PNG capture of the exact playing frame.
- **Privacy First:** 100% client-side. Zero analytics, zero cookies, zero external API tracking.
- **9 Languages Built-in:** Auto-detects browser language with RTL support for Arabic.

Built with AI assistance (Google Gemini & Claude) under human architecture and code audits.

- 📂 **GitHub:** https://github.com/Darkprid/OmniSnap
- ☕ **Support:** https://ko-fi.com/darkprid

Would love to get your feedback and thoughts!

---

## 2. r/coolgithubprojects (https://reddit.com/r/coolgithubprojects)
**Título:**
[JavaScript] OmniSnap - Free & open-source extension to save embedded videos, extract WAV audio, and capture PNG frames

**URL:** https://github.com/Darkprid/OmniSnap

---

## 3. r/chrome_extensions (https://reddit.com/r/chrome_extensions)
**Título:**
How I used Manifest V3 Offscreen Documents and MediaStream to build a zero-bloat media grabber with audio merging (OmniSnap)

**Texto:**
Hi developers!

One of the biggest hurdles in Manifest V3 is performing heavy media decoding (like extracting audio tracks into WAV or merging separated video and audio DASH streams) without persistent background pages.

In **OmniSnap** (https://github.com/Darkprid/OmniSnap), I implemented two patterns that might be useful for your own extensions:
1. **Offscreen Document Audio Pipeline:** Spawning a lightweight offscreen document that leverages \`OfflineAudioContext\` to decode raw video streams and write 16-bit PCM WAV headers on the fly.
2. **Session Sniffer Throttling:** Using an in-memory cache to prevent redundant writes to \`chrome.storage.session\` during heavy chunked media requests.
3. **Stream Merging via MediaStream:** Combining separate video and audio streams using \`captureStream()\` and \`MediaRecorder\` directly on the client side with a duration-based watchdog.

The full codebase is open-source under the MIT license. Check it out and let me know if you have questions about the Manifest V3 architecture!
`;

fs.writeFileSync(path.join(promoDir, 'reddit_posts.md'), redditContent, 'utf8');

// 2. Hacker News Show HN
const hnContent = `URL de envío: https://news.ycombinator.com/submit

Título:
Show HN: OmniSnap – Open-source video, audio, and frame grabber (Manifest V3)

URL:
https://github.com/Darkprid/OmniSnap

Texto (si se publica como Ask/Show texto):
Hi HN,

I built OmniSnap (https://github.com/Darkprid/OmniSnap), a lightweight Manifest V3 extension for Chrome/Edge/Brave to save embedded media in its original quality.

Key technical decisions:
- Uses the Chrome Offscreen Document API for hardware-efficient Web Audio decoding to standard WAV without keeping background contexts open.
- In-browser MediaRecorder stream synthesis to seamlessly merge Reddit's separated DASH video and audio streams without server transcoding.
- In-memory sniffer throttling to prevent storage.session thrashing during chunked HTTP media requests.
- Strictly blocks encrypted DRM platforms (YouTube, Netflix, Spotify) by design to remain compliant with store policies.

Code is MIT licensed, zero analytics, zero external dependencies. Feedback and PRs are welcome!
`;

fs.writeFileSync(path.join(promoDir, 'show_hn.txt'), hnContent, 'utf8');

// 3. X (Twitter) Thread
const xContent = `🧵 HILO PARA TWITTER / X (#buildinpublic #opensource)

TWEET 1 (Gancho):
Tired of media downloader extensions that show ads, track your data, or charge a $10/mo subscription?

I built OmniSnap: a 100% free & open-source browser extension (Manifest V3) to grab videos, extract WAV audio, and capture high-res PNG frames.

Here's how it works 👇

TWEET 2 (Features):
⚡ Hold Shift + Click on any video for instant max-resolution download
🎵 Native WAV/M4A audio extraction via Chrome Offscreen API
📸 High-res PNG frame capture in 1 click
🌐 Works on X, Reddit, TikTok (1080p source), Instagram, Pinterest & HTML5
🌍 9 languages built-in

TWEET 3 (Privacy & Open Source):
OmniSnap runs 100% locally in your browser.
No tracking. No ads. No servers.
Licensed under MIT.

TWEET 4 (CTA):
Check it out and star it on GitHub:
👉 https://github.com/Darkprid/OmniSnap

If it saves you time, you can buy me a coffee on Ko-fi:
☕ https://ko-fi.com/darkprid

#chrome #opensource #webdev #javascript #ai
`;

fs.writeFileSync(path.join(promoDir, 'x_twitter_thread.txt'), xContent, 'utf8');

// 4. TikTok / Reels 15s Script
const videoScript = `🎬 GUION DE VÍDEO CORTO (15 SEGUNDOS) PARA TIKTOK / REELS / SHORTS

[0:00 - 0:03] GANCHO VISUAL:
Muestra la pantalla con un vídeo de Reddit o X.
Voz / Texto: "¿Sigues usando páginas llenas de anuncios para descargar vídeos de internet?"

[0:03 - 0:08] DEMOSTRACIÓN:
Pasa el cursor por el vídeo, mantén pulsada la tecla Shift y haz clic en el botón rosa de OmniSnap.
Enseña cómo la descarga empieza inmediatamente en máxima calidad en la barra de descargas.
Texto: "Shift + Clic = Descarga instantánea en calidad original ⚡"

[0:08 - 0:12] FUNCIONES ÚNICAS:
Abre el menú y pulsa "Guardar Fotograma (PNG)" o "Solo Audio".
Texto: "Extrae audio en WAV y captura fotogramas en PNG sin marcas de agua 📸"

[0:12 - 0:15] CIERRE:
Muestra la página de GitHub.
Texto / Voz: "Es 100% gratis y de código abierto en GitHub. Se llama OmniSnap."
`;

fs.writeFileSync(path.join(promoDir, 'short_video_script.txt'), videoScript, 'utf8');

console.log('✅ Promo kit generated successfully in:', promoDir);
