let deferredPrompt
let addBtn

const registerValidSW = (swUrl, config) => {
    navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing
                if (installingWorker == null) {
                    return
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // At this point, the updated precached content has been fetched,
                            // but the previous service worker will still serve the older
                            // content until all client tabs are closed.
                            console.log(
                                'New content is available and will be used when all ' +
                                'tabs for this page are closed. See http://bit.ly/CRA-PWA.'
                            )

                            // Execute callback
                            if (config && config.onUpdate) {
                                config.onUpdate(registration)
                            }
                        } else {
                            // At this point, everything has been precached.
                            // It's the perfect time to display a
                            // "Content is cached for offline use." message.
                            console.log('Content is cached for offline use.')

                            // Execute callback
                            if (config && config.onSuccess) {
                                config.onSuccess(registration)
                            }
                        }
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error during service worker registration:', error)
        })
};

const installServiceWorker = () => {
    window.addEventListener('load', () => {
        addBtn = document.querySelector('.add-button');
        if (addBtn) {
            addBtn.style.display = 'none'
        }

        const swUrl = `/sw.js`;
        window.addEventListener('beforeinstallprompt', function(e) {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            if (addBtn) {
                try {
                    // Prevent Chrome 67 and earlier from automatically showing the prompt
                    e.preventDefault();
                    // Stash the event so it can be triggered later.
                    deferredPrompt = e;
                    // Update UI to notify the user they can add to home screen
                    addBtn.style.display = 'block';

                    addBtn.addEventListener('click', e => {
                        // hide our user interface that shows our A2HS button
                        addBtn.style.display = 'none';
                        // Show the prompt
                        deferredPrompt.prompt();
                        // Wait for the user to respond to the prompt
                        deferredPrompt.userChoice.then(choiceResult => {
                            if (choiceResult.outcome === 'accepted') {
                                console.log('User accepted the A2HS prompt')
                            } else {
                                console.log('User dismissed the A2HS prompt')
                            }
                            deferredPrompt = null
                        })
                    })
                } catch (error) {
                    console.log(error)
                }
            }
        });

        registerValidSW(swUrl)
    });
};

export default installServiceWorker;
