const CACHE_NAME = 'holoapp-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// 1. Installation & mise en cache de tous les fichiers
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting()) // Forcer le Service Worker à devenir actif immédiatement
    );
});

// 2. Activation & nettoyage des anciens caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Stratégie Cache-First : Réponse instantanée sans réseau
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cachedResponse => {
            // Si le fichier est déjà dans le cache de l'iPhone, on le retourne directement
            if (cachedResponse) {
                return cachedResponse;
            }
            // Sinon on va le chercher sur le réseau et on le sauvegarde au passage
            return fetch(e.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    if (e.request.url.startsWith('http')) {
                        cache.put(e.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        })
    );
});