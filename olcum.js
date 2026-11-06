/* Foto olcum cekirdegi: gri goruntuden nesne bulur, piksel olculerini ve referansla mm'yi hesaplar. DOM'a bagli degil. */
(function (kok) {
  function otsu(gri) {
    const h = new Float64Array(256);
    for (let i = 0; i < gri.length; i++) h[gri[i]]++;
    const n = gri.length;
    let toplam = 0;
    for (let i = 0; i < 256; i++) toplam += i * h[i];
    let sB = 0, wB = 0, enIyi = -1, esik = 128;
    for (let t = 0; t < 256; t++) {
      wB += h[t];
      if (!wB) continue;
      const wF = n - wB;
      if (!wF) break;
      sB += t * h[t];
      const mB = sB / wB, mF = (toplam - sB) / wF;
      const v = wB * wF * (mB - mF) * (mB - mF);
      if (v > enIyi) { enIyi = v; esik = t; }
    }
    return esik;
  }

  /* Baglantili bilesenler (4'lu komsuluk). Doner: {lab, bloklar:[{id, alan, mx, my, dokunur}]} */
  function etiketle(fg, w, h) {
    const lab = new Int32Array(w * h), st = new Int32Array(w * h), bloklar = [];
    let n = 0;
    for (let i = 0; i < w * h; i++) {
      if (!fg[i] || lab[i]) continue;
      n++;
      let sp = 0, alan = 0, sx = 0, sy = 0, dokunur = false;
      st[sp++] = i; lab[i] = n;
      while (sp) {
        const p = st[--sp], x = p % w, y = (p - x) / w;
        alan++; sx += x; sy += y;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) dokunur = true;
        if (x > 0 && fg[p - 1] && !lab[p - 1]) { lab[p - 1] = n; st[sp++] = p - 1; }
        if (x < w - 1 && fg[p + 1] && !lab[p + 1]) { lab[p + 1] = n; st[sp++] = p + 1; }
        if (y > 0 && fg[p - w] && !lab[p - w]) { lab[p - w] = n; st[sp++] = p - w; }
        if (y < h - 1 && fg[p + w] && !lab[p + w]) { lab[p + w] = n; st[sp++] = p + w; }
      }
      bloklar.push({ id: n, alan, mx: sx / alan, my: sy / alan, dokunur });
    }
    return { lab, bloklar };
  }

  /* Secilen bloklarin sinir piksellerinin 4 kosesi (piksel alani tam kapsansin diye) */
  function sinirNoktalari(lab, w, h, idler) {
    const nokta = new Map(idler.map(id => [id, []]));
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const id = lab[y * w + x];
        if (!id || !nokta.has(id)) continue;
        const sinir = x === 0 || y === 0 || x === w - 1 || y === h - 1 ||
          lab[y * w + x - 1] !== id || lab[y * w + x + 1] !== id || lab[(y - 1) * w + x] !== id || lab[(y + 1) * w + x] !== id;
        if (sinir) nokta.get(id).push([x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]);
      }
    }
    return nokta;
  }

  function dis(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }

  function kabuk(noktalar) {
    const p = noktalar.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const alt = [];
    for (const q of p) { while (alt.length >= 2 && dis(alt[alt.length - 2], alt[alt.length - 1], q) <= 0) alt.pop(); alt.push(q); }
    const ust = [];
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (ust.length >= 2 && dis(ust[ust.length - 2], ust[ust.length - 1], q) <= 0) ust.pop(); ust.push(q); }
    alt.pop(); ust.pop();
    return alt.concat(ust);
  }

  /* En kucuk alanli donuk dikdortgen (dondurmeli kaliper). uzun >= kisa (piksel). */
  function enKucukDikdortgen(hull) {
    let en = null;
    for (let i = 0; i < hull.length; i++) {
      const a = hull[i], b = hull[(i + 1) % hull.length];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (!L) continue;
      const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux;
      let u0 = Infinity, u1 = -Infinity, n0 = Infinity, n1 = -Infinity;
      for (const q of hull) {
        const u = q[0] * ux + q[1] * uy, n = q[0] * nx + q[1] * ny;
        if (u < u0) u0 = u; if (u > u1) u1 = u; if (n < n0) n0 = n; if (n > n1) n1 = n;
      }
      const alan = (u1 - u0) * (n1 - n0);
      if (!en || alan < en.alan) {
        const k = [[u0, n0], [u1, n0], [u1, n1], [u0, n1]].map(([u, n]) => [u * ux + n * nx, u * uy + n * ny]);
        en = { alan, w: u1 - u0, h: n1 - n0, kose: k };
      }
    }
    return { uzun: Math.max(en.w, en.h), kisa: Math.min(en.w, en.h), kose: en.kose };
  }

  /* Sinir basamaklarinin her olcuye kattigi fazlalik (piksel): (kabuk alani - piksel alani) / cevre * 2. Sekle ve perspektife bagli degil. */
  function basamakPayi(hull, alan) {
    let a = 0, c = 0;
    for (let i = 0; i < hull.length; i++) {
      const p = hull[i], q = hull[(i + 1) % hull.length];
      a += p[0] * q[1] - q[0] * p[1];
      c += Math.hypot(q[0] - p[0], q[1] - p[1]);
    }
    return c ? 2 * (Math.abs(a) / 2 - alan) / c : 0;
  }
  /* gri: Uint8Array(w*h). Doner: {esik, nesneler:[{mx, my, alan, uzun, kisa, bw, bh, kose}]} (soldan saga sirali) */
  function analiz(gri, w, h, secenek) {
    const acik = !!(secenek && secenek.acikNesne);
    const esik = secenek && secenek.esik >= 0 && secenek.esik <= 255 ? secenek.esik : otsu(gri);
    const fg = new Uint8Array(w * h);
    for (let i = 0; i < fg.length; i++) fg[i] = acik ? (gri[i] > esik ? 1 : 0) : (gri[i] <= esik ? 1 : 0);
    const { lab, bloklar } = etiketle(fg, w, h);
    const asgari = (secenek && secenek.asgariAlan) || w * h * 0.001;
    const kalan = bloklar.filter(b => !b.dokunur && b.alan >= asgari);
    const sinir = sinirNoktalari(lab, w, h, kalan.map(b => b.id));
    const nesneler = kalan.map(b => {
      const hull = kabuk(sinir.get(b.id));
      const r = enKucukDikdortgen(hull);
      const xs = hull.map(q => q[0]), ys = hull.map(q => q[1]);
      /* Dikdortgen benzeri nesnede donuk kenarin basamak hatasi (~1 px) piksel alaniyla duzeltilir; dikdortgen degilse dokunulmaz. */
      const doluluk = b.alan / (r.uzun * r.kisa), s = doluluk > 0.95 ? Math.sqrt(doluluk) : 1;
      return { mx: b.mx, my: b.my, alan: b.alan, uzun: r.uzun * s, kisa: r.kisa * s, doluluk, kose: r.kose, hull, s, pay: basamakPayi(hull, b.alan),
        bw: Math.max(...xs) - Math.min(...xs), bh: Math.max(...ys) - Math.min(...ys) };
    }).sort((a, b) => a.mx - b.mx);
    return { esik, nesneler };
  }

  /* Referans (soldaki ya da sagdaki nesne) ve olculen nesne (kalanlarin en buyugu) */
  function referansVeNesne(nesneler, referansSolda) {
    if (nesneler.length < 2) return null;
    const ref = referansSolda ? nesneler[0] : nesneler[nesneler.length - 1];
    const nesne = nesneler.filter(n => n !== ref).sort((a, b) => b.alan - a.alan)[0];
    return { ref, nesne };
  }

  /* --- Masa isaretleri: 4 kose isareti -> homografi -> parcalar mm uzayinda olculur --- */

  /* 8x8 dogrusal sistem (kismi pivotlu Gauss). a: 8 satir [..8 katsayi.., sag taraf] */
  function coz8(a) {
    const n = 8;
    for (let i = 0; i < n; i++) {
      let m = i;
      for (let r = i + 1; r < n; r++) if (Math.abs(a[r][i]) > Math.abs(a[m][i])) m = r;
      if (Math.abs(a[m][i]) < 1e-12) return null;
      [a[i], a[m]] = [a[m], a[i]];
      for (let r = i + 1; r < n; r++) {
        const f = a[r][i] / a[i][i];
        for (let c = i; c <= n; c++) a[r][c] -= f * a[i][c];
      }
    }
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      let s = a[i][n];
      for (let c = i + 1; c < n; c++) s -= a[i][c] * x[c];
      x[i] = s / a[i][i];
    }
    return x;
  }

  /* 4 noktadan homografi: kaynak [x,y] -> hedef [u,v]. Doner: 3x3 duz dizi (9) ya da null */
  function homografi(kaynak, hedef) {
    const a = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = kaynak[i], [u, v] = hedef[i];
      a.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
      a.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
    }
    const h = coz8(a);
    return h ? [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1] : null;
  }

  function uygula(H, x, y) {
    const w = H[6] * x + H[7] * y + H[8];
    return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
  }

  /* Kare benzeri, benzer alanli 4 isareti goruntu koselerine en yakin olanlardan secer. Sira: sol-ust, sag-ust, sag-alt, sol-alt */
  function masaIsaretleri(nesneler) {
    const adaylar = nesneler.filter(n => n.doluluk > 0.9 && n.uzun / n.kisa < 1.35);
    if (adaylar.length < 4) return null;
    const sec = f => adaylar.reduce((e, n) => (f(n) < f(e) ? n : e));
    const isaret = [sec(n => n.mx + n.my), sec(n => -(n.mx - n.my)), sec(n => -(n.mx + n.my)), sec(n => n.mx - n.my)];
    if (new Set(isaret).size < 4) return null;
    const alanlar = isaret.map(n => n.alan);
    if (Math.max(...alanlar) / Math.min(...alanlar) > 1.6) return null;
    return isaret;
  }

  /* analizSonucu: analiz() ciktisi. genMm: sol-sag isaret merkezleri arasi, yukMm: ust-alt. Doner: {H, parcalar:[{uzun,kisa} mm], mmPx} ya da {hata} */
  function masaOlc(sonuc, genMm, yukMm) {
    const isaret = masaIsaretleri(sonuc.nesneler);
    if (!isaret) return { hata: 'Masanin 4 kose isareti bulunamadi (kare, acik renk, benzer boyutta olmali).' };
    const H = homografi(isaret.map(n => [n.mx, n.my]), [[0, 0], [genMm, 0], [genMm, yukMm], [0, yukMm]]);
    if (!H) return { hata: 'Isaretler dogrusal; perspektif hesaplanamadi.' };
    const parcalar = sonuc.nesneler.filter(n => !isaret.includes(n)).map(n => {
      const r = enKucukDikdortgen(kabuk(n.hull.map(q => uygula(H, q[0], q[1]))));
      const [ux, uy] = uygula(H, n.mx, n.my), [vx, vy] = uygula(H, n.mx + 1, n.my), [wx, wy] = uygula(H, n.mx, n.my + 1);
      const mmPx = Math.max(Math.hypot(vx - ux, vy - uy), Math.hypot(wx - ux, wy - uy));
      return { uzun: r.uzun - n.pay * mmPx, kisa: r.kisa - n.pay * mmPx, doluluk: n.doluluk, mmPx, mx: n.mx, my: n.my, kose: n.kose };
    });
    return { H, isaret, parcalar };
  }

  const api = { otsu, etiketle, kabuk, enKucukDikdortgen, analiz, referansVeNesne, homografi, uygula, masaIsaretleri, masaOlc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else kok.Olcum = api;
})(typeof window !== 'undefined' ? window : globalThis);



