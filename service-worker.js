// 最小可用 Service Worker：只負責啟用 PWA
self.addEventListener('fetch', () => {});

// 1. 定義快取名稱與版本 (每次更新 HTML 時，手動改這個編號)
const CACHE_NAME = 'yuchill-app-v101';

// 2. 列出需要快取的靜態檔案 (依據您的專案需求增減)
const ASSETS_TO_CACHE = [
  './',
  './index.html', // 或是您實際的檔名如 ipadyuchill.html
  './manifest.json'
];

// 安裝階段：建立快取並儲存檔案
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('正在預載入快取資源...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 強制讓新的 Service Worker 立即生效，不等待舊版關閉
  self.skipWaiting();
});

// 激活階段：刪除舊版本的快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('刪除舊快取:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // 立即接管所有頁面控制權
  return self.clients.claim();
});

// 攔截請求：優先使用網路，網路不通才用快取 (Network-First)
// 這能解決您「總是看到舊版本」的問題
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});


