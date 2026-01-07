# Angular + Firebase Web Application

## Opis projekta
Ova aplikacija je razvijena korištenjem Angular frameworka za frontend dio sistema, dok je Firebase korišten kao backend servis. Aplikacija omogućava registraciju i prijavu korisnika, te prikaz personalizovanih podataka za svakog prijavljenog korisnika.

Projekat je implementiran kao Single Page Application (SPA), što omogućava brzo i efikasno korisničko iskustvo bez ponovnog učitavanja stranice.

---

## Korištene tehnologije
- Angular
- TypeScript
- Firebase Authentication
- Firebase Firestore
- RxJS
- HTML5 / CSS3

---

## Funkcionalnosti
- Registracija korisnika (email i lozinka)
- Prijava korisnika
- Autentifikacija putem Firebase Authentication
- Čuvanje korisničkih podataka u Firestore bazi
- Personalizovani prikaz podataka po korisniku
- Sigurna kontrola pristupa podacima

---

## Struktura aplikacije
- src/app/login – komponenta za prijavu
- src/app/register – komponenta za registraciju
- src/app/dashboard – glavna stranica aplikacije
- src/app/profile – korisnički profil
- src/app/services – servisi za autentifikaciju i rad s bazom

---

## Pokretanje projekta

### 1. Instalacija zavisnosti
npm install

### 2. Pokretanje aplikacije
ng serve

Aplikacija će biti dostupna na:
http://localhost:4200

---

## Firebase konfiguracija
Firebase konfiguracija se nalazi u fajlu:
src/environments/environment.ts

Potrebno je unijeti podatke za vlastiti Firebase projekat (API key, authDomain, projectId, itd.).

---

## Sigurnost
Pristup podacima je ograničen pomoću Firebase Security Rules, tako da svaki korisnik ima pristup isključivo svojim podacima.

---

## Autor
Edna Ustavdić
