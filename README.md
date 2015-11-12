# Alkalmazások fejlesztése 1. beadandó
- [Leírás](https://github.com/sakakunk/alkfbead1#leírás)
- [Technológiák](https://github.com/sakakunk/alkfbead1#technológiák)
- [Modellek](https://github.com/sakakunk/alkfbead1#modellek)
- [Felhasználói felület](https://github.com/sakakunk/alkfbead1#interfész)
- [Tesztek](https://github.com/sakakunk/alkfbead1#tesztek)
- [Fejlesztés és felhasználás](https://github.com/sakakunk/alkfbead1#fejlesztes)
- [További fejlesztési lehetőség](https://github.com/sakakunk/alkfbead1#funkciok)

##Leírás
A project az ELTE Informatikai kar Alkalmazások fejlesztése tárgy első beadandója során készült.
A project rövid leírása: egy labdarúgó mérkőzés eredményeit, illetve az egyes mérkőzésekhez tartozó játékos-események 
(például gól, sárgalap, stb) rögzítésére, módosítására, törlésére szolgáló weboldal. A felületre az egyes felhasználók
regisztáció, illetve bejelentkezés után rögzíthetnek adatokat, saját focimeccseiket emgtekinthetik, szerkesztetik,
törölhetik. Az admin felhasználó minden meccshez hozzáfér. Egy focimeccsről eltároljuk: a kezdési időpontot, a 2 csapat nevét
és az eredményt. A meccsekhez tartozó játékos-eseményekről tároljuk a játékos nevét, az esemény tipusát, mely lehet gól, 
öngól, sárgalap, piroslap, becserélés és lecserélés, tároljuk továbbá az esemény időpontját, illetve hogy melyik csapathoz 
tartozik. A felhasználókról tudjuk a vezeték és keresztnevüket, felhasználónevüket, jelszavukat, és opcionálisan avatar 
URL-tadhatnak meg.

##Technológiák
A feladat megoldása során Node.js javascriptet használtam. A megjelenítésért a bootswatch felelős, melynek a "United" nevű 
témáját használom, valamint handlebars fájlokkal teszem dinamikussá a html oldalakat.
A Node js-hez tartozó dependency-k (függősségek) nincsenek a github projectben, ezért azt az "npm install --production"
fel kell telepíteni őket. A függősségek listája:
 
 *express
 *body-parser
 *express-validator
 *express-session
 *connect-flash
 *waterline
 *bcryptjs
 *passport
 *hbs
 *chai
 
##Modellek
![Adatbázis modell](https://github.com/3BL/alkfejlbead1/blob/master/documentation/modelrelations.png)

A fenti képen látható az adatbázis-modell. A user modell írja le a felhasználót, akinek az azonosítója (neptun) egyedi.
Felhasználóból tetszőleges számú lehet, és minden egyes felhasználóról elmentjük a kereszt és vezetéknevét, 
felhasználónevét(neptun), jelszavát (titkosítva), illetve a felhasználó által létrehozott focimeccseket. Létezik normál felhasználó(simpleuser), illetve admin.
Egy focimeccs (footballmatch) modellből is tetszőleges számú lehet, mindegyik hozzá van rendelve egy user-hez. Tudjuk továbba
a kezdési időpontot (starttime), mely egy dátum tipus, a státuszt, a két csapatot és az eredményt, melyeket szövegként 
(string) tárolunk el. Minden focimeccshez hozzárendeljük továbbá a hozzátartozó playerevent kolleciót, melyben a 
játékos-események vannak tárolva.
Az egyes játékos-események (playerevent modell) hozzá vannak rendelve egy-egy focimeccshez. Tudjuk továbbá, hogy melyik 
játékosról van szó(name), mi az esemény időpontja(eventTime), az esemény tipusa, mely lehet sárgalap(yellowcard), 
piroslap(redcard), gól(goal), öngól(owngoal), becserélés(subin) és lecserélés(subout). Utóbbi adatokat stringként tároljuk.
A modellben 2 helyen is van one-to-many kapcsolat: egy felhasználóhoz tartozhat sok focimeccs, de egy meccs csak egy felhasználóhoz tartozik, valamint egy meccshez tartozik sok játékos esemény, de egy esemény csak egy meccshez tartozhat.
A modellek megvalósításáért az ORM techológia segítségével történik.

##Interfész
![Adatbázis modell](https://github.com/3BL/alkfejlbead1/blob/master/documentation/webdesign.png)

Felhasználói felület:
A weboldal felső részén található egy piros sáv, melyet találhatóak a következő gombok: bal oldalon: "Eredmények": erre 
kattintva az eredményeket listázza az oldal az adott felhazsnáló számára. Jobb oldalon: ha a felhasználó be van jelentkezve, 
akkor rövid üdvözlő szöveg, és Kijelentkezés funkció. Ha nincs felhasználó bejelentkezve, akk a "Bejelentkezés" gombra 
kattntva megjelenik a bejelentkezés űrlap.
Az oldal többi részén űrlapok, illetve listázó oldalak jelennek meg attól függően, hogy épp melyik aloldalt töltjük be: itt 
tudunk bejelentkezni, regisztrálni, új focimeccset illetve eseményet felvinni, szerkeszteni (mindezeket űrlapok 
segítségével), valamint tudjuk listázni az adott felhasználóhoz tartozó focimeccseket, és a meccsekhez tartozó 
játékos-eseményeket.

##Tesztek
Kétféle képpen teszteltem a programom:
* A chai tipusú tesztelővel végeztem teszteseteket a felhasználókra vonatkozóan, melyek a user.test.js fájlban találhatók.
* Handlebars fájlokban a validator, amivel ellenőrizni lehet az űrlapok helyes kitöltését, megakadályozva, hogy 
értelmetlen/hiányos adatokkal próbáljunk modellpéldányokat létrehozni.

##Fejlesztés és felhasználás
A beadandót a cloud9 webes IDE-ben készítettem el, Windowson, Google Chrome böngészőből. A project folytatható, 
szerkeszthető, ekkor a függőségeket és a bower-t fel kell telepíteni (npm install --production és bower install a c9 
bash-ben).
A fejlesztés zökkenőmentes menetéhez szükség lesz 2GB memóriára és valamilyen 2 magos processzorra minimum.

##Funkció lista 
- Regisztráció, login oldal működik, a jelszó bcrypt-el kódolva kerül az adatbázisba
- A felhasználónév egyedi, csak egy lehet mindegyikből, ha ez nem teljesül, akkor hibát jelez a program
- session működik
- Listázó oldal müködik, mindenki a saját maga által létrehozott meccseket látja, kivéve az admint
- Szerkesztés és Törlés funkció müködik

##További fejlesztési lehetőség:
- többféle tesztelési és validációs lehetőség implementálása
- többféle felhasználói szerepkör megvalósításának felhasználói felületből történő kiosztása
