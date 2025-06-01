const CACHE_NAME = 'roller-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/main.js',
  '/style.css',
  '/manifest.json',
  '/assets/textures/ball.png',
  '/assets/textures/wall.png',
  '/assets/textures/floor.png',
  '/assets/sounds/collision.mp3',
  '/assets/sounds/win.mp3',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 安装Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: 安装中');
  
  // 预缓存资源
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: 缓存资源');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // 强制激活，不等待旧的Service Worker终止
        return self.skipWaiting();
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: 激活');
  
  // 清理旧缓存
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 清理旧缓存', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 立即接管所有页面
      return self.clients.claim();
    })
  );
});

// 处理fetch请求
self.addEventListener('fetch', (event) => {
  // 网络优先策略
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 如果获取成功，复制响应并存入缓存
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 如果网络请求失败，尝试从缓存获取
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // 如果缓存中也没有，返回一个离线页面或错误
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
          
          return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
