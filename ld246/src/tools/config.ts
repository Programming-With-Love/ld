import Taro from '@tarojs/taro';
import { Log } from '.';
import Common from './common';
import Storage from './stor';

interface userConfig {
    theme: string,
    themeMode: string,
    ver: number,
    fontSizeMode: string,
    isAutoSign: number,
    signDate: string,
    tail: string
}

interface StorageDataKey {
    Config: string,
    Cookie: string,
    NavDatas: string,
    User: string,
    Domain: string
}


let instance: UserConifg;
class UserConifg {
    userConfig: userConfig;
    isDebug: boolean;
    StorageDataKey: StorageDataKey;
    updateConfig: () => void;
    configChange: { [key: string]: (func:string, obj:string) => void; };
    constructor() {
        this.isDebug = true;
        this.StorageDataKey = {
            Config: "ld246-config",
            Cookie: "cookie",
            NavDatas: "navDatas",
            User: "user",
            Domain: "domain"
        };
        this.configChange = {};
        this.init();
        this.updateConfig = Common.debounce(this.updateConfig_S, 1000);
    }

    static Instance = (): UserConifg => {
        if (!instance) {
            instance = new UserConifg();
        }
        return instance;
    }

    updateConfig_S = () => {
        Storage.setData(this.StorageDataKey.Config, this.userConfig);
    }

    init = () => {
        this.userConfig = {
            theme: 'light',
            themeMode: 'auto',
            fontSizeMode: 'normal',
            ver: 1.3,
            isAutoSign: 1,
            signDate: '',
            tail:'来自链滴小程序（非官方）'
        }
        const userConfig = Storage.getData(this.StorageDataKey.Config);
        if (userConfig && userConfig.ver >= this.userConfig.ver) {
            this.userConfig = userConfig;
        } else {
            Storage.setData(this.StorageDataKey.Config, this.userConfig);
        }
        if (this.userConfig.themeMode === 'auto') {
            const obj = Taro.getSystemInfoSync() as any;
            if (obj.theme && obj.theme != this.userConfig.theme) {
                this.userConfig.theme = obj.theme;
                Storage.setData(this.StorageDataKey.Config, this.userConfig);
            }
        }
    }
}

export default UserConifg.Instance();
