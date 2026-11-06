// Masa isaretli perspektif testi: node test_masa.js
const O = require('./olcum.js');
const W = 4000, H = 3000;
// Masa 1500x1000 mm; isaret merkezleri (50,50),(1450,50),(1450,950),(50,950), kenar 50 mm. Kamera perspektifli (hafif egik).
const masaKose = [[0, 0], [1500, 0], [1500, 1000], [0, 1000]];
const goruntuKose = [[300, 250], [3750, 160], [3600, 2750], [420, 2850]];
const mp = O.homografi(masaKose, goruntuKose);   // mm -> piksel
const pm = O.homografi(goruntuKose, masaKose);   // piksel -> mm
const parca = { cx: 700, cy: 500, a: 600, b: 300, aci: 10 * Math.PI / 180 };
const gri = new Uint8Array(W * H).fill(20);
const kareler = [[50, 50], [1450, 50], [1450, 950], [50, 950]];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const [X, Y] = O.uygula(pm, x + 0.5, y + 0.5);
  let ac = false;
  for (const [kx, ky] of kareler) if (Math.abs(X - kx) <= 25 && Math.abs(Y - ky) <= 25) ac = true;
  const c = Math.cos(parca.aci), s = Math.sin(parca.aci);
  const u = (X - parca.cx) * c + (Y - parca.cy) * s, v = -(X - parca.cx) * s + (Y - parca.cy) * c;
  if (Math.abs(u) <= parca.a / 2 && Math.abs(v) <= parca.b / 2) ac = true;
  if (ac) gri[y * W + x] = 220;
}
const r = O.analiz(gri, W, H, { acikNesne: true });
const m = O.masaOlc(r, 1400, 900);
let hata = 0;
function esit(ad, g, b, tol) { const ok = Math.abs(g - b) <= tol; if (!ok) hata++; console.log((ok ? 'OK   ' : 'HATA ') + ad + ': ' + g.toFixed(3) + ' (beklenen ' + b + ' +-' + tol + ')'); }
if (m.hata) { console.log('HATA ' + m.hata); process.exit(1); }
console.log('parca sayisi', m.parcalar.length, 'mm/px', m.parcalar[0].mmPx.toFixed(3));
esit('uzun mm', m.parcalar[0].uzun, 600, 0.5);
esit('kisa mm', m.parcalar[0].kisa, 300, 0.5);
process.exit(hata ? 1 : 0);
