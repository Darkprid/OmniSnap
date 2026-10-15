chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.target !== "offscreen") return;

  if (msg.tipo === "extraer_audio") {
    extraerAudio(msg)
      .then(sendResponse)
      .catch((e) => sendResponse({ exito: false, error: String((e && e.message) || e) }));
    return true;
  }
  if (msg.tipo === "revocar") {
    try { URL.revokeObjectURL(msg.url); } catch (e) {}
    sendResponse({ exito: true });
  }
});

async function extraerAudio({ url, maxBytes }) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Server refused request (" + resp.status + ").");

  const buf = await resp.arrayBuffer();
  if (buf.byteLength > maxBytes) {
    throw new Error("File is too large for audio extraction.");
  }

  const ctx = new OfflineAudioContext(2, 44100, 44100);
  let audio;
  try {
    audio = await ctx.decodeAudioData(buf);
  } catch (e) {
    throw new Error("Could not decode audio track from this stream.");
  }

  const wav = codificarWav(audio);
  const blob = new Blob([wav], { type: "audio/wav" });
  return { exito: true, blobUrl: URL.createObjectURL(blob) };
}

function escribirTexto(dv, pos, texto) {
  for (let i = 0; i < texto.length; i++) dv.setUint8(pos + i, texto.charCodeAt(i));
}

function codificarWav(ab) {
  const canales = Math.min(ab.numberOfChannels, 2);
  const frames = ab.length;
  const sr = ab.sampleRate;
  const dataLen = frames * canales * 2;
  const buffer = new ArrayBuffer(44 + dataLen);
  const dv = new DataView(buffer);

  escribirTexto(dv, 0, "RIFF");
  dv.setUint32(4, 36 + dataLen, true);
  escribirTexto(dv, 8, "WAVE");
  escribirTexto(dv, 12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, canales, true);
  dv.setUint32(24, sr, true);
  dv.setUint32(28, sr * canales * 2, true);
  dv.setUint16(32, canales * 2, true);
  dv.setUint16(34, 16, true);
  escribirTexto(dv, 36, "data");
  dv.setUint32(40, dataLen, true);

  const datos = [];
  for (let c = 0; c < canales; c++) datos.push(ab.getChannelData(c));

  let off = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < canales; c++) {
      const s = Math.max(-1, Math.min(1, datos[c][i]));
      dv.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  return buffer;
}