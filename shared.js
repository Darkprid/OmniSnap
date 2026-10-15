// shared.js — Configuración global (v1.0.0 Ko-fi Edition), 9 idiomas y utilidades
var VGP = (function () {
  var CONFIG = {
    URL_KOFI: "https://ko-fi.com/darkprid",
    URL_GITHUB: "https://github.com/darkprid/VideoGrabber"
  };

  var DOMINIOS_BLOQUEADOS = [
    "youtube.com", "youtu.be", "youtube-nocookie.com", "googlevideo.com", "ytimg.com",
    "netflix.com", "nflxvideo.net", "disneyplus.com", "hulu.com", "max.com", "hbomax.com",
    "primevideo.com", "aiv-cdn.net", "paramountplus.com", "peacocktv.com", "crunchyroll.com",
    "tv.apple.com", "spotify.com", "scdn.co"
  ];

  var I18N = {
    en: {
      sub: "All Features Unlocked · Video, Audio & Frame",
      langLabel: "Language:",
      langAuto: "Auto (Browser)",
      showBtn: "Show floating button:",
      onlyHover: "Show only on video hover:",
      corner: "Button Corner:",
      topRight: "Top-Right",
      topLeft: "Top-Left",
      btnSize: "Button Size:",
      iconOpacity: "Icon Opacity:",
      hideSite: "🚫 Hide on ",
      enableSite: "✅ Enable on ",
      streamDetected: "⚡ Active Video Stream Detected",
      downloadDetected: "⬇ Download Detected Video",
      supportTitle: "❤️ Support Open Development",
      supportDesc: "All video, WAV audio & frame tools are 100% free with no limits. If this tool saves you time, buy me a coffee on Ko-fi!",
      kofiBtn: "☕ Buy me a coffee on Ko-fi",
      starGithub: "⭐ Star on GitHub",
      selectQuality: "Select Quality / Format:",
      audioOnly: "🎵 Audio Only",
      copyLink: "🔗 Copy Direct Link",
      linkCopied: "🔗 Direct video link copied to clipboard!",
      saveFrame: "📸 Save Frame (PNG)",
      dlStarted: "⬇ Download started!",
      quickDl: "⚡ Instant Download: ",
      decodingAudio: "🎵 Decoding WAV audio track...",
      mergingReddit: "🔊 Merging audio track into video...",
      redditDone: "✅ Reddit Video + Audio downloaded!",
      redditSeparate: "📦 Large video (>35 MB): saving video and audio as separate files.",
      frameSaved: "📸 High-Res Frame saved as PNG!",
      playFirstFrame: "⚠️ Play the video first so a frame can be captured.",
      errProtected: "⚠️ Cannot capture frame on protected stream.",
      errLoadQualities: "Could not load video qualities.",
      errInvalidUrl: "⚠️ Invalid or unsupported video address (http/https only).",
      errBlockedHost: "⚠️ This platform is restricted and not supported.",
      errDownloadFailed: "⚠️ Could not start download.",
      errAudioFailed: "⚠️ Audio extraction failed.",
      btnTooltip: "Click: Quality Menu | Shift+Click: Instant Max Quality",
      shiftTip: "💡 Tip: Hold Shift + Click on the video button for instant max quality download."
    },
    es: {
      sub: "Todo Desbloqueado · Vídeo, Audio y Captura",
      langLabel: "Idioma:",
      langAuto: "Auto (Navegador)",
      showBtn: "Mostrar botón flotante:",
      onlyHover: "Mostrar solo al pasar el ratón:",
      corner: "Esquina del botón:",
      topRight: "Arriba-Derecha",
      topLeft: "Arriba-Izquierda",
      btnSize: "Tamaño del botón:",
      iconOpacity: "Opacidad del icono:",
      hideSite: "🚫 Ocultar en ",
      enableSite: "✅ Activar en ",
      streamDetected: "⚡ Stream de vídeo detectado",
      downloadDetected: "⬇ Descargar vídeo detectado",
      supportTitle: "❤️ Apoya el proyecto",
      supportDesc: "Todas las descargas, audio WAV y capturas son 100% gratis y sin límites. ¡Si te resulta útil, invítame a un café en Ko-fi!",
      kofiBtn: "☕ Invítame a un café en Ko-fi",
      starGithub: "⭐ Valorar en GitHub",
      selectQuality: "Selecciona Calidad / Formato:",
      audioOnly: "🎵 Solo Audio",
      copyLink: "🔗 Copiar enlace directo",
      linkCopied: "🔗 ¡Enlace directo copiado al portapapeles!",
      saveFrame: "📸 Guardar Fotograma (PNG)",
      dlStarted: "⬇ ¡Descarga iniciada!",
      quickDl: "⚡ Descarga directa: ",
      decodingAudio: "🎵 Extrayendo pista de audio WAV...",
      mergingReddit: "🔊 Uniendo pista de audio y vídeo...",
      redditDone: "✅ ¡Vídeo + Audio de Reddit descargado!",
      redditSeparate: "📦 Vídeo grande (>35 MB): guardando vídeo y audio por separado.",
      frameSaved: "📸 ¡Fotograma guardado en PNG!",
      playFirstFrame: "⚠️ Reproduce el vídeo primero para capturar el fotograma.",
      errProtected: "⚠️ No se puede capturar en un vídeo protegido.",
      errLoadQualities: "No se pudieron cargar las calidades.",
      errInvalidUrl: "⚠️ Dirección de vídeo no válida (solo http/https).",
      errBlockedHost: "⚠️ Esta plataforma está restringida y no es compatible.",
      errDownloadFailed: "⚠️ No se pudo iniciar la descarga.",
      errAudioFailed: "⚠️ Error al extraer la pista de audio.",
      btnTooltip: "Clic: Menú de calidades | Shift+Clic: Descarga directa en máxima calidad",
      shiftTip: "💡 Truco: Haz Shift + Clic en el botón del vídeo para bajarlo al instante en máxima calidad."
    },
    fr: {
      sub: "Tout Débloqué · Vidéo, Audio et Capture",
      langLabel: "Langue :",
      langAuto: "Auto (Navigateur)",
      showBtn: "Afficher le bouton flottant :",
      onlyHover: "Afficher uniquement au survol :",
      corner: "Coin du bouton :",
      topRight: "Haut-Droite",
      topLeft: "Haut-Gauche",
      btnSize: "Taille du bouton :",
      iconOpacity: "Opacité de l'icône :",
      hideSite: "🚫 Masquer sur ",
      enableSite: "✅ Activer sur ",
      streamDetected: "⚡ Flux vidéo détecté",
      downloadDetected: "⬇ Télécharger la vidéo détectée",
      supportTitle: "❤️ Soutenir le développement",
      supportDesc: "Toutes les fonctions vidéo, audio WAV et capture sont 100% gratuites et illimitées. Offrez-moi un café sur Ko-fi !",
      kofiBtn: "☕ Offrez-moi un café sur Ko-fi",
      starGithub: "⭐ Étoile sur GitHub",
      selectQuality: "Choisir Qualité / Format :",
      audioOnly: "🎵 Audio Seul",
      copyLink: "🔗 Copier le lien direct",
      linkCopied: "🔗 Lien direct copié dans le presse-papiers !",
      saveFrame: "📸 Capturer l'image (PNG)",
      dlStarted: "⬇ Téléchargement démarré !",
      quickDl: "⚡ Téléchargement direct : ",
      decodingAudio: "🎵 Extraction de l'audio WAV...",
      mergingReddit: "🔊 Fusion vidéo et audio Reddit...",
      redditDone: "✅ Vidéo + Audio Reddit téléchargés !",
      redditSeparate: "📦 Vidéo volumineuse (>35 Mo) : vidéo et audio enregistrés séparément.",
      frameSaved: "📸 Image PNG enregistrée !",
      playFirstFrame: "⚠️ Lancez la vidéo d'abord pour capturer une image.",
      errProtected: "⚠️ Capture impossible sur ce flux protégé.",
      errLoadQualities: "Impossible de charger les qualités.",
      errInvalidUrl: "⚠️ Adresse vidéo non valide (http/https uniquement).",
      errBlockedHost: "⚠️ Cette plateforme n'est pas prise en charge.",
      errDownloadFailed: "⚠️ Impossible de lancer le téléchargement.",
      errAudioFailed: "⚠️ Échec de l'extraction audio.",
      btnTooltip: "Clic : Menu | Maj+Clic : Téléchargement direct en qualité max",
      shiftTip: "💡 Astuce : Maj + Clic sur le bouton vidéo pour télécharger directement en qualité max."
    },
    de: {
      sub: "Alles Freigeschaltet · Video, Audio & Frame",
      langLabel: "Sprache:",
      langAuto: "Auto (Browser)",
      showBtn: "Schwebenden Button anzeigen:",
      onlyHover: "Nur bei Mausberührung zeigen:",
      corner: "Button-Ecke:",
      topRight: "Oben-Rechts",
      topLeft: "Oben-Links",
      btnSize: "Button-Größe:",
      iconOpacity: "Icon-Deckkraft:",
      hideSite: "🚫 Ausblenden auf ",
      enableSite: "✅ Aktivieren auf ",
      streamDetected: "⚡ Aktiver Videostream erkannt",
      downloadDetected: "⬇ Erkanntes Video herunterladen",
      supportTitle: "❤️ Projekt unterstützen",
      supportDesc: "Alle Video-, WAV-Audio- & Frame-Tools sind 100% kostenlos ohne Limits. Spendiere mir gerne einen Kaffee auf Ko-fi!",
      kofiBtn: "☕ Spendiere mir einen Kaffee auf Ko-fi",
      starGithub: "⭐ Stern auf GitHub",
      selectQuality: "Qualität / Format wählen:",
      audioOnly: "🎵 Nur Audio",
      copyLink: "🔗 Direktlink kopieren",
      linkCopied: "🔗 Direktlink in die Zwischenablage kopiert!",
      saveFrame: "📸 Standbild speichern (PNG)",
      dlStarted: "⬇ Download gestartet!",
      quickDl: "⚡ Sofort-Download: ",
      decodingAudio: "🎵 WAV-Audiospur wird extrahiert...",
      mergingReddit: "🔊 Video und Audio werden zusammengefügt...",
      redditDone: "✅ Reddit Video + Audio heruntergeladen!",
      redditSeparate: "📦 Großes Video (>35 MB): Video und Audio werden separat gespeichert.",
      frameSaved: "📸 Standbild als PNG gespeichert!",
      playFirstFrame: "⚠️ Video zuerst abspielen, um ein Bild zu erfassen.",
      errProtected: "⚠️ Standbild bei geschütztem Video nicht möglich.",
      errLoadQualities: "Qualitäten konnten nicht geladen werden.",
      errInvalidUrl: "⚠️ Ungültige Videoadresse (nur http/https).",
      errBlockedHost: "⚠️ Diese Plattform wird nicht unterstützt.",
      errDownloadFailed: "⚠️ Download konnte nicht gestartet werden.",
      errAudioFailed: "⚠️ Audioextraktion fehlgeschlagen.",
      btnTooltip: "Klick: Menü | Umschalt+Klick: Sofort-Download in Max-Qualität",
      shiftTip: "💡 Tipp: Umschalt + Klick auf den Video-Button lädt sofort in bester Qualität herunter."
    },
    pt: {
      sub: "Tudo Desbloqueado · Vídeo, Áudio e Captura",
      langLabel: "Idioma:",
      langAuto: "Auto (Navegador)",
      showBtn: "Mostrar botão flutuante:",
      onlyHover: "Mostrar apenas ao passar o mouse:",
      corner: "Canto do botão:",
      topRight: "Superior-Direito",
      topLeft: "Superior-Esquerdo",
      btnSize: "Tamanho do botão:",
      iconOpacity: "Opacidade do ícone:",
      hideSite: "🚫 Ocultar em ",
      enableSite: "✅ Ativar em ",
      streamDetected: "⚡ Stream de vídeo detectado",
      downloadDetected: "⬇ Baixar vídeo detectado",
      supportTitle: "❤️ Apoie o desenvolvimento",
      supportDesc: "Todas as funções de vídeo, áudio WAV e captura são 100% gratuitas e sem limites. Pague-me um café no Ko-fi!",
      kofiBtn: "☕ Pague-me um café no Ko-fi",
      starGithub: "⭐ Estrela no GitHub",
      selectQuality: "Selecionar Qualidade / Formato:",
      audioOnly: "🎵 Apenas Áudio",
      copyLink: "🔗 Copiar link direto",
      linkCopied: "🔗 Link direto copiado para a área de transferência!",
      saveFrame: "📸 Salvar Quadro (PNG)",
      dlStarted: "⬇ Download iniciado!",
      quickDl: "⚡ Download rápido: ",
      decodingAudio: "🎵 Extraindo faixa de áudio WAV...",
      mergingReddit: "🔊 Unindo vídeo e áudio do Reddit...",
      redditDone: "✅ Vídeo + Áudio do Reddit baixados!",
      redditSeparate: "📦 Vídeo grande (>35 MB): salvando vídeo e áudio separadamente.",
      frameSaved: "📸 Quadro salvo em PNG!",
      playFirstFrame: "⚠️ Reproduza o vídeo primeiro para capturar o quadro.",
      errProtected: "⚠️ Não é possível capturar em vídeo protegido.",
      errLoadQualities: "Não foi possível carregar as qualidades.",
      errInvalidUrl: "⚠️ Endereço de vídeo inválido (apenas http/https).",
      errBlockedHost: "⚠️ Esta plataforma não é suportada.",
      errDownloadFailed: "⚠️ Não foi possível iniciar o download.",
      errAudioFailed: "⚠️ Falha na extração de áudio.",
      btnTooltip: "Clique: Menu | Shift+Clique: Download imediato em qualidade máxima",
      shiftTip: "💡 Dica: Segure Shift + Clique no botão do vídeo para baixar direto na qualidade máxima."
    },
    it: {
      sub: "Tutto Sbloccato · Video, Audio e Cattura",
      langLabel: "Lingua:",
      langAuto: "Auto (Browser)",
      showBtn: "Mostra pulsante flottante:",
      onlyHover: "Mostra solo al passaggio del mouse:",
      corner: "Angolo del pulsante:",
      topRight: "Alto-Destra",
      topLeft: "Alto-Sinistra",
      btnSize: "Dimensione pulsante:",
      iconOpacity: "Opacità icona:",
      hideSite: "🚫 Nascondi su ",
      enableSite: "✅ Attiva su ",
      streamDetected: "⚡ Flusso video rilevato",
      downloadDetected: "⬇ Scarica video rilevato",
      supportTitle: "❤️ Supporta lo sviluppo",
      supportDesc: "Tutti gli strumenti video, audio WAV e cattura fotogrammi sono gratuiti al 100% senza limiti. Offrimi un caffè su Ko-fi!",
      kofiBtn: "☕ Offrimi un caffè su Ko-fi",
      starGithub: "⭐ Stella su GitHub",
      selectQuality: "Seleziona Qualità / Formato:",
      audioOnly: "🎵 Solo Audio",
      copyLink: "🔗 Copia link diretto",
      linkCopied: "🔗 Link diretto copiato negli appunti!",
      saveFrame: "📸 Salva Fotogramma (PNG)",
      dlStarted: "⬇ Download avviato!",
      quickDl: "⚡ Download rapido: ",
      decodingAudio: "🎵 Estrazione traccia audio WAV...",
      mergingReddit: "🔊 Unione audio e video di Reddit...",
      redditDone: "✅ Video + Audio di Reddit scaricato!",
      redditSeparate: "📦 Video grande (>35 MB): salvataggio separato di video e audio.",
      frameSaved: "📸 Fotogramma salvato in PNG!",
      playFirstFrame: "⚠️ Riproduci prima il video per catturare il fotogramma.",
      errProtected: "⚠️ Impossibile catturare su flusso protetto.",
      errLoadQualities: "Impossibile caricare le qualità.",
      errInvalidUrl: "⚠️ Indirizzo video non valido (solo http/https).",
      errBlockedHost: "⚠️ Questa piattaforma non è supportata.",
      errDownloadFailed: "⚠️ Impossibile avviare il download.",
      errAudioFailed: "⚠️ Estrazione audio non riuscita.",
      btnTooltip: "Clic: Menu | Maiusc+Clic: Download istantaneo alla massima qualità",
      shiftTip: "💡 Suggerimento: Maiusc + Clic sul pulsante video per scaricare subito alla massima qualità."
    },
    ar: {
      sub: "جميع الميزات مفتوحة · فيديو، صوت وإطار",
      langLabel: "اللغة:",
      langAuto: "تلقائي (المتصفح)",
      showBtn: "إظهار الزر العائم:",
      onlyHover: "إظهار عند تمرير الماوس فقط:",
      corner: "زاوية الزر:",
      topRight: "أعلى اليمين",
      topLeft: "أعلى اليسار",
      btnSize: "حجم الزر:",
      iconOpacity: "شفافية الأيقونة:",
      hideSite: "🚫 إخفاء في ",
      enableSite: "✅ تفعيل في ",
      streamDetected: "⚡ تم اكتشاف بث فيديو نشط",
      downloadDetected: "⬇ تحميل الفيديو المكتشف",
      supportTitle: "❤️ ادعم التطوير المفتوح",
      supportDesc: "جميع أدوات الفيديو وصوت WAV واللقطات مجانية 100% بلا حدود. إذا أعجبتك الأداة ادعمني بقهوة على Ko-fi!",
      kofiBtn: "☕ اشترِ لي قهوة على Ko-fi",
      starGithub: "⭐ نجمة على GitHub",
      selectQuality: "اختر الجودة / الصيغة:",
      audioOnly: "🎵 صوت فقط",
      copyLink: "🔗 نسخ الرابط المباشر",
      linkCopied: "🔗 تم نسخ الرابط المباشر إلى الحافظة!",
      saveFrame: "📸 حفظ لقطة (PNG)",
      dlStarted: "⬇ بدأ التحميل!",
      quickDl: "⚡ تحميل فوري: ",
      decodingAudio: "🎵 جاري استخراج الصوت بصيغة WAV...",
      mergingReddit: "🔊 جاري دمج الصوت والفيديو...",
      redditDone: "✅ تم تحميل فيديو وصوت Reddit!",
      redditSeparate: "📦 فيديو كبير (>35 MB): يتم حفظ الفيديو والصوت كملفين منفصلين.",
      frameSaved: "📸 تم حفظ اللقطة بصيغة PNG!",
      playFirstFrame: "⚠️ شغّل الفيديو أولاً لالتقاط صورة.",
      errProtected: "⚠️ لا يمكن التقاط صورة من بث محمي.",
      errLoadQualities: "تعذر تحميل خيارات الجودة.",
      errInvalidUrl: "⚠️ رابط فيديو غير صالح (http/https فقط).",
      errBlockedHost: "⚠️ هذه المنصة مقيدة وغير مدعومة.",
      errDownloadFailed: "⚠️ تعذر بدء التحميل.",
      errAudioFailed: "⚠️ فشل استخراج الصوت.",
      btnTooltip: "نقر: القائمة | Shift+نقر: تحميل فوري بأعلى جودة",
      shiftTip: "💡 نصيحة: اضغط Shift + نقر على زر الفيديو للتحميل الفوري بأعلى جودة."
    },
    zh: {
      sub: "全部功能已解锁 · 视频、音频与截图",
      langLabel: "语言:",
      langAuto: "自动 (浏览器)",
      showBtn: "显示悬浮按钮:",
      onlyHover: "仅在鼠标悬停时显示:",
      corner: "按钮位置:",
      topRight: "右上角",
      topLeft: "左上角",
      btnSize: "按钮大小:",
      iconOpacity: "图标不透明度:",
      hideSite: "🚫 在此网站隐藏 ",
      enableSite: "✅ 在此网站启用 ",
      streamDetected: "⚡ 检测到活动视频流",
      downloadDetected: "⬇ 下载检测到的视频",
      supportTitle: "❤️ 支持开源开发",
      supportDesc: "所有视频下载、WAV音频提取和高清截图功能100%免费且无限制。如果对您有帮助，欢迎在 Ko-fi 请我喝杯咖啡！",
      kofiBtn: "☕ 在 Ko-fi 请我喝杯咖啡",
      starGithub: "⭐ 在 GitHub 点星",
      selectQuality: "选择画质 / 格式:",
      audioOnly: "🎵 仅音频",
      copyLink: "🔗 复制直链",
      linkCopied: "🔗 视频直链已复制到剪贴板！",
      saveFrame: "📸 保存当前帧 (PNG)",
      dlStarted: "⬇ 下载已开始！",
      quickDl: "⚡ 极速下载: ",
      decodingAudio: "🎵 正在提取 WAV 音轨...",
      mergingReddit: "🔊 正在合并 Reddit 视频与音频...",
      redditDone: "✅ Reddit 视频+音频下载完成！",
      redditSeparate: "📦 视频较大 (>35 MB)：正在分别保存视频和音频文件。",
      frameSaved: "📸 高清视频帧已保存为 PNG！",
      playFirstFrame: "⚠️ 请先播放视频以便截取画面。",
      errProtected: "⚠️ 无法在受保护的视频流上截图。",
      errLoadQualities: "无法加载视频画质选项。",
      errInvalidUrl: "⚠️ 视频地址无效（仅支持 http/https）。",
      errBlockedHost: "⚠️ 此平台受限，不支持下载。",
      errDownloadFailed: "⚠️ 无法启动下载。",
      errAudioFailed: "⚠️ 音频提取失败。",
      btnTooltip: "点击：画质菜单 | Shift+点击：最高画质极速下载",
      shiftTip: "💡 提示：按住 Shift + 点击视频按钮可直接下载最高画质。"
    },
    id: {
      sub: "Semua Fitur Terbuka · Video, Audio & Bingkai",
      langLabel: "Bahasa:",
      langAuto: "Otomatis (Browser)",
      showBtn: "Tampilkan tombol mengambang:",
      onlyHover: "Tampilkan hanya saat kursor di atas video:",
      corner: "Sudut Tombol:",
      topRight: "Kanan-Atas",
      topLeft: "Kiri-Atas",
      btnSize: "Ukuran Tombol:",
      iconOpacity: "Opasitas Ikon:",
      hideSite: "🚫 Sembunyikan di ",
      enableSite: "✅ Aktifkan di ",
      streamDetected: "⚡ Aliran Video Aktif Terdeteksi",
      downloadDetected: "⬇ Unduh Video Terdeteksi",
      supportTitle: "❤️ Dukung Pengembangan Terbuka",
      supportDesc: "Semua fitur video, audio WAV & tangkapan layar 100% gratis tanpa batas. Jika alat ini membantu, traktir saya kopi di Ko-fi!",
      kofiBtn: "☕ Traktir saya kopi di Ko-fi",
      starGithub: "⭐ Beri Bintang di GitHub",
      selectQuality: "Pilih Kualitas / Format:",
      audioOnly: "🎵 Hanya Audio",
      copyLink: "🔗 Salin Tautan Langsung",
      linkCopied: "🔗 Tautan langsung berhasil disalin!",
      saveFrame: "📸 Simpan Bingkai (PNG)",
      dlStarted: "⬇ Unduhan dimulai!",
      quickDl: "⚡ Unduhan Instan: ",
      decodingAudio: "🎵 Mengekstrak jalur audio WAV...",
      mergingReddit: "🔊 Menggabungkan video dan audio Reddit...",
      redditDone: "✅ Video + Audio Reddit terunduh!",
      redditSeparate: "📦 Video besar (>35 MB): menyimpan video dan audio secara terpisah.",
      frameSaved: "📸 Bingkai Resolusi Tinggi disimpan sebagai PNG!",
      playFirstFrame: "⚠️ Putar video terlebih dahulu untuk menangkap bingkai.",
      errProtected: "⚠️ Tidak dapat menangkap bingkai pada aliran terproteksi.",
      errLoadQualities: "Tidak dapat memuat kualitas video.",
      errInvalidUrl: "⚠️ Alamat video tidak valid (hanya http/https).",
      errBlockedHost: "⚠️ Platform ini dibatasi dan tidak didukung.",
      errDownloadFailed: "⚠️ Tidak dapat memulai unduhan.",
      errAudioFailed: "⚠️ Ekstraksi audio gagal.",
      btnTooltip: "Klik: Menu Kualitas | Shift+Klik: Unduh Instan Kualitas Maksimal",
      shiftTip: "💡 Tips: Tahan Shift + Klik pada tombol video untuk unduh instan kualitas tertinggi."
    }
  };

  function resolverIdioma(pref) {
    if (pref && pref !== "auto" && I18N[pref]) return pref;
    var raw = String((typeof navigator !== "undefined" && navigator.language) || "en").toLowerCase();
    var nav = raw.slice(0, 2);
    if (nav === "in") nav = "id";
    return I18N[nav] ? nav : "en";
  }

  function t(pref) {
    return I18N[resolverIdioma(pref)] || I18N.en;
  }

  function hostLimpio(h) {
    return String(h || "").toLowerCase().replace(/^www\./, "");
  }

  function esDominio(host, dom) {
    var h = hostLimpio(host);
    var d = hostLimpio(dom);
    if (!h || !d) return false;
    return h === d || h.endsWith("." + d);
  }

  function esHostBloqueado(host) {
    var h = hostLimpio(host);
    if (!h) return true;
    for (var i = 0; i < DOMINIOS_BLOQUEADOS.length; i++) {
      if (esDominio(h, DOMINIOS_BLOQUEADOS[i])) return true;
    }
    return false;
  }

  function detectarPlataforma(host) {
    var h = hostLimpio(host);
    if (esDominio(h, "x.com") || esDominio(h, "twitter.com")) return "x";
    if (esDominio(h, "reddit.com") || esDominio(h, "redd.it")) return "reddit";
    if (esDominio(h, "tiktok.com")) return "tiktok";
    if (esDominio(h, "instagram.com")) return "instagram";
    if (/(^|\.)pinterest\.[a-z.]+$/.test(h)) return "pinterest";
    return "web";
  }

  function formatearResolucion(alto, ancho) {
    var h = Number(alto) || 0;
    var w = Number(ancho) || 0;
    var p = (h > 0 && w > 0) ? Math.min(h, w) : (h || w || 0);
    if (p <= 0) return "";
    if (p >= 2160) return "HD 4K";
    if (p >= 1080) return "HD 1080p";
    if (p >= 720) return "720p";
    if (p >= 540) return "540p";
    if (p >= 480) return "480p";
    if (p >= 360) return "360p";
    if (p >= 240) return "240p";
    return p + "p";
  }

  function extDeUrl(url, fallback) {
    var fb = fallback || "mp4";
    try {
      var m = new URL(url).pathname.match(/\.(mp4|webm|m4v|mov|ogv|ogg|mp3|m4a|wav)$/i);
      if (m && m[1]) return m[1].toLowerCase();
    } catch (e) {}
    return fb;
  }

  function etiquetaHonesta(alto, ancho, url) {
    var res = formatearResolucion(alto, ancho);
    if (res) return res;
    return extDeUrl(url, "mp4").toUpperCase();
  }

  function limpiarFragmentoNombre(texto, maxLen) {
    var lim = maxLen || 42;
    var s = String(texto || "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[^\p{L}\p{N}@_-]+/gu, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    return s.slice(0, lim).replace(/_$/g, "");
  }

  return {
    CONFIG: CONFIG,
    DOMINIOS_BLOQUEADOS: DOMINIOS_BLOQUEADOS,
    I18N: I18N,
    resolverIdioma: resolverIdioma,
    t: t,
    hostLimpio: hostLimpio,
    esDominio: esDominio,
    esHostBloqueado: esHostBloqueado,
    detectarPlataforma: detectarPlataforma,
    formatearResolucion: formatearResolucion,
    extDeUrl: extDeUrl,
    etiquetaHonesta: etiquetaHonesta,
    limpiarFragmentoNombre: limpiarFragmentoNombre
  };
})();