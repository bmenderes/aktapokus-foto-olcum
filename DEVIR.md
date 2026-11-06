# Devir notu: foto-olcum projesi (simdiye kadar yapilanlar)

Bu dosya projeye devam edecek kisi icin. Yontem ve kullanim ayrintisi `README.md` icinde.

## Amac
Telefon kamerasiyla cekilen iki fotografdan bir parcanin X, Y, Z olculerini cikarmak.
- Parcalar: aluminyum, genelde duz levha. En buyuk parca yaklasik 1000 x 500 x 500 mm.
- Kamera elde tutulacak (sabit duzenek yok). Zemin mumkun oldugunca duz olacak.
- Nesne koseleri otomatik bulunacak.

## Alinan kararlar
- **Dogruluk hedefi:** Ilk istek 0,1 mm idi. 1 m'lik parcada 0,1 mm telefonla mumkun degil (piksel basina ~0,28 mm). Kullanici buyuk parcada bu hassasiyeti beklemedigini belirtti. Gercekci beklenti: ~100 mm parcada 0,1-0,2 mm, ~1 m parcada 0,5-1 mm.
- **Olcek kaynagi:** Referanssiz olcek cikarilamaz. Masaya 4 kosesinde kare, acik renkli etiket (~50 mm) yapistirilacak; zemin koyu. Masa yaklasik 1,5 x 1 m. Etiket merkezleri arasi mesafe bir kez cetvelle olculup uygulamaya girilir.
- **Masa henuz yok.** Hazirlanmadi; etiketler yapistirilmadi.
- **Yazilim:** Kurulum gerektirmeyen, tarayicida calisan tek sayfa (`index.html` + `olcum.js`). Hedef makinede Python ya da SDK gerekmez. Testler icin Node.js gerekir.
- **Arayuzde Turkce karakter yok** (ASCII), dosya yazimi sirasinda bozulma olmasin diye.

## Dosyalar
- `olcum.js`: hesap cekirdegi (DOM'a bagli degil).
- `index.html`: telefon arayuzu. Iki foto secilir (kamera ya da galeri), mod ve olculer girilir, "Olc" sonuc ve belirsizlik gosterir.
- `test_olcum.js`: referans nesne modu icin sentetik test. `node test_olcum.js`
- `test_masa.js`: masa isaretleri modu, perspektifli sentetik test. `node test_masa.js`
- `README.md`: yontem, kosullar, bilinen eksikler.

## Nasil calisiyor
1. Gri goruntu, Otsu esigi (koyu ya da acik nesne secilir), baglantili bilesenler.
2. Her nesnenin sinir piksellerinden konveks kabuk, sonra en kucuk alanli donuk dikdortgen.
3. **Masa modu (Foto 1, X ve Y):** 4 kose isareti (kare, benzer alanli, goruntu koselerine en yakin) bulunur, homografi hesaplanir, kabuk noktalari mm uzayina cevrilip orada olculur. Kamera egikligi duzelir. Birden fazla parca ayni karede olculebilir.
4. **Referans nesne modu:** Yan yana duran referansin (ornegin kredi karti, uzun kenari girilir) piksel boyutundan mm/piksel orani bulunur.
5. **Foto 2, yandan (Z):** Referans nesneyle olcek; Z = nesnenin yan fotodaki yuksekligi. Yan fotodaki genislik ustten olculenle karsilastirilir, fark 0,15 mm'den buyukse uyari verir.
6. Sinir basamagi duzeltmesi: dikdortgenin sinirindaki piksel basamaklari her olcuye ~1 piksel fazlalik ekler; kabuk alani ile piksel alani farkindan hesaplanip dusulur (sekle ve perspektife bagli degil).
7. Her sonucun yaninda cozunurluk (mm/piksel) ve tahmini belirsizlik (~1,5 piksel) gosterilir.

## Test durumu
- Referans modu, sentetik: 60 x 30 mm nesnede hata yaklasik 0,06 mm.
- Masa modu, sentetik (4000 x 3000 px, egik kamera, piksel ~0,45 mm): 600 x 300 mm parcada hata 0,06 mm'nin altinda.
- **Gercek fotografla henuz test edilmedi.** Sentetik testlerde lens bozulmasi, yansima ve gurultu yok; gercek hata bundan buyuk olacak.
- `index.html` tarayicida henuz acilip denenmedi; yalnizca script sozdizimi kontrol edildi.

## Bilinen eksikler / yapilacaklar (onem sirasiyla)
1. **Gercek fotografla dogrulama:** Olcusu bilinen bir parca (ya da mastar) ile iki foto cekip sonucu karsilastirin. Bu yapilmadan dogruluk iddiasi gecerli degil.
2. **Parlak aluminyum:** Yansima nedeniyle parca parcali gorunebilir. Cozum fikri: nesne icindeki bosluklari dolduran bir islem (morfolojik kapama), yumusak/dagnik isik, mat siyah zemin.
3. **Lens bozulmasi** duzeltilmiyor (damali kart ile kalibrasyon gerekir). Genis gorus alaninda 0,1-0,3 mm hata ekleyebilir.
4. **Z (kalinlik):** Yan fotografta hala referans nesne gerekiyor; levha ince oldugu icin yakin cekim (sadece kenar + kucuk referans) onerilir. Masa isaretleriyle Z yok.
5. **Masa duzlugu ve isaret mesafeleri:** Sonuc bunlara dogrudan bagli; masa hazirlaninca isaret mesafelerini dikkatle olcun.
6. Fotografta masanin uzun kenari yataya yakin olmali (kose siralamasi bu varsayimla yapiliyor).
7. Dikdortgen olmayan parcalarda "en kucuk donuk dikdortgen" boyutu verilir (ornegin L seklinde parcanin kapsayan dikdortgeni).
8. Arayuzde Turkce karakter yok; istenirse duzeltilebilir.

## Onerilen sonraki adim
Masayi hazirlayip bilinen bir parcayla gercek bir deneme yapin; sapmayi olcun. Sapma buyukse once lens kalibrasyonu ve parlak nokta doldurmayi ekleyin.
