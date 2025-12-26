<?php
$servername = "localhost:3306";
$username = "root"; 
$password = "";    
$dbname = "kontakt_baza";

$conn = new mysqli($servername, $username, $password, $dbname);


if ($conn->connect_error) {
    die("Greška pri povezivanju s bazom: " . $conn->connect_error);
}

// Provjera je li forma poslana
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $ime = trim($_POST['ime']);
    $prezime = trim($_POST['prezime']);
    $email = trim($_POST['email']);
    $telefon = trim($_POST['telefon']);
    $poruka = trim($_POST['poruka']);

    // Validacija server-side
    if (!preg_match("/^[A-Za-zčćšđžČĆŠĐŽ ]+$/", $ime) ||
        !preg_match("/^[A-Za-zčćšđžČĆŠĐŽ ]+$/", $prezime)) {
        die("Ime i prezime mogu sadržavati samo slova!");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Neispravna email adresa!");
    }

    if (!preg_match("/^[0-9]{9,12}$/", $telefon)) {
        die("Broj telefona mora imati 9–12 cifara!");
    }

    // SQL upit (koristimo prepared statement)
    $stmt = $conn->prepare("INSERT INTO kontakt_podaci (ime, prezime, email, telefon, poruka) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $ime, $prezime, $email, $telefon, $poruka);

    if ($stmt->execute()) {
        echo "<script>
                alert('Poruka je uspješno poslana!');
                window.location.href = 'kontakt.html';
              </script>";
    } else {
        echo "Greška prilikom slanja: " . $stmt->error;
    }

    $stmt->close();
}

$conn->close();
?>
