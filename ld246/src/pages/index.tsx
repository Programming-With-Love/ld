import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { AtMessage, AtFab } from 'taro-ui';
import { View, Text } from '@tarojs/components'
import LoginView from '../components/login';
import { Auth, Log, Config, Theme } from '../tools'
import Net from '../net'
import './style.scss';

const FView = (props) => {
    const isLogin = Auth.isHaveCookie();
    const [isShowLogin, setIsShowLogin] = useState(!isLogin);
    const [themeName, setTheme] = useState(Config.userConfig.theme);
    const [fontSize, setFontSize] = useState(Config.userConfig.fontSizeMode);

    Taro.useDidShow(() => {
        setTheme(Config.userConfig.theme);
        const navTheme = Theme.getNavThemeJson(Config.userConfig.theme);
        Taro.setNavigationBarColor({
            frontColor: navTheme.frontColor,
            backgroundColor: navTheme.backgroundColor,
        })
        if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
            Taro.onThemeChange((res) => {
                if (Config.userConfig.themeMode === 'auto') {
                    setTheme(res.theme);
                    Theme.setTheme(res.theme);
                }
            });
        }

        if (props.className && props.className.length) {
            Net.reLogin[props.className] = () => {
                setIsShowLogin(true);
            };
            Net.closeLogin[props.className] = () => {
                setIsShowLogin(false);
            };

            Config.configChange[props.className] = (func, obj) => {
                switch (func) {
                    case 'theme':
                        setTheme(obj);
                        break;
                    case 'fontSize':
                        setFontSize(obj);
                        break;
                    default:
                        break;
                }
            };
        }
    });
    Taro.useDidHide(() => {
        // Taro.offThemeChange();
    });

    const nowPageNum = Taro.getCurrentPages().length;
    if (nowPageNum >= 6) {
        Taro.showToast({ title: `禁止套娃！当前为第${nowPageNum}页`, icon: 'none' });
    }
    const fontSizeTemp = fontSize === 'big' ? 'bi' : fontSize;
    return <View className={`index ${props.className} font-${fontSizeTemp}`} id={`theme-${themeName}`} >
        <AtMessage />
        {isShowLogin ? (
            <LoginView key={`login-${props.className}`} className={`login-${props.className}`} theme={props.theme} isShow={isShowLogin} onClose={(e) => {
                if (props.onCloseLogin && e) {
                    // setIsShowLogin(false);
                    props.onCloseLogin(e);
                }
                if (e && Net.closeLogin) {
                    for (const key in Net.closeLogin) {
                        if (Object.prototype.hasOwnProperty.call(Net.closeLogin, key)) {
                            const element = Net.closeLogin[key];
                            if (element) element();
                        }
                    }
                }
            }}
            />
        ) : null}
        <AtFab className={`messageIcon ${props.unread?.count > 0 ? 'show' : ''}`} size='small' onClick={() => Taro.navigateTo({ url: `/pages/notifications/index?type=${props.unread.type}` })}>
            <Text className='icon icon-bell' />
        </AtFab>
        {
            React.Children.map(props.children, (child) => {
                return child;
            })
        }
    </View>
}

export default FView;