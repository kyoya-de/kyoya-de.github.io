self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/moco-touch.js',
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
                if (!event.request.url.match(/^https?:/) || event.request.url.match(/^https:\/\/[^.]+\.mocoapp\.com\/api/)) {
                    return response;
                }
                // response may be used only once
                // we need to save clone to put one copy in cache
                // and serve second one
                let responseClone = response.clone();

                caches.open('v1').then(function (cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(function () {
                return caches.match('/assets/marm_logo.svg');
            });
        }
    }));
});
