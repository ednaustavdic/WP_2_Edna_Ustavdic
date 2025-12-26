<?php
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';

$count = isset($_GET['count']) ? intval($_GET['count']) : 10;
if($count < 1) $count = 5;
if($count > 100) $count = 100;

$stmt = $mysqli->prepare("SELECT id, question, option_a, option_b, option_c, option_d, correct FROM quiz_questions ORDER BY RAND() LIMIT ?");
$stmt->bind_param('i', $count);
$stmt->execute();
$res = $stmt->get_result();
$out = [];
while($row = $res->fetch_assoc()){
    $options = [];
    if($row['option_a'] !== null) $options[] = $row['option_a'];
    if($row['option_b'] !== null) $options[] = $row['option_b'];
    if($row['option_c'] !== null) $options[] = $row['option_c'];
    if($row['option_d'] !== null) $options[] = $row['option_d'];
    $correct = array_map('trim', explode(',', $row['correct']));
    $out[] = [
        'id' => (int)$row['id'],
        'question' => $row['question'],
        'options' => $options,
        'correct' => $correct
    ];
}

echo json_encode(['count' => count($out), 'questions' => $out], JSON_UNESCAPED_UNICODE);
