import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components'
import { AtFab } from 'taro-ui'
import { Auth, Log } from '../../tools';
import './index.scss';

interface defaultProps {
    isShow: boolean,
    onClose?: () => void
}
interface props {
    theme: object
}
type PropsWithDefaults = props & defaultProps;

interface S {
    isShowMenu: boolean
}
class Menu extends Component<PropsWithDefaults, S> {
    public static defaultProps: defaultProps = {
        isShow: false,
    }
    static options = {
        addGlobalClass: true
    }

    constructor(PropsWithDefaults) {
        super(PropsWithDefaults);
        this.state = {
            isShowMenu: false
        }
    }

    toast = (info: string): void => {
        Taro.showToast({ title: info, icon: 'none' });
    }

    render() {
        const { isShowMenu } = this.state;
        const { theme, onClose } = this.props as PropsWithDefaults;
        // let isShowTemp = isShow;
        return (
            <View className='menu-view'>
                <AtFab className='menuIcon' size='small' onClick={() => this.setState({ isShowMenu: !isShowMenu })}>
                    <text className='at-fab__icon at-icon at-icon-menu' />
                </AtFab>
                {isShowMenu ? (
                    <View className='menu' onClick={() => {
                        this.setState({ isShowMenu: false }); 
                        if (onClose) onClose();
                    }}
                    >
                        <AtFab className='menuIcon setIcon' size='small' onClick={() => {
                            if (onClose) onClose();
                            Taro.navigateTo({ url: '/pages/set/index' });
                        }}
                        >
                            <text className='icon icon-cog' />
                        </AtFab>
                        <View className='drawer-item'>
                            <View className='menu-btns' >
                                <View className='menu-btn' onClick={() => {
                                    if (onClose) onClose();
                                    const data = Auth.getUserInfo();
                                    const userName = data.user.userName;
                                    Taro.navigateTo({ url: `/pages/me/index?userName=${userName}` });
                                }}
                                >
                                    <text className='icon icon-user' />
                                Me
                                </View>
                                <View className='menu-btn' onClick={() => {
                                    if (onClose) onClose();
                                    Taro.navigateTo({ url: '/pages/notifications/index' });
                                }}
                                >
                                        <text className='icon icon-bell' />
                                    Message
                                </View >
                                <View className='menu-btn' onClick={() => {
                                    if (onClose) onClose();
                                    Taro.navigateTo({ url: '/pages/domain/index' });
                                }}
                                >
                                    <text className='icon icon-yelp' />
                                Domain
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null}
            </View>
        )
    }
}

export default Menu;