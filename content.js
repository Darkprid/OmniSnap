(function () {
  if (window.__vgpGhInyectado) return;
  window.__vgpGhInyectado = true;

  const hostLimpio = VGP.hostLimpio(location.hostname);
  if (VGP.esHostBloqueado(hostLimpio)) return;
  const plataformaActual = VGP.detectarPlataforma(hostLimpio);

  let botonHabilitado = true;
  let soloHover = false;
  let esquina = "right";
  let btnTamano = 28;
  let btnOpacidad = 0.35;
  let sitiosOcultos = [];
  let idiomaPref = "auto";
  let escaneoProgramado = false;

  function txt() {
    return VGP.t(idiomaPref);
  }

  function esRtl() {
    return VGP.resolverIdioma(idiomaPref) === "ar";
  }

  function sitioEstaPermitido() {
    return botonHabilitado && !sitiosOcultos.includes(hostLimpio);
  }

  chrome.storage.local.get(
    ["ocultarBoton", "soloHover", "esquina", "btnTamanoV3", "btnOpacidad", "sitiosOcultos", "idioma"],
    (d) => {
      botonHabilitado = !d.ocultarBoton;
      soloHover = !!d.soloHover;
      esquina = d.esquina || "right";
      if (d.btnTamanoV3) btnTamano = Number(d.btnTamanoV3);
      if (d.btnOpacidad !== undefined) btnOpacidad = Number(d.btnOpacidad) / 100;
      if (Array.isArray(d.sitiosOcultos)) sitiosOcultos = d.sitiosOcultos;
      if (d.idioma) idiomaPref = d.idioma;
      aplicarEstiloBotones();
      programarEscaneo();
    }
  );

  chrome.storage.onChanged.addListener((cambios) => {
    if (cambios.ocultarBoton !== undefined) botonHabilitado = !cambios.ocultarBoton.newValue;
    if (cambios.soloHover !== undefined) soloHover = !!cambios.soloHover.newValue;
    if (cambios.esquina !== undefined) esquina = cambios.esquina.newValue;
    if (cambios.btnTamanoV3 !== undefined) btnTamano = Number(cambios.btnTamanoV3.newValue);
    if (cambios.btnOpacidad !== undefined) btnOpacidad = Number(cambios.btnOpacidad.newValue) / 100;
    if (cambios.sitiosOcultos !== undefined) sitiosOcultos = cambios.sitiosOcultos.newValue || [];
    if (cambios.idioma !== undefined) idiomaPref = cambios.idioma.newValue || "auto";
    aplicarEstiloBotones();
    programarEscaneo();
  });

  function aplicarEstiloBotones() {
    const permitido = sitioEstaPermitido();
    const svgSize = Math.round(btnTamano * 0.5);
    const radio = Math.round(btnTamano * 0.24) + "px";

    document.querySelectorAll(".vgp-btn-descarga").forEach((b) => {
      b.title = txt().btnTooltip;
      b.style.setProperty("display", permitido ? "flex" : "none", "important");
      b.style.setProperty("width", btnTamano + "px", "important");
      b.style.setProperty("height", btnTamano + "px", "important");
      b.style.setProperty("border-radius", radio, "important");
      b.style.setProperty("opacity", soloHover ? "0" : String(btnOpacidad), "important");

      if (b.id !== "vgp-tiktok-float") {
        if (esquina === "left") {
          b.style.left = "10px";
          b.style.right = "auto";
        } else {
          b.style.right = "10px";
          b.style.left = "auto";
        }
      }

      const svg = b.querySelector("svg");
      if (svg) {
        svg.setAttribute("width", String(svgSize));
        svg.setAttribute("height", String(svgSize));
      }
    });
  }

  function mostrarAvisoToast(texto, duracion = 4500) {
    const previo = document.getElementById("vgp-toast");
    if (previo) previo.remove();

    const toast = document.createElement("div");
    toast.id = "vgp-toast";
    toast.dir = esRtl() ? "rtl" : "ltr";
    toast.style.cssText =
      "position:fixed;bottom:20px;right:20px;width:275px;background:#16161e;color:#fff;border:1px solid #ff0055;border-radius:10px;padding:12px 14px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,0.8);font-family:Arial,sans-serif;font-size:12.5px;line-height:1.4;";

    const msg = document.createElement("div");
    msg.textContent = texto;
    toast.appendChild(msg);

    document.body.appendChild(toast);
    if (duracion > 0) {
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, duracion);
    }
  }

  async function copiarEnlaceAlPortapapeles(url) {
    try {
      await navigator.clipboard.writeText(url);
      mostrarAvisoToast(txt().linkCopied);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      mostrarAvisoToast(txt().linkCopied);
    }
  }

  function capturarFotogramaPNG(videoEl) {
    if (!videoEl || !videoEl.videoWidth) {
      mostrarAvisoToast(txt().playFirstFrame);
      return;
    }
    if (videoEl.mediaKeys) {
      mostrarAvisoToast(txt().errProtected);
      return;
    }
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      canvas.getContext("2d").drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return mostrarAvisoToast(txt().errProtected);
        const nombreBase = VGP.limpiarFragmentoNombre(document.title || "Frame", 35);
        const urlBlob = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlBlob;
        a.download = nombreBase + "_" + canvas.width + "x" + canvas.height + ".png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(urlBlob), 10000);
        mostrarAvisoToast(txt().frameSaved);
      }, "image/png");
    } catch (e) {
      mostrarAvisoToast(txt().errProtected);
    }
  }

  function b64ABlob(b64, tipo) {
    const bin = atob(b64);
    const len = bin.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: tipo });
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg) return;
    if (msg.accion === "mostrar_toast" && msg.texto) {
      mostrarAvisoToast(msg.texto, 6500);
    } else if (msg.accion === "mezclar_reddit_blobs") {
      mezclarRedditBlobs(msg);
    }
  });

  function descargarBlobLocal(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  async function mezclarRedditBlobs(msg) {
    mostrarAvisoToast(txt().mergingReddit, 25000);
    const vBlob = b64ABlob(msg.videoB64, "video/mp4");
    const aBlob = b64ABlob(msg.audioB64, "audio/mp4");
    const urlV = URL.createObjectURL(vBlob);
    const urlA = URL.createObjectURL(aBlob);
    let audioCtx = null;
    let rec = null;
    let watchdog = null;
    let fallido = false;

    const limpiarRecursos = () => {
      clearTimeout(watchdog);
      URL.revokeObjectURL(urlV);
      URL.revokeObjectURL(urlA);
      if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
    };

    try {
      const vEl = document.createElement("video");
      const aEl = document.createElement("audio");
      vEl.muted = true;
      vEl.playsInline = true;
      vEl.src = urlV;
      aEl.src = urlA;

      await Promise.all([
        new Promise((res, rej) => { vEl.onloadedmetadata = res; vEl.onerror = rej; }),
        new Promise((res, rej) => { aEl.onloadedmetadata = res; aEl.onerror = rej; })
      ]);

      const streamV = vEl.captureStream ? vEl.captureStream() : vEl.mozCaptureStream();
      audioCtx = new AudioContext();
      if (audioCtx.state === "suspended") await audioCtx.resume();

      const fuenteA = audioCtx.createMediaElementSource(aEl);
      const destA = audioCtx.createMediaStreamDestination();
      fuenteA.connect(destA);

      const combinado = new MediaStream([
        ...streamV.getVideoTracks(),
        ...destA.stream.getAudioTracks()
      ]);

      const mime = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1,mp4a.40.2")
        ? "video/mp4;codecs=avc1,mp4a.40.2"
        : MediaRecorder.isTypeSupported("video/mp4") ? "video/mp4" : "video/webm;codecs=vp8,opus";

      const partes = [];
      rec = new MediaRecorder(combinado, { mimeType: mime, videoBitsPerSecond: 6000000 });
      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) partes.push(e.data); };

      rec.onstop = () => {
        vEl.pause();
        aEl.pause();
        limpiarRecursos();
        if (fallido) return;
        const nombre = mime.includes("mp4") ? msg.nombre : msg.nombre.replace(/\.mp4$/i, ".webm");
        descargarBlobLocal(new Blob(partes, { type: mime }), nombre);
        mostrarAvisoToast(txt().redditDone, 4000);
      };

      const detener = () => { if (rec.state !== "inactive") rec.stop(); };
      vEl.onended = detener;
      const duracionMs = isFinite(vEl.duration) && vEl.duration > 0 ? vEl.duration * 1000 : 120000;
      watchdog = setTimeout(detener, duracionMs * 3 + 15000);

      rec.start(200);
      await Promise.all([vEl.play(), aEl.play()]);
    } catch (e) {
      fallido = true;
      if (rec && rec.state !== "inactive") rec.stop();
      else limpiarRecursos();
      const base = msg.nombre.replace(/\.[a-z0-9]+$/i, "");
      descargarBlobLocal(vBlob, base + ".mp4");
      descargarBlobLocal(aBlob, base + "_audio.m4a");
      mostrarAvisoToast(txt().redditSeparate, 6500);
    }
  }

  function crearBoton(esFijo = false, contenedorPadre = null) {
    const b = document.createElement("button");
    b.className = "vgp-btn-descarga";
    b.title = txt().btnTooltip;
    const svgSize = Math.round(btnTamano * 0.5);
    const radio = Math.round(btnTamano * 0.24) + "px";
    b.innerHTML = '<svg width="' + svgSize + '" height="' + svgSize + '" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></svg>';

    const posSide = esquina === "left" ? "left:10px;right:auto;" : "right:10px;left:auto;";
    const opacidadInicial = soloHover ? 0 : btnOpacidad;

    b.style.cssText = "position:" + (esFijo ? "fixed" : "absolute") + ";top:10px;" + posSide + "width:" + btnTamano + "px;height:" + btnTamano + "px;border-radius:" + radio + ";z-index:2147483646;background:rgba(255, 0, 85, 0.88);opacity:" + opacidadInicial + ";backdrop-filter:blur(4px);color:#fff;border:1.5px solid rgba(255,255,255,0.35);padding:0;display:" + (sitioEstaPermitido() ? "flex" : "none") + ";align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,0.35);pointer-events:auto;transition:opacity 0.18s ease, transform 0.15s ease;";

    b.onmouseenter = () => {
      b.style.setProperty("opacity", "1", "important");
      b.style.background = "rgba(255, 0, 85, 1)";
      b.style.transform = "scale(1.08)";
    };
    b.onmouseleave = () => {
      b.style.setProperty("opacity", soloHover ? "0" : String(btnOpacidad), "important");
      b.style.background = "rgba(255, 0, 85, 0.88)";
      b.style.transform = "scale(1)";
    };

    if (contenedorPadre) {
      contenedorPadre.addEventListener("mouseenter", () => {
        if (soloHover) b.style.setProperty("opacity", String(btnOpacidad), "important");
      });
      contenedorPadre.addEventListener("mouseleave", () => {
        if (soloHover) b.style.setProperty("opacity", "0", "important");
      });
    }

    return b;
  }

  document.addEventListener("click", () => {
    const m = document.getElementById("vgp-menu-calidades");
    if (m) m.remove();
  });

  function dispararDescargaItem(item, esRapida = false) {
    if (item.extraerAudioWav) {
      mostrarAvisoToast(txt().decodingAudio, 15000);
    }
    chrome.runtime.sendMessage(
      {
        accion: "descargar_elegido",
        url: item.url,
        audioUrl: item.audioUrl,
        extraerAudioWav: item.extraerAudioWav,
        nombre: item.nombre
      },
      (res) => {
        if (res && !res.exito && res.error) {
          mostrarAvisoToast(res.error);
        } else if (res && res.esRedditMerge) {
          mostrarAvisoToast(txt().mergingReddit, 15000);
        } else if (esRapida) {
          mostrarAvisoToast(txt().quickDl + item.etiqueta);
        } else {
          mostrarAvisoToast(txt().dlStarted);
        }
      }
    );
  }

  function mostrarMenuCalidades(boton, calidades, videoRef = null) {
    const previo = document.getElementById("vgp-menu-calidades");
    if (previo) previo.remove();

    const rtl = esRtl();
    const alineacion = rtl ? "right" : "left";
    const rect = boton.getBoundingClientRect();
    const menu = document.createElement("div");
    menu.id = "vgp-menu-calidades";
    menu.dir = rtl ? "rtl" : "ltr";

    const leftPos = esquina === "left" ? Math.max(10, rect.left) : Math.max(10, rect.right - 210);
    const topPos = Math.min(Math.max(10, window.innerHeight - 250), Math.max(10, rect.bottom + 6));
    menu.style.cssText = "position:fixed;top:" + topPos + "px;left:" + leftPos + "px;width:210px;background:#16161e;border:1px solid #333;border-radius:8px;padding:6px;z-index:2147483647;box-shadow:0 8px 20px rgba(0,0,0,0.7);font-family:Arial,sans-serif;color:#fff;";

    const titulo = document.createElement("div");
    titulo.textContent = txt().selectQuality;
    titulo.style.cssText = "font-size:11px;color:#aaa;padding:4px 8px;border-bottom:1px solid #2a2a35;margin-bottom:4px;text-align:" + alineacion + ";";
    menu.appendChild(titulo);

    calidades.forEach((item) => {
      const opcion = document.createElement("button");
      opcion.textContent = item.etiqueta;
      opcion.style.cssText =
        "width:100%;text-align:" + alineacion + ";background:transparent;border:none;color:#fff;padding:7px 10px;font-size:12.5px;font-weight:bold;border-radius:5px;cursor:pointer;display:block;";
      opcion.onmouseenter = () => (opcion.style.background = "#ff0055");
      opcion.onmouseleave = () => (opcion.style.background = "transparent");

      opcion.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        menu.remove();
        dispararDescargaItem(item, false);
      };
      menu.appendChild(opcion);
    });

    const mejorVideo = calidades.find((c) => !c.extraerAudioWav) || calidades[0];
    if (mejorVideo && mejorVideo.url) {
      const btnCopy = document.createElement("button");
      btnCopy.textContent = txt().copyLink;
      btnCopy.style.cssText =
        "width:100%;text-align:" + alineacion + ";background:transparent;border:none;border-top:1px solid #2a2a35;margin-top:3px;color:#00e676;padding:7px 10px;font-size:12px;font-weight:bold;border-radius:5px;cursor:pointer;display:block;";
      btnCopy.onmouseenter = () => {
        btnCopy.style.background = "#ff0055";
        btnCopy.style.color = "#fff";
      };
      btnCopy.onmouseleave = () => {
        btnCopy.style.background = "transparent";
        btnCopy.style.color = "#00e676";
      };
      btnCopy.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        menu.remove();
        copiarEnlaceAlPortapapeles(mejorVideo.url);
      };
      menu.appendChild(btnCopy);
    }

    if (videoRef) {
      const btnFrame = document.createElement("button");
      btnFrame.textContent = txt().saveFrame;
      btnFrame.style.cssText =
        "width:100%;text-align:" + alineacion + ";background:transparent;border:none;color:#00e5ff;padding:7px 10px;font-size:12px;font-weight:bold;border-radius:5px;cursor:pointer;display:block;";
      btnFrame.onmouseenter = () => {
        btnFrame.style.background = "#ff0055";
        btnFrame.style.color = "#fff";
      };
      btnFrame.onmouseleave = () => {
        btnFrame.style.background = "transparent";
        btnFrame.style.color = "#00e5ff";
      };
      btnFrame.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        menu.remove();
        capturarFotogramaPNG(videoRef);
      };
      menu.appendChild(btnFrame);
    }

    document.body.appendChild(menu);
  }

  function pedirYMostrarCalidades(boton, payload, videoRef = null, descargaInstantanea = false) {
    const iconoOriginal = boton.innerHTML;
    boton.textContent = "⏳";
    const dims = videoRef ? { altoVideo: videoRef.videoHeight || 0, anchoVideo: videoRef.videoWidth || 0 } : {};
    const infoExtra = { tituloPagina: document.title || "" };

    chrome.runtime.sendMessage({ accion: "obtener_calidades", ...dims, ...infoExtra, ...payload }, (res) => {
      boton.innerHTML = iconoOriginal;
      if (!res || !res.exito || !res.calidades || !res.calidades.length) {
        mostrarAvisoToast(res?.error || txt().errLoadQualities);
        return;
      }
      if (descargaInstantanea) {
        const mejor = res.calidades.find((c) => !c.extraerAudioWav) || res.calidades[0];
        dispararDescargaItem(mejor, true);
        return;
      }
      mostrarMenuCalidades(boton, res.calidades, videoRef);
    });
  }

  function obtenerVideoTikTokActivo() {
    const videos = document.querySelectorAll("video");
    for (const v of videos) {
      const r = v.getBoundingClientRect();
      if (r.height > 150 && r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3) return v;
    }
    return videos[0] || null;
  }

  function encontrarUrlTikTok(v) {
    if (location.pathname.includes("/video/")) return location.href.split("?")[0];
    if (!v) return location.href;
    const wrapper = v.closest('[id^="xgwrapper-"]') || v.parentElement?.closest('[id^="xgwrapper-"]');
    if (wrapper && wrapper.id) {
      const videoId = wrapper.id.split("-").pop();
      if (/^\d{15,22}$/.test(videoId)) return "https://www.tiktok.com/@tiktok/video/" + videoId;
    }
    let el = v;
    for (let i = 0; i < 6 && el; i++) {
      const a = el.querySelector?.('a[href*="/video/"]');
      if (a) return a.href.split("?")[0];
      el = el.parentElement;
    }
    return location.href;
  }

  function encontrarUrlTweet(v) {
    const art = v.closest("article");
    if (art) {
      const linkTime = art.querySelector('a[href*="/status/"] time')?.closest("a");
      if (linkTime && linkTime.href) return linkTime.href;
      const linkAny = art.querySelector('a[href*="/status/"]');
      if (linkAny && linkAny.href) return linkAny.href;
    }
    return location.pathname.includes("/status/") ? location.href : null;
  }

  function encontrarUrlInstagram(v) {
    const art = v.closest("article");
    if (art) {
      const link = art.querySelector('a[href*="/reel/"], a[href*="/p/"]');
      if (link) return link.href;
    }
    if (location.pathname.includes("/reel/") || location.pathname.includes("/p/")) return location.href;
    return location.href;
  }

  function escanear() {
    escaneoProgramado = false;
    if (document.hidden) return;

    if (!sitioEstaPermitido()) {
      const btnTikTok = document.getElementById("vgp-tiktok-float");
      if (btnTikTok) btnTikTok.style.display = "none";
      return;
    }

    if (plataformaActual === "tiktok") {
      const vActivo = obtenerVideoTikTokActivo();
      let btnTikTok = document.getElementById("vgp-tiktok-float");
      if (!vActivo) {
        if (btnTikTok) btnTikTok.style.display = "none";
        return;
      }
      if (!btnTikTok) {
        btnTikTok = crearBoton(true);
        btnTikTok.id = "vgp-tiktok-float";
        btnTikTok.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          const vAct = obtenerVideoTikTokActivo();
          const urlPost = encontrarUrlTikTok(vAct);
          pedirYMostrarCalidades(btnTikTok, { plataforma: "tiktok", url: urlPost }, vAct, !!e.shiftKey);
        };
        document.body.appendChild(btnTikTok);
      }
      const rect = vActivo.getBoundingClientRect();
      btnTikTok.style.display = "flex";
      btnTikTok.style.top = Math.max(70, rect.top + 12) + "px";
      btnTikTok.style.left = (esquina === "left" ? (rect.left + 12) : (rect.right - btnTamano - 12)) + "px";
      btnTikTok.style.right = "auto";
      return;
    }

    if (plataformaActual === "reddit") {
      const players = document.querySelectorAll(
        'shreddit-post [slot="post-media-container"], shreddit-player, shreddit-player-2'
      );
      players.forEach((el) => {
        const post = el.closest("shreddit-post");
        if (post && post.getAttribute("post-type") && post.getAttribute("post-type") !== "video" && !post.querySelector("shreddit-player, shreddit-player-2, video")) {
          return;
        }
        const contenedorVideo = (post && post.querySelector('[slot="post-media-container"]')) || el;
        if (contenedorVideo.querySelector(".vgp-btn-descarga")) return;

        const btn = crearBoton(false, contenedorVideo);
        btn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          let link =
            (post && post.getAttribute("permalink")) ||
            (post && post.querySelector('a[href*="/comments/"]')?.getAttribute("href")) ||
            location.href;
          if (!link.startsWith("http")) link = "https://www.reddit.com" + link;
          const vInterno = contenedorVideo.querySelector("video") || (post && post.querySelector("video"));
          pedirYMostrarCalidades(btn, { plataforma: "reddit", url: link }, vInterno, !!e.shiftKey);
        };
        if (getComputedStyle(contenedorVideo).position === "static") contenedorVideo.style.position = "relative";
        contenedorVideo.appendChild(btn);
      });
    }

    document.querySelectorAll("video").forEach((v) => {
      if (plataformaActual === "reddit" && v.closest("shreddit-post")) return;
      const padre = v.parentElement;
      if (!padre || padre.querySelector(".vgp-btn-descarga")) return;

      const btn = crearBoton(false, padre);
      btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const rapido = !!e.shiftKey;

        if (plataformaActual === "x") {
          pedirYMostrarCalidades(btn, { plataforma: "x", url: encontrarUrlTweet(v) }, v, rapido);
          return;
        }

        if (plataformaActual === "instagram") {
          pedirYMostrarCalidades(btn, { plataforma: "instagram", url: encontrarUrlInstagram(v) }, v, rapido);
          return;
        }

        if (plataformaActual === "pinterest") {
          pedirYMostrarCalidades(btn, { plataforma: "pinterest", url: location.href }, v, rapido);
          return;
        }

        const fuentes = [];
        const actual = v.currentSrc || v.src;
        if (actual && /^https?:/i.test(actual)) {
          fuentes.push({
            etiqueta: VGP.etiquetaHonesta(v.videoHeight, v.videoWidth, actual),
            url: actual
          });
        }
        v.querySelectorAll("source").forEach((s) => {
          if (s.src && /^https?:/i.test(s.src) && !fuentes.some((f) => f.url === s.src)) {
            const attr = s.getAttribute("size") || s.getAttribute("res") || "";
            const num = parseInt(attr, 10);
            const etqS = num ? VGP.formatearResolucion(num, 0) : VGP.extDeUrl(s.src, "mp4").toUpperCase();
            fuentes.push({ etiqueta: etqS, url: s.src });
          }
        });

        pedirYMostrarCalidades(btn, { plataforma: "web", url: location.href, fuentesDirectas: fuentes }, v, rapido);
      };

      if (getComputedStyle(padre).position === "static") padre.style.position = "relative";
      padre.appendChild(btn);
    });
  }

  function programarEscaneo() {
    if (escaneoProgramado) return;
    escaneoProgramado = true;
    setTimeout(escanear, 350);
  }

  if (document.documentElement) {
    new MutationObserver(programarEscaneo).observe(document.documentElement, { childList: true, subtree: true });
  }
  ["loadedmetadata", "play", "emptied"].forEach((ev) => document.addEventListener(ev, programarEscaneo, true));
  window.addEventListener("resize", programarEscaneo);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) programarEscaneo();
  });
  if (plataformaActual === "tiktok") {
    window.addEventListener("scroll", programarEscaneo, { passive: true });
  }
  escanear();
  setInterval(programarEscaneo, 2500);
})();