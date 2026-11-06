// Sentetik goruntu testi: node test_olcum.js
const O = require('./olcum.js');
const W = 1600, H = 1200;
function bosGri() { return new Uint8Array(W * H).fill(230); }
function dikdortgen(gri, cx, cy, a, b, aci) {
  const c = Math.cos(aci), s = Math.sin(aci);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = (x + 0.5 - cx) * c + (y + 0.5 - cy) * s, v = -(x + 0.5 - cx) * s + (y + 0.5 - cy) * c;
    if (Math.abs(u) <= a / 2 && Math.abs(v) <= b / 2) gri[y * W + x] = 20;
  }
}
let hata = 0;
function esit(ad, gercek, beklenen, tol) {
  const ok = Math.abs(gercek - beklenen) <= tol;
  if (!ok) hata++;
  console.log((ok ? 'OK   ' : 'HATA ') + ad + ': ' + gercek.toFixed(3) + ' (beklenen ' + beklenen + ' +-' + tol + ')');
}
// Referans 400x200 px (sol), nesne 600x300 px (sag, 12 derece donuk)
const g = bosGri();
dikdortgen(g, 400, 600, 400, 200, 0);
dikdortgen(g, 1100, 600, 600, 300, 12 * Math.PI / 180);
const r = O.analiz(g, W, H, {});
const { ref, nesne } = O.referansVeNesne(r.nesneler, true);
esit('referans uzun px', ref.uzun, 400, 1.5);
esit('referans kisa px', ref.kisa, 200, 1.5);
esit('nesne uzun px', nesne.uzun, 600, 1.5);
esit('nesne kisa px', nesne.kisa, 300, 1.5);
const olcek = 40 / ref.uzun; // referans uzun kenari 40 mm
esit('nesne uzun mm', nesne.uzun * olcek, 60, 0.1);
esit('nesne kisa mm', nesne.kisa * olcek, 30, 0.1);
process.exit(hata ? 1 : 0);
