# TODO 應用程式

這是一個簡單但功能完整的待辦事項（TODO）網頁應用程式，提供使用者管理日常待辦事項的功能。

## 功能特點

- 🔄 即時待辦事項管理
- 👤 多使用者支援
- 🌐 可配置的 API 端點
- ✅ 待辦事項狀態追蹤（進行中/已完成）
- 🎨 現代化且直覺的使用者介面

## 技術架構

- 前端：HTML5, CSS3, JavaScript (ES6+)
- UI 框架：原生 CSS
- 通知系統：SweetAlert2
- 後端：PHP RESTful API
- 資料儲存：JSON 檔案

## 目錄結構

```
.
├── index.html      # 主要的 HTML 檔案
├── css/           # CSS 樣式檔案
├── js/            # JavaScript 程式碼
│   ├── main.js    # 應用程式主要入口點
│   ├── Todo.js    # 待辦事項物件類別定義
│   ├── TodoList.js # 待辦事項列表管理類別
│   ├── Storage.js  # 本地儲存管理類別
│   └── Cloud.js    # API 通訊管理類別
├── api/           # PHP API 檔案
│   ├── index.php  # API 主要處理檔案
│   └── data/      # JSON 資料儲存目錄
│       └── users/ # 使用者資料目錄
├── favicon/       # 網站圖示檔案
└── .vscode/       # VS Code 編輯器設定
```

## 系統需求

- PHP 7.4 或更高版本
- Apache/Nginx 網頁伺服器
- mod_rewrite 模組（用於 URL 重寫）
- PHP 檔案寫入權限

## 安裝說明

1. 複製專案到本地：
   ```bash
   git clone [專案 URL]
   ```

2. 開啟專案目錄：
   ```bash
   cd todo
   ```

3. 設定檔案權限：
   - 確保 `api/data/users` 目錄可寫入
   ```bash
   chmod -R 755 api
   chmod -R 777 api/data/users
   ```

4. 設定網頁伺服器：
   - 將網站根目錄指向專案資料夾
   - 確保 PHP 有適當的執行權限
   - 啟用 mod_rewrite 模組

5. 設定資料目錄安全性：

   對於 Apache，在 `api/data/` 目錄中建立 `.htaccess` 檔案：
   ```apache
   # 禁止所有直接存取
   Order deny,allow
   Deny from all

   # 禁止列出目錄內容
   Options -Indexes

   # 禁止存取所有 JSON 檔案
   <Files ~ "\.json$">
       Order allow,deny
       Deny from all
   </Files>
   ```

   對於 Nginx，在伺服器設定中加入：
   ```nginx
   # 在 server {} 區塊中加入
   location ^~ /api/data/ {
       deny all;
       return 403;
   }

   # 禁止存取 JSON 檔案
   location ~* \.json$ {
       deny all;
       return 403;
   }
   ```

6. 在瀏覽器中開啟：
   ```
   http://localhost/
   ```

## API 端點說明

RESTful API 提供以下端點：

- GET `/api/?uid={uid}` - 取得指定使用者的所有待辦事項
- POST `/api/` - 儲存使用者的待辦事項
  - 請求內容：
    ```json
    {
      "uid": "使用者ID",
      "data": [待辦事項陣列]
    }
    ```

## 使用方法

1. 首次使用時，需要：
   - 設定使用者名稱
   - 配置 API 端點（預設為 `/api`）

2. 基本操作：
   - 新增待辦事項：在輸入框中輸入內容並點擊「新增」
   - 標記完成：點擊待辦事項前的核取方塊
   - 刪除項目：點擊待辦事項旁的刪除按鈕

## 開發說明

- 專案使用模組化的 JavaScript 架構
- 所有 API 請求都經過錯誤處理
- 使用 LocalStorage 保存使用者設定
- API 遵循 RESTful 設計原則
- 實作了基本的 CORS 保護
- 使用 JSON 檔案儲存資料，每個使用者一個獨立的 JSON 檔案
- 使用 base64 編碼處理使用者 ID，確保檔案名稱安全

## 授權

本專案採用 MIT 授權條款。

## 貢獻指南

歡迎提交 Issue 或 Pull Request 來協助改善專案。

## 聯絡方式

如有任何問題或建議，請透過 Issue 系統與我們聯絡。
