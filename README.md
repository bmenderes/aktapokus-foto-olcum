# aktapokus-foto-olcum

Telefon kamerasiyla cekilen **iki fotografdan** bir nesnenin X, Y, Z olculerini cikarmak.

## Durum
Ilk surum hazir: `index.html` (arayuz) + `olcum.js` (hesap cekirdegi). Kurulum gerektirmez, tarayicida calisir.
Test: `node test_olcum.js` (sentetik goruntu; gercek fotografla henuz denenmedi).

## Hedef
Dogruluk **0,1 mm** (ornek: 15 mm en fazla 15,10 gorunmeli). Nesne koseleri otomatik bulunur.

## Yontem
Fotografta boyutu bilinen bir **referans nesne** (ornegin kredi karti 85,60 x 53,98 mm; uzun kenar girilir) nesneyle yan yana durur.

1. **Foto 1, ustten:** X (uzun kenar) ve Y (kisa kenar).
2. **Foto 2, yandan:** Z (yukseklik). Yan fotodaki genislik ustten olculenle karsilastirilir; fark 0,15 mm'den buyukse uyari verilir.

Algoritma: gri goruntu, Otsu esigi, baglantili bilesenler, sinir piksellerinin konveks kabugu, en kucuk alanli donuk dikdortgen. Dikdortgen nesnelerde donuk kenarin basamak hatasi piksel alaniyla duzeltilir. mm/piksel orani referanstan bulunur.

## Masa isaretleri modu (1,5 x 1 m masa icin)
Masanin 4 kosesine kare, acik renkli isaret (yaklasik 50 mm) yapistirilir; masa zemini koyu. Isaret merkezleri arasi mesafeler (sol-sag, ust-alt) bir kez cetvelle olculup girilir.
Uygulama 4 isareti otomatik bulur, perspektif duzeltmesini (homografi) hesaplar ve parcalari mm uzayinda olcer; referans nesne tasimaya gerek kalmaz, elle cekimde kamera egikligi duzeltilir. Birden fazla parca ayni karede olculebilir.
Test: `node test_masa.js` (sentetik, perspektifli; 600x300 mm parcada hata 0,02 mm).
Sinirlar: foto 1 icin gecerli (X, Y); Z icin foto 2de hala referans nesne gerekir. Masa duz olmali, lens bozulmasi duzeltilmiyor, isaret mesafeleri ne kadar dogru olculurse sonuc o kadar dogru olur.

## 0,1 mm icin gerekenler (kucuk parcalar)
- **Sabit duzenek:** Telefon tutucuda, kameranin nesneye dik oldugu yerde. Elde tutarak 0,1 mm tutmaz.
- **Ayni duzlem:** Referans ve nesne ayni yukseklikte; aksi halde perspektif olcek hatasi yapar.
- **Net kenar:** Arkadan aydinlatma ya da duz, zit renkli zemin. Parlak metalde kenar bulmak zorlasir.
- **Kucuk gorus alani:** Nesne gorselin buyuk kismini kaplamali (yaklasik 10 cm gorus alani, piksel basina yaklasik 0,025 mm).
- **Telefon modu:** Mumkunse keskinlestirme/HDR kapali ya da "pro" mod.

## Bilinen eksikler
- Lens bozulmasi kalibrasyonu yok (damali kart ile yapilmasi gerekir; ozellikle gorus alani genisse 0,1-0,3 mm hata ekleyebilir).
- Gercek fotografla dogruluk olcumu yapilmadi; once bilinen bir parcayla (ornegin 15 mm'lik mastar) denenmeli.
- Dikdortgen olmayan nesnelerde donuk kenar hatasi (yaklasik 1 piksel) duzeltilmez.
- Arayuzde Turkce karakter yok (ASCII).

