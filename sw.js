self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/moco-touch.js',
                '/moco-touch-sw.js',
                '/assets/marm_logo-48.png',
                '/assets/marm_logo-192.png',
                '/assets/marm_logo-144.png',
                '/assets/marm_logo-180.png',
                '/assets/marm_logo-256.png',
                '/assets/marm_logo-152.png',
                '/assets/marm_logo-512.png',
                '/assets/marm_logo-96.png',
                '/assets/marm_logo-128.png',
                '/assets/marm_logo-167.png',
                '/assets/marm_logo-1024.png',
                '/assets/favicon.png',
                '/assets/marm_logo.svg'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
        // caches.match() always resolves
        // but in case of success response will have value
        if (response !== undefined) {
            return response;
        } else {
            return fetch(event.request).then(function (response) {
                return response;
            }).catch(function () {
                return caches.match('/assets/marm_logo.svg');
            });
        }
    }));
});
