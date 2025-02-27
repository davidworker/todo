<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400'); // 24小時

// 處理 preflight 請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 設定資料儲存目錄
$dataDir = './data/users/';

// 確保資料目錄存在
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0777, true);
}

// 取得使用者的資料檔案路徑
function getUserDataFile($uid)
{
    global $dataDir;
    // 對 UID 進行 base64 編碼，避免特殊字元造成的檔案系統問題
    $encodedUid = base64_encode($uid);
    return $dataDir . $encodedUid . '.json';
}

// 讀取使用者資料
function getUserData($uid)
{
    $dataFile = getUserDataFile($uid);
    if (!file_exists($dataFile)) {
        return [];
    }
    $content = file_get_contents($dataFile);
    return json_decode($content, true) ?? [];
}

// 儲存使用者資料
function saveUserData($uid, $data)
{
    $dataFile = getUserDataFile($uid);
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $uid = $_GET['uid'] ?? '';
        if (empty($uid)) {
            http_response_code(400);
            echo json_encode(['code' => 400, 'message' => '需要使用者 ID']);
            exit;
        }
        $data     = getUserData($uid);
        $response = [
            'code' => 200,
            'data' => $data,
        ];
        echo json_encode($response);
        break;

    case 'POST':
        if (!isset($input['uid'])) {
            http_response_code(400);
            echo json_encode(['code' => 400, 'message' => '需要使用者 ID']);
            exit;
        }
        if (!isset($input['data'])) {
            http_response_code(400);
            echo json_encode(['code' => 400, 'message' => '缺少資料']);
            exit;
        }
        saveUserData($input['uid'], $input['data']);
        echo json_encode([
            'code'    => 200,
            'message' => '儲存成功',
        ]);
        break;

    default:
        http_response_code(405);
        echo json_encode([
            'code'    => 405,
            'message' => '不支援的請求方法',
        ]);
        break;
}
