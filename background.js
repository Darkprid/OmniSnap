importScripts("shared.js");

const MAX_BYTES_AUDIO = 250 * 1024 * 1024;
const MAX_REDDIT_MERGE_BYTES = 35 * 1024 * 1024;
let extraccionesActivas = 0;
let creandoOffscreen = null;
const ultimoSnifferPorTab = new Map();

function limpiarSniffer(tabId) {
  ultimoSnifferPorTab.delete(tabId);
  chrome.storage.session.remove("sniffer_" + tabId).catch(() => {});
}

chrome.webRequest.onBeforeRequest.addListener(
  (d) => {
    if (d.tabId < 0) return;
    let u;
    try { u = new URL(d.url); } catch (e) { return; }
    if (u.protocol !== "http:" && u.protocol !== "https:") return;
    if (!/\.(mp4|webm|m4v)$/i.test(u.pathname)) return;
    if (d.url.includes("range=") || d.url.includes("bytestart=")) return;
    if (VGP.esHostBloqueado(u.hostname)) return;
    if (d.initiator) {
      try {
        if (VGP.esHostBloqueado(new URL(d.initiator).hostname)) return;
      } catch (e) {}
    }
    if (VGP.esDominio(u.hostname, "tiktok.com") && (d.url.includes("logo") || d.url.includes("intro"))) return;
    if (ultimoSnifferPorTab.get(d.tabId) === d.url) return;
    ultimoSnifferPorTab.set(d.tabId, d.url);
    chrome.storage.session.set({ ["sniffer_" + d.tabId]: d.url }).catch(() => {});
  },
  { urls: ["<all_urls>"], types: ["media", "xmlhttprequest", "other"] }
);

chrome.tabs.onRemoved.addListener(limpiarSniffer);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") limpiarSniffer(tabId);
});

async function leerSnifferTab(tabId) {
  if (tabId === undefined || tabId === null || tabId < 0) return null;
  try {
    const clave = "sniffer_" + tabId;
    const d = await chrome.storage.session.get(clave);
    return d[clave] || null;
  } catch (e) {
    return null;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.target === "offscreen") return;
  const tabId = sender.tab ? sender.tab.id : msg.tabId;
  const frameId = sender.tab ? (sender.frameId ?? 0) : 0;

  manejarMensaje(msg, tabId, frameId)
    .then(sendResponse)
    .catch((e) => sendResponse({ exito: false, error: String((e && e.message) || e) }));
  return true;
});

async function obtenerTextosIdioma() {
  const { idioma } = await chrome.storage.local.get(["idioma"]);
  return VGP.t(idioma);
}

function validarSolicitudUrl(url, txt) {
  if (typeof url !== "string" || !url) return { ok: false, error: txt.errInvalidUrl };
  let u;
  try { u = new URL(url); } catch (e) { return { ok: false, error: txt.errInvalidUrl }; }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { ok: false, error: txt.errInvalidUrl };
  }
  if (VGP.esHostBloqueado(u.hostname)) {
    return { ok: false, error: txt.errBlockedHost };
  }
  return { ok: true, u };
}

async function manejarMensaje(msg, tabId, frameId) {
  const txt = await obtenerTextosIdioma();
  switch (msg.accion) {
    case "estado":
      return {
        exito: true,
        urlSniffer: await leerSnifferTab(tabId)
      };
    case "consultar_sniffer":
      return { urlCapturada: await leerSnifferTab(tabId) };
    case "obtener_calidades":
      return obtenerCalidades(msg, tabId, txt);
    case "descargar_elegido":
      return procesarDescarga(msg, tabId, frameId, txt);
    default:
      return { exito: false, error: "Unknown action." };
  }
}

async function asegurarOffscreen() {
  if (creandoOffscreen) return creandoOffscreen;
  creandoOffscreen = (async () => {
    const ctxs = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] });
    if (ctxs.length) return;
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["BLOBS"],
      justification: "Decode audio track from video into WAV format."
    });
  })();
  try {
    await creandoOffscreen;
  } finally {
    creandoOffscreen = null;
  }
}

async function hayBlobsPendientes() {
  const todo = await chrome.storage.session.get(null);
  return Object.keys(todo).some((k) => k.startsWith("dl_"));
}

async function limpiarOffscreen(blobUrl) {
  if (blobUrl) {
    try { await chrome.runtime.sendMessage({ target: "offscreen", tipo: "revocar", url: blobUrl }); } catch (e) {}
  }
  if (extraccionesActivas === 0 && !(await hayBlobsPendientes())) {
    try { await chrome.offscreen.closeDocument(); } catch (e) {}
  }
}

async function finalizarDescargaBlob(id) {
  const clave = "dl_" + id;
  const r = await chrome.storage.session.get(clave);
  const reg = r[clave];
  if (!reg) return;
  await chrome.storage.session.remove(clave);
  if (reg.blobUrl) await limpiarOffscreen(reg.blobUrl);
}

function descargarDirecto(url, filename) {
  return chrome.downloads.download({ url, filename, conflictAction: "uniquify", saveAs: false });
}

function sanitizarNombreConExt(raw, url, fallbackExt) {
  const mPropio = String(raw || "").match(/\.(mp4|webm|m4v|mov|ogv|ogg|mp3|m4a|wav)$/i);
  const extPropia = mPropio ? mPropio[1].toLowerCase() : "";
  const esAudioExplicito = extPropia === "mp3" || extPropia === "m4a" || extPropia === "wav" || extPropia === "ogg";
  const extFinal = esAudioExplicito ? extPropia : VGP.extDeUrl(url, extPropia || fallbackExt || "mp4");

  let base = String(raw || ("VideoGrabber_" + Date.now()))
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  if (!base) base = "VideoGrabber_" + Date.now();
  return base + "." + extFinal;
}

async function procesarDescarga(msg, tabId, frameId, txt) {
  const val = validarSolicitudUrl(msg.url, txt);
  if (!val.ok) return { exito: false, error: val.error };

  if (msg.audioUrl) {
    const valAudio = validarSolicitudUrl(msg.audioUrl, txt);
    if (!valAudio.ok) return { exito: false, error: valAudio.error };
  }

  const nombreLimpio = sanitizarNombreConExt(msg.nombre, msg.url, "mp4");

  if (msg.extraerAudioWav) {
    extraccionesActivas++;
    let blobUrl = null;
    try {
      await asegurarOffscreen();
      const r = await chrome.runtime.sendMessage({
        target: "offscreen",
        tipo: "extraer_audio",
        url: msg.url,
        maxBytes: MAX_BYTES_AUDIO
      });
      if (!r || !r.exito) {
        return { exito: false, error: txt.errAudioFailed };
      }
      blobUrl = r.blobUrl;
      const nombreWav = nombreLimpio.replace(/\.[a-z0-9]+$/i, "") + ".wav";
      const id = await descargarDirecto(blobUrl, nombreWav);
      await chrome.storage.session.set({ ["dl_" + id]: { blobUrl } });
      blobUrl = null;
      // La descarga pudo terminar antes de registrar la clave (archivos pequeños).
      const [item] = await chrome.downloads.search({ id });
      if (!item || item.state !== "in_progress") await finalizarDescargaBlob(id);
      return { exito: true };
    } catch (e) {
      return { exito: false, error: txt.errAudioFailed };
    } finally {
      extraccionesActivas--;
      if (blobUrl) await limpiarOffscreen(blobUrl);
    }
  }

  if (msg.audioUrl && tabId !== undefined && tabId !== null) {
    const nombreAudio = nombreLimpio.replace(/\.[a-z0-9]+$/i, "") + "_audio.m4a";
    const descargarPorSeparado = async () => {
      await descargarDirecto(msg.url, nombreLimpio);
      await descargarDirecto(msg.audioUrl, nombreAudio);
      chrome.tabs.sendMessage(tabId, { accion: "mostrar_toast", texto: txt.redditSeparate }, { frameId }).catch(() => {});
    };

    (async () => {
      let vResp = null;
      let aResp = null;
      try {
        [vResp, aResp] = await Promise.all([fetch(msg.url), fetch(msg.audioUrl)]);
        if (!vResp.ok || !aResp.ok) throw new Error("Fetch error");

        const vLen = parseInt(vResp.headers.get("content-length") || "0", 10);
        const aLen = parseInt(aResp.headers.get("content-length") || "0", 10);
        if (vLen + aLen > MAX_REDDIT_MERGE_BYTES) {
          vResp.body?.cancel().catch(() => {});
          aResp.body?.cancel().catch(() => {});
          await descargarPorSeparado();
          return;
        }

        const [vBuf, aBuf] = await Promise.all([vResp.arrayBuffer(), aResp.arrayBuffer()]);
        if (vBuf.byteLength + aBuf.byteLength > MAX_REDDIT_MERGE_BYTES) {
          await descargarPorSeparado();
          return;
        }

        await chrome.tabs.sendMessage(
          tabId,
          {
            accion: "mezclar_reddit_blobs",
            videoB64: arrayBufferABase64(vBuf),
            audioB64: arrayBufferABase64(aBuf),
            nombre: nombreLimpio
          },
          { frameId }
        );
      } catch (e) {
        try { vResp?.body?.cancel(); } catch (_) {}
        try { aResp?.body?.cancel(); } catch (_) {}
        await descargarPorSeparado().catch(() => {});
      }
    })();
    return { exito: true, esRedditMerge: true };
  }

  try {
    await descargarDirecto(msg.url, nombreLimpio);
    return { exito: true };
  } catch (e) {
    return { exito: false, error: txt.errDownloadFailed };
  }
}

chrome.downloads.onChanged.addListener((delta) => {
  if (!delta.state) return;
  const est = delta.state.current;
  if (est !== "complete" && est !== "interrupted") return;
  finalizarDescargaBlob(delta.id).catch(() => {});
});

function arrayBufferABase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function buscarAudioReddit(videoUrl, dashUrl) {
  const baseCarpeta = videoUrl.substring(0, videoUrl.lastIndexOf("/"));
  const mpdUrl = dashUrl ? dashUrl.split("?")[0] : (baseCarpeta + "/DASHPlaylist.mpd");
  try {
    const rMpd = await fetch(mpdUrl);
    if (rMpd.ok) {
      const xml = await rMpd.text();
      const matches = [...xml.matchAll(/<BaseURL>([^<]+)<\/BaseURL>/g)].map((m) => m[1]);
      const audioFile = matches.find((f) => /audio/i.test(f));
      if (audioFile) {
        const candidatoMpd = audioFile.startsWith("http") ? audioFile : (baseCarpeta + "/" + audioFile);
        const check = await fetch(candidatoMpd, { method: "HEAD" });
        if (check.ok) return candidatoMpd;
      }
    }
  } catch (e) {}

  const candidatos = [
    baseCarpeta + "/CMAF_AUDIO_128.mp4",
    baseCarpeta + "/CMAF_AUDIO_64.mp4",
    baseCarpeta + "/DASH_AUDIO_128.mp4",
    baseCarpeta + "/DASH_AUDIO_64.mp4",
    baseCarpeta + "/DASH_audio.mp4",
    baseCarpeta + "/audio.mp4",
    baseCarpeta + "/audio"
  ];

  for (const urlAudio of candidatos) {
    try {
      const r = await fetch(urlAudio, { method: "HEAD" });
      if (r.ok) return urlAudio;
    } catch (e) {}
  }
  return null;
}

async function obtenerCalidades(msg, tabId, txt) {
  if (msg.plataforma !== "web" && !validarSolicitudUrl(msg.url, txt).ok) {
    return { exito: false, error: txt.errLoadQualities };
  }
  const resDomReal = VGP.formatearResolucion(msg.altoVideo || 0, msg.anchoVideo || 0);
  const tituloDom = VGP.limpiarFragmentoNombre(msg.tituloPagina || "", 40);

  if (msg.plataforma === "x") {
    const m = msg.url?.match(/status\/(\d+)/);
    if (!m) return { exito: false, error: txt.errLoadQualities };
    const id = m[1];
    try {
      const r1 = await fetch("https://api.fxtwitter.com/status/" + id);
      if (r1.ok) {
        const d1 = await r1.json();
        const tw = d1?.tweet;
        const vObj = tw?.media?.videos?.[0] || tw?.media?.all?.[0];
        if (vObj) {
          const autor = VGP.limpiarFragmentoNombre(tw?.author?.screen_name || "", 20);
          const textoTw = VGP.limpiarFragmentoNombre(tw?.text || tituloDom || id, 38);
          const baseName = "X_" + (autor ? ("@" + autor + "_") : "") + (textoTw || id);

          const cal = [];
          const etiquetasVistas = new Set();
          if (Array.isArray(vObj.variants)) {
            const mp4s = vObj.variants
              .filter((v) => v.content_type === "video/mp4" && v.url)
              .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
            mp4s.forEach((v, i) => {
              const rm = v.url.match(/\/(\d+)x(\d+)\//);
              let etq = "";
              if (rm) {
                etq = VGP.formatearResolucion(parseInt(rm[1], 10), parseInt(rm[2], 10));
              } else if (i === 0 && (vObj.height || resDomReal)) {
                etq = VGP.formatearResolucion(vObj.height || 0, vObj.width || 0) || resDomReal;
              } else if (v.bitrate) {
                etq = Math.round(v.bitrate / 1000) + " kbps";
              } else {
                etq = VGP.extDeUrl(v.url, "mp4").toUpperCase();
              }
              if (!etiquetasVistas.has(etq)) {
                etiquetasVistas.add(etq);
                const ext = VGP.extDeUrl(v.url, "mp4");
                cal.push({
                  etiqueta: etq,
                  url: v.url,
                  nombre: baseName + "_" + etq.replace(/\s+/g, "_") + "." + ext
                });
              }
            });
          }
          if (cal.length === 0 && vObj.url) {
            const etqUnica = VGP.formatearResolucion(vObj.height || 0, vObj.width || 0) || resDomReal || VGP.extDeUrl(vObj.url, "mp4").toUpperCase();
            const ext = VGP.extDeUrl(vObj.url, "mp4");
            cal.push({
              etiqueta: etqUnica,
              url: vObj.url,
              nombre: baseName + "_" + etqUnica.replace(/\s+/g, "_") + "." + ext
            });
          }
          if (cal.length > 0) {
            cal.push({
              etiqueta: txt.audioOnly + " (WAV)",
              url: cal[0].url,
              extraerAudioWav: true,
              nombre: baseName + "_Audio.wav"
            });
            return { exito: true, calidades: cal };
          }
        }
      }
    } catch (e) {}
    return { exito: false, error: txt.errLoadQualities };
  }

  if (msg.plataforma === "reddit") {
    try {
      const clean = msg.url.split("?")[0].replace(/\/$/, "");
      const r = await fetch(clean + ".json");
      const dj = await r.json();
      const postOrig = dj[0]?.data?.children[0]?.data;
      const pd = postOrig?.crosspost_parent_list?.[0] || postOrig;
      const rv = pd?.secure_media?.reddit_video || pd?.preview?.reddit_video_preview || pd?.media?.reddit_video;

      if (rv && rv.fallback_url) {
        const sub = VGP.limpiarFragmentoNombre(postOrig?.subreddit || pd?.subreddit || "", 20);
        const tituloPost = VGP.limpiarFragmentoNombre(postOrig?.title || pd?.title || tituloDom || "Video", 42);
        const baseName = "Reddit_" + (sub ? ("r_" + sub + "_") : "") + tituloPost;

        const videoHdRaw = rv.fallback_url.split("?")[0];
        const mUrlRes = videoHdRaw.match(/(?:DASH|CMAF)_(\d+)\.mp4/i);
        const maxP = mUrlRes ? parseInt(mUrlRes[1], 10) : Math.min(rv.height || 0, rv.width || (rv.height || 0));
        const etqMax = VGP.formatearResolucion(maxP, 0) || resDomReal || "MP4";

        const stdP = maxP >= 720 ? 480 : (maxP > 360 ? 360 : 0);
        const videoStdRaw = stdP ? videoHdRaw.replace(/(DASH|CMAF)_\d+\.mp4/, "$1_" + stdP + ".mp4") : videoHdRaw;

        let urlStdFinal = videoHdRaw;
        if (videoStdRaw !== videoHdRaw) {
          try {
            const checkStd = await fetch(videoStdRaw, { method: "HEAD" });
            if (checkStd.ok) urlStdFinal = videoStdRaw;
          } catch (e) {}
        }

        const audioUrl = await buscarAudioReddit(videoHdRaw, rv.dash_url);

        const cal = [
          {
            etiqueta: etqMax,
            url: videoHdRaw,
            audioUrl: audioUrl,
            nombre: baseName + "_" + etqMax.replace(/\s+/g, "_") + ".mp4"
          }
        ];

        if (urlStdFinal !== videoHdRaw && stdP) {
          const etqStd = VGP.formatearResolucion(stdP, 0);
          cal.push({
            etiqueta: etqStd,
            url: urlStdFinal,
            audioUrl: audioUrl,
            nombre: baseName + "_" + etqStd.replace(/\s+/g, "_") + ".mp4"
          });
        }

        if (audioUrl) {
          cal.push({
            etiqueta: txt.audioOnly + " (M4A)",
            url: audioUrl,
            nombre: baseName + "_Audio.m4a"
          });
        }

        return { exito: true, calidades: cal };
      }
    } catch (e) {}
    return { exito: false, error: txt.errLoadQualities };
  }

  if (msg.plataforma === "tiktok") {
    if (!msg.url || !msg.url.includes("/video/")) return { exito: false, error: txt.errLoadQualities };
    try {
      const r = await fetch("https://www.tikwm.com/api/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: "url=" + encodeURIComponent(msg.url) + "&hd=1"
      });
      const dt = await r.json();
      if (dt?.code === 0 && dt.data) {
        const d = dt.data;
        const fix = (u) => (u && !u.startsWith("http") ? ("https://www.tikwm.com" + u) : u);
        const autor = VGP.limpiarFragmentoNombre(d.author?.unique_id || d.author?.nickname || "", 20);
        const tituloTk = VGP.limpiarFragmentoNombre(d.title || tituloDom || d.id, 38);
        const baseName = "TikTok_" + (autor ? ("@" + autor + "_") : "") + (tituloTk || d.id);
        const etqReal = "HD (source)";

        const cal = [];
        if (d.hdplay) {
          cal.push({ etiqueta: etqReal, url: fix(d.hdplay), nombre: baseName + "_" + etqReal.replace(/\s+/g, "_") + ".mp4" });
          if (d.play) cal.push({ etiqueta: "540p", url: fix(d.play), nombre: baseName + "_540p.mp4" });
        } else if (d.play) {
          const etqPlay = resDomReal || "MP4";
          cal.push({ etiqueta: etqPlay, url: fix(d.play), nombre: baseName + "_" + etqPlay.replace(/\s+/g, "_") + ".mp4" });
        }
        if (cal.length > 0) return { exito: true, calidades: cal };
      }
    } catch (e) {}
    return { exito: false, error: txt.errLoadQualities };
  }

  if (msg.plataforma === "instagram") {
    try {
      const cleanIg = msg.url.split("?")[0].replace(/\/$/, "");
      const resIg = await fetch(cleanIg + "/embed/captioned/");
      const html = await resIg.text();
      const m = html.match(/\\?"video_url\\?"\s*:\s*\\?"(https:[^"\\]+)\\?"/);
      if (m && m[1]) {
        const vUrl = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
        const etqIg = resDomReal || VGP.extDeUrl(vUrl, "mp4").toUpperCase();
        const extIg = VGP.extDeUrl(vUrl, "mp4");
        const baseIg = "IG_" + (tituloDom || Date.now());
        return {
          exito: true,
          calidades: [
            { etiqueta: etqIg, url: vUrl, nombre: baseIg + "_" + etqIg.replace(/\s+/g, "_") + "." + extIg }
          ]
        };
      }
    } catch (e) {}
  }

  if (msg.plataforma === "pinterest") {
    try {
      const resPin = await fetch(msg.url);
      const htmlPin = await resPin.text();
      const mPin = htmlPin.match(/https:\/\/v1\.pinimg\.com\/videos\/[^"'\s]+\.mp4/);
      if (mPin && mPin[0]) {
        const mResPin = mPin[0].match(/\/(\d+)p\//);
        const etqPin = (mResPin ? VGP.formatearResolucion(parseInt(mResPin[1], 10), 0) : "") || resDomReal || "MP4";
        const basePin = "Pinterest_" + (tituloDom || Date.now());
        return {
          exito: true,
          calidades: [
            { etiqueta: etqPin, url: mPin[0], nombre: basePin + "_" + etqPin.replace(/\s+/g, "_") + ".mp4" },
            { etiqueta: txt.audioOnly + " (WAV)", url: mPin[0], extraerAudioWav: true, nombre: basePin + "_Audio.wav" }
          ]
        };
      }
    } catch (e) {}
  }

  const baseWeb = tituloDom || ("Video_" + Date.now());
  const calWeb = [];
  const urlSniff = await leerSnifferTab(tabId);

  if (Array.isArray(msg.fuentesDirectas) && msg.fuentesDirectas.length > 0) {
    msg.fuentesDirectas.forEach((f) => {
      if (VGP.esHostBloqueado( (() => { try { return new URL(f.url).hostname; } catch (e) { return ""; } })() )) return;
      const extW = VGP.extDeUrl(f.url, "mp4");
      const etqW = f.etiqueta || resDomReal || extW.toUpperCase();
      calWeb.push({
        etiqueta: etqW,
        url: f.url,
        nombre: baseWeb + "_" + etqW.replace(/\s+/g, "_") + "." + extW
      });
    });
  } else if (urlSniff) {
    const extS = VGP.extDeUrl(urlSniff, "mp4");
    const etqS = resDomReal || extS.toUpperCase();
    calWeb.push({
      etiqueta: etqS,
      url: urlSniff,
      nombre: baseWeb + "_" + etqS.replace(/\s+/g, "_") + "." + extS
    });
  }

  if (calWeb.length > 0) {
    calWeb.push({
      etiqueta: txt.audioOnly + " (WAV)",
      url: calWeb[0].url,
      extraerAudioWav: true,
      nombre: baseWeb + "_Audio.wav"
    });
    return { exito: true, calidades: calWeb };
  }

  return { exito: false, error: txt.errLoadQualities };
}