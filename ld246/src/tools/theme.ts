import Taro from '@tarojs/taro';
import UserConifg from './config';

interface NavThemeM {
    frontColor: string,
    backgroundColor: string,
}

class Theme {
    getAPPThemeStatus = (): void => {

    }

    setTheme = (themeName): void => {
        UserConifg.userConfig.theme = themeName;
        UserConifg.updateConfig();
    }

    getNowThemeName = (): string => {
        return UserConifg.userConfig.theme;
    }

    getThemeJson = (): object => {
        return {};
    }

    getNavThemeJson = (name:string): NavThemeM => {
        return {
            'light': {
                backgroundColor: '#FFFFFF',
                frontColor: '#000000',
            },
            'realMan': {
                backgroundColor: '#f6f6f6',
                frontColor: '#000000',
            },
            'gayhub': {
                backgroundColor: '#faf4ff',
                frontColor: '#000000',
            },
            'dark': {
                backgroundColor: '#0E0E0E',
                frontColor: '#ffffff',
            },
            'tikTok': {
                backgroundColor: '#171c1f',
                frontColor: '#ffffff',
            },
        }[name];
    };

    getThemes = (): string[] => {
        return ['light', 'dark', 'tikTok', 'realMan', 'gayhub'];
    }

    getSystemTheme = ():string => {
        const obj = Taro.getSystemInfoSync() as any;
        if (obj.theme) {
            return obj.theme;
        }
        return 'light';
    }
}

export default new Theme();