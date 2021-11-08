class TokenServise {
    public token: string | null = null;

    constructor() {
        this.token = localStorage.getItem('NewCMS_accessToken') || null;
    }

    private updateInLocalStore(token: string) {
        localStorage.setItem('NewCMS_accessToken', token);
    }

    setToken(token: string) {
        this.token = token;
        this.updateInLocalStore(token);
    }

    removeToken() {
        this.token = null;
        this.updateInLocalStore('');
    }
}

export const tokenServise = new TokenServise();
