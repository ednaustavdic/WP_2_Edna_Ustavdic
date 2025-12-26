# README 

## Pregled projekta

Ovaj projekat predstavlja web aplikaciju koja
studentima te mogućim novim korisnicima nudi interaktivne i edukativne aktivnosti te potrebne informacije: bingo, kanban,
kviz, vision board i interaktivnu ploču kao interaktivne aktivnosti, te informacije i rasporedi za info. 

Aplikacija je izrađena sa: - HTML - CSS - JavaScript - PHP -
MySQL

## Struktura projekta

    WP_1_Edna_Ustavdic/
    │── index.html
    │── kontakt.html
    │── kontakt.php
    │── raspored.html
    │── popis.html
    │── favicon.ico
    │
    ├── css/
    ├── js/
    ├── slike/
    ├── sql/
    │   ├── quiz_schema.sql
    │   └── seed_questions.sql
    │
    └── StudentFunZone/
        ├── StudentFunZone.html
        ├── indexBingo.html
        ├── indexKanban.html
        ├── indexKviz.html
        ├── indexVisionBoard.html
        ├── indexInteractiveWhiteboard.html
        └── api/
            ├── db.php
            └── get_questions.php

## Setup projekta

### Pokretanje lokalnog servera (XAMPP)

1.  Instalirati XAMPP.
2.  Pokrenuti Apache i MySQL.
3.  Kopirati projekat u `C:/xampp/htdocs/`.
4.  Otvoriti u browseru: `http://localhost/WP_1_Edna_Ustavdic/`.

### Setup baze podataka

1.  Otvoriti phpMyAdmin.
2.  Kreirati bazu `kontakt_baza`.
3.  Importovati `quiz_schema.sql` i `seed_questions.sql`.

### PHP konekcija

U `StudentFunZone/api/db.php` podesiti:

``` php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "kontakt_baza";
```

## Opis funkcionalnosti

### Index

Glavna stranica za pristup sajtu.

### Bingo

Generisanje bingo listića uz JavaScript randomizaciju.

### Kanban

Drag & drop task menadžment (To Do → Doing → Done).

### Vision Board

Dodavanje slika i ciljeva putem CSS grid-a.

### Interaktivna Ploča

Canvas za crtanje sa promjenom boje, brisanjem i kontrolama.

### Kviz (MySQL)

-   JS dohvaća pitanja preko `get_questions.php`
-   PHP vraća JSON
-   Prikaz pitanja i rezultata

## Kontakt Forma

-   HTML forma
-   `kontakt.php` za obradu
-   Validacija i povratna poruka

## Napomene

-   MySQL i Apache moraju biti pokrenuti.
-   Kviz neće raditi bez baze.
-   Provjeriti lozinku u `db.php` ako ima grešaka.

## Autor

**Edna Ustavdić**
Web Programiranje, 2025.
