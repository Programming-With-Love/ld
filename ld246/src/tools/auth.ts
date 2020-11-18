import Log from './log';
import Storage from './stor';
import Common from './common';
import Config from './config';
import Net from '../net';

let instance: Auth;
class Auth {
    cookie: string;
    user: any;
    static Instance = (): Auth => {
        if (instance) return instance;
        instance = new Auth();
        instance.cookie = Storage.getData(Config.StorageDataKey.Cookie) || '';
        return instance;
    }

    isHaveCookie = (): boolean => {
        return this.getCookie() != '';
    }

    setCookie = (cookie: string): void => {
        this.cookie = cookie;
        Storage.setData(Config.StorageDataKey.Cookie, cookie);
    }

    setUserInfo = (data:any):void => {
        data.date = Common.nowDate();
        this.user = data;
        Storage.setData(Config.StorageDataKey.User, data);
    }

    updateUserInfo = () => {
        return Net.req(Net.Url.User.I.Info, { showLoading: false }).then((resp) => {
            if (resp.code === 0) {
                this.setUserInfo(resp.data);
                return this.user;
            } else {
                this.setCookie('');
                return {};
            }
        });
    }

    getLastUserInfo = (): Promise<any> => {
        return new Promise(async (res) => {
            let user = this.user;
            if (!user) {
                user = Storage.getData(Config.StorageDataKey.User);
                this.user = user;
            }
            if (user.date === undefined || Common.getIntervalDays(user.date)) {
                user = await this.updateUserInfo();
            }
            res(user);
        });
    }

    getUserInfo = (): any => {
        if (this.user) {
            return this.user;
        }
        this.user = Storage.getData(Config.StorageDataKey.User);
        return this.user;
    }

    getCookie = (): string => {
        if (this.cookie == '') {
            this.cookie = Storage.getData(Config.StorageDataKey.Cookie) || '';
        }
        return this.cookie;
    }

    login = (name: string, password: string, captcha = ''): any => {
        const parm = {
            userName: name,
            userPassword: Common.encodeMd5(password),
        };
        if (captcha.length > 0) {
            parm["captcha"] = captcha;
        }
        return Net.req(Net.Url.Auth.Login, JSON.stringify(parm), 'POST');
    }

    exit = () => {
        this.setCookie('');
        if (Net.reLogin) {
            for (const key in Net.reLogin) {
                if (Object.prototype.hasOwnProperty.call(Net.reLogin, key)) {
                    const element = Net.reLogin[key];
                    if (element) element();
                }
            }
        }
    }

    getCode = (needCaptcha: string): any => {
        const url = Net.Url.Auth.Captcha + '?needCaptcha=' + needCaptcha;
        return Net.req(url, {}, 'GET');
    }



    // static updateLogin = (cookie: string): any => {
    //     const parm = {
    //         userName: name,
    //         userPassword: Crypto.encodeMd5(password),
    //         captcha: Captcha
    //     };
    //     return Net.req(Net.Url.Auth.Login2, parm, 'POST');
    // }
}

export default Auth.Instance()