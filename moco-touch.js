if (!window.localStorage) {
    throw "Your browser doesn't support a stable version of LocalStorage. MocoTouch is NOT available!";
}

const API_KEY = 'api-key';
const USER_ID = 'user-id';

let user = {
    get apiKey() {
        return this.api_key;
    },
    set apiKey(newKey) {
        this.api_key = newKey;
    },
    get userId() {
        return this.user_id;
    },
    set userId(newId) {
        this.user_id = newId;
    },
    api_key: localStorage.getItem(API_KEY),
    user_id: localStorage.getItem(USER_ID),
};

class MocoApi {
    static set user(newUser) {
        localStorage.setItem(API_KEY, newUser.api_key);
        localStorage.setItem(USER_ID, newUser.user_id);
        user.userId = newUser.user_id;
        user.apiKey = newUser.api_key;
    }

    static get user() {
        return user;
    }

    constructor(domain) {
        this.baseUrl = `https://${domain}.mocoapp.com/api/v1`;
    }

    login = (email, password) => {
        return fetch(
            `${this.baseUrl}/session`,
            {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    "Content-Type": 'application/json',
                    "Accept": 'application/json',
                },
                body: JSON.stringify({email, password})
            }
        );
    };

    fetchPresences = () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);


        return fetch(`${this.baseUrl}/users/presences?from=${lastMonth.toISOString().split('T')[0]}&to=${new Date().toISOString().split('T')[0]}&user_id=${MocoApi.user.userId}`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Authorization': `Token token=${MocoApi.user.apiKey}`
            }
        }).then(response => response.json());
    };

    touch = () => {
        return fetch(`${this.baseUrl}/users/presences/touch`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Authorization': `Token token=${MocoApi.user.apiKey}`
            }
        });
    };
}

const BUTTON_SVG = `<svg viewBox="0 0 120 120" version="1.1"
  xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="55"/>
  <text class="label start" x="60" y="60">Start</text>
  <text class="label stop" x="60" y="60">Stop</text>
</svg>`;

class MocoTouch {
    constructor(mocoApi, appContainer) {
        this.container = appContainer;
        this.api = mocoApi;

        appContainer.addEventListener('submit', this.doLogin);
        appContainer.addEventListener('click', this.doTouch);
    }

    doTouch = event => {
        if ('circle' !== event.target.name && 'text' !== event.target.nodeName) {
            return true;
        }

        this.api.touch().then(() => {
            this.presences = null;
            this.render();
        });

        event.preventDefault();
        return false;
    };

    hasOpenPresences = () => {
        return new Promise((resolve, reject) => {
            if (undefined === this.presences || null === this.presences) {
                this.api.fetchPresences().then(json => {
                    this.presences = json;
                    for (let p of json) {
                        if (null === p.to) {
                            resolve(true);
                            return;
                        }
                    }

                    resolve(false);
                });

                return;
            }

            for (let p of this.presences) {
                if (null === p.to) {
                    resolve(true);
                    return;
                }
            }

            resolve(false);
        });
    };

    doLogin = event => {
        const [email, password] = this.container.querySelectorAll('input');
        this.api.login(email.value, password.value)
            .then(response => {
                response.json().then(json => {
                    if (200 !== response.status) {
                        this.renderError(json.message);
                    } else {
                        MocoApi.user = json;
                        this.render();
                    }
                });
            });
        event.preventDefault();
        return false;
    };

    renderError = message => {
        const html =`<div class="message error">${message}</div>`;

        this.container.insertAdjacentHTML('beforeend', html);
    };

    renderButton = () => new Promise((resolve, reject) => {
        this.hasOpenPresences().then(hasOpenPresences => {
            resolve(`<div class="touch ${hasOpenPresences ? 'started' : 'stopped'}">${BUTTON_SVG}</div>`);
        }).catch(error => reject(error));
    });

    renderLogin = () => new Promise(resolve => resolve(`<form id="doLogin">
            <div class="input">
                <label for="i1">E-Mail:</label>
                <input type="email" id="i1">
            </div>
            <div class="input">
                <label for="i2">Password:</label>
                <input type="password" id="i2">
            </div>
            <div class="input">
                <label></label>
                <button type="submit">Login</button>
            </div>
        </form>`));

    render = () => {
        let partial;

        if (null !== MocoApi.user.apiKey) {
            partial = this.renderButton();
        } else {
            partial = this.renderLogin();
        }

        partial.then(html => {
            for (let c of this.container.childNodes) {
                this.container.removeChild(c);
            }

            this.container.insertAdjacentHTML('afterbegin', html);
        });
    }
}

export { MocoTouch, MocoApi }
