document.addEventListener("DOMContentLoaded", () => {
  const btnKofi = document.getElementById("btnKofi");

  const selIdioma = document.getElementById("selIdioma");
  const chkMostrarBoton = document.getElementById("chkMostrarBoton");
  const chkSoloHover = document.getElementById("chkSoloHover");
  const selEsquina = document.getElementById("selEsquina");
  const rngTamano = document.getElementById("rngTamano");
  const valTamano = document.getElementById("valTamano");
  const rngOpacidad = document.getElementById("rngOpacidad");
  const valOpacidad = document.getElementById("valOpacidad");
  const btnToggleSitio = document.getElementById("btnToggleSitio");

  const cajaSniffer = document.getElementById("cajaSniffer");
  const btnDescargarSniffer = document.getElementById("btnDescargarSniffer");
  const linkGithub = document.getElementById("linkGithub");

  let hostActual = "";
  let sitiosOcultos = [];

  function aplicarIdiomaUI() {
    const cod = VGP.resolverIdioma(selIdioma.value);
    const tr = VGP.t(cod);
    document.body.dir = cod === "ar" ? "rtl" : "ltr";

    document.getElementById("lblSub").textContent = tr.sub;
    document.getElementById("lblLang").textContent = "🌐 " + tr.langLabel;
    document.getElementById("optAuto").textContent = tr.langAuto;
    document.getElementById("lblShowBtn").textContent = tr.showBtn;
    document.getElementById("lblOnlyHover").textContent = tr.onlyHover;
    document.getElementById("lblCorner").textContent = tr.corner;
    document.getElementById("optTopRight").textContent = tr.topRight;
    document.getElementById("optTopLeft").textContent = tr.topLeft;
    document.getElementById("lblBtnSize").textContent = tr.btnSize;
    document.getElementById("lblIconOpacity").textContent = tr.iconOpacity;
    document.getElementById("lblShiftTip").textContent = tr.shiftTip;
    document.getElementById("lblStreamDetected").textContent = tr.streamDetected;
    btnDescargarSniffer.textContent = tr.downloadDetected;
    document.getElementById("lblSupportTitle").textContent = tr.supportTitle;
    document.getElementById("lblSupportDesc").textContent = tr.supportDesc;
    btnKofi.textContent = tr.kofiBtn;
    linkGithub.textContent = tr.starGithub;
    actualizarBotonSitio();
  }

  function actualizarBotonSitio() {
    if (!hostActual) {
      btnToggleSitio.style.display = "none";
      return;
    }
    const tr = VGP.t(selIdioma.value);
    const bloqueado = sitiosOcultos.includes(hostActual);
    if (bloqueado) {
      btnToggleSitio.textContent = tr.enableSite + hostActual;
      btnToggleSitio.classList.add("bloqueado");
    } else {
      btnToggleSitio.textContent = tr.hideSite + hostActual;
      btnToggleSitio.classList.remove("bloqueado");
    }
  }

  function emitirCambioEnVivo() {
    const payload = {
      accion: "actualizar_estilo_vivo",
      idioma: selIdioma.value,
      ocultarBoton: !chkMostrarBoton.checked,
      soloHover: chkSoloHover.checked,
      esquina: selEsquina.value,
      btnTamano: parseInt(rngTamano.value, 10),
      btnOpacidad: parseInt(rngOpacidad.value, 10),
      sitiosOcultos: sitiosOcultos
    };
    chrome.storage.local.set({
      idioma: payload.idioma,
      ocultarBoton: payload.ocultarBoton,
      soloHover: payload.soloHover,
      esquina: payload.esquina,
      btnTamanoV3: payload.btnTamano,
      btnOpacidad: payload.btnOpacidad,
      sitiosOcultos: sitiosOcultos
    });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, payload).catch(() => {});
      }
    });
  }

  function cargarEstado(tab) {
    if (!tab?.id) return;
    chrome.runtime.sendMessage({ accion: "estado", tabId: tab.id }, (res) => {
      if (!res || !res.exito) return;
      if (res.urlSniffer) {
        cajaSniffer.style.display = "block";
        const nombreTab = VGP.limpiarFragmentoNombre(tab.title || "Stream", 40);
        const ext = VGP.extDeUrl(res.urlSniffer, "mp4");
        btnDescargarSniffer.onclick = () => {
          const tr = VGP.t(selIdioma.value);
          chrome.runtime.sendMessage(
            {
              accion: "descargar_elegido",
              tabId: tab.id,
              url: res.urlSniffer,
              nombre: (nombreTab || "Stream") + "." + ext
            },
            (r) => {
              btnDescargarSniffer.textContent = (r && !r.exito && r.error) ? r.error : tr.dlStarted;
              setTimeout(() => { btnDescargarSniffer.textContent = tr.downloadDetected; }, 2500);
            }
          );
        };
      }
    });
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url && tab.url.startsWith("http")) {
      try {
        hostActual = VGP.hostLimpio(new URL(tab.url).hostname);
      } catch (e) {}
    }

    chrome.storage.local.get(
      ["idioma", "ocultarBoton", "soloHover", "esquina", "btnTamanoV3", "btnOpacidad", "sitiosOcultos"],
      (datos) => {
        selIdioma.value = datos.idioma || "auto";
        chkMostrarBoton.checked = !datos.ocultarBoton;
        chkSoloHover.checked = !!datos.soloHover;
        selEsquina.value = datos.esquina || "right";

        const tamano = datos.btnTamanoV3 || 28;
        const opacidad = datos.btnOpacidad !== undefined ? datos.btnOpacidad : 35;

        rngTamano.value = tamano;
        valTamano.textContent = tamano + "px";

        rngOpacidad.value = opacidad;
        valOpacidad.textContent = opacidad + "%";

        sitiosOcultos = Array.isArray(datos.sitiosOcultos) ? datos.sitiosOcultos : [];
        aplicarIdiomaUI();
      }
    );

    cargarEstado(tab);
  });

  selIdioma.addEventListener("change", () => {
    aplicarIdiomaUI();
    emitirCambioEnVivo();
  });

  chkMostrarBoton.addEventListener("change", emitirCambioEnVivo);
  chkSoloHover.addEventListener("change", emitirCambioEnVivo);
  selEsquina.addEventListener("change", emitirCambioEnVivo);

  rngTamano.addEventListener("input", () => {
    valTamano.textContent = rngTamano.value + "px";
    emitirCambioEnVivo();
  });

  rngOpacidad.addEventListener("input", () => {
    valOpacidad.textContent = rngOpacidad.value + "%";
    emitirCambioEnVivo();
  });

  btnToggleSitio.addEventListener("click", () => {
    if (!hostActual) return;
    if (sitiosOcultos.includes(hostActual)) {
      sitiosOcultos = sitiosOcultos.filter((h) => h !== hostActual);
    } else {
      sitiosOcultos.push(hostActual);
    }
    actualizarBotonSitio();
    emitirCambioEnVivo();
  });

  btnKofi.addEventListener("click", () => {
    chrome.tabs.create({ url: VGP.CONFIG.URL_KOFI });
  });

  linkGithub.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: VGP.CONFIG.URL_GITHUB });
  });
});