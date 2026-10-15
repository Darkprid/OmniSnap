# 📌 Plantillas Listas para Reddit

## 1. r/SideProject (https://reddit.com/r/SideProject)
**Título:**
I built OmniSnap: a 100% free & open-source browser extension to save videos in original quality, extract audio, and capture PNG frames (No paywalls, no ads)

**Texto:**
Hey everyone! 👋

I got tired of media downloader extensions that inject ads, track your browsing history, or ask for a $10/month subscription after 3 downloads.

So I created **OmniSnap**: a lightweight, open-source browser extension (Manifest V3) for Google Chrome, Microsoft Edge, and Brave.

### ⚡ Key Features:
- **Original Source Quality:** Directly captures streams from X (Twitter), Reddit (automatically merges separate video + audio streams), TikTok (1080p source), Instagram, Pinterest, and standard HTML5 players.
- **Instant Download Shortcut:** Hold `Shift + Click` on any video button for immediate max-quality download.
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
1. **Offscreen Document Audio Pipeline:** Spawning a lightweight offscreen document that leverages `OfflineAudioContext` to decode raw video streams and write 16-bit PCM WAV headers on the fly.
2. **Session Sniffer Throttling:** Using an in-memory cache to prevent redundant writes to `chrome.storage.session` during heavy chunked media requests.
3. **Stream Merging via MediaStream:** Combining separate video and audio streams using `captureStream()` and `MediaRecorder` directly on the client side with a duration-based watchdog.

The full codebase is open-source under the MIT license. Check it out and let me know if you have questions about the Manifest V3 architecture!
