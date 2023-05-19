import {ConfigEnum} from "../enums/config.enum";
import {DefaultResponseType} from "../types/default-response.type";
import {RefreshResponseType} from "../types/refresh-response.type";
import {UserInfoType} from "../types/user-info.type";
import {AuthEnum} from "../enums/auth.enum";

export class Auth {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoKey = 'userInfo';

    public static async processUnauthorizedResponse(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(ConfigEnum.backendHost + AuthEnum.refresh, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({"refreshToken": refreshToken})
            })

            if (response && response.status === 200) {
                const result: RefreshResponseType | null = await response.json();

                if (result && !result.error && result.tokens) {
                    this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    return true;
                }
            }
        }

        this.removeTokens();
        if (location.href.split('#/')[1] !== 'login') {
            location.href = '#/login';
        }
        return false;
    }

    public static async logout(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(ConfigEnum.backendHost + 'logout', {
                method: "POST",
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            if (response && response.status === 200) {
                const result: DefaultResponseType = await response.json();
                if (result && !result.error) {
                    Auth.removeTokens();
                    localStorage.removeItem(Auth.userInfoKey);
                    return true;
                }
            }
        }
        return false;
    }


    public static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    private static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static setUserInfo(info: UserInfoType):void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    // static getUserInfo() {
    //     const userInfo = localStorage.getItem(this.userInfoKey);
    //     if (userInfo) {
    //         return JSON.parse(userInfo);
    //     }
    //
    //     return null;
    // }


}