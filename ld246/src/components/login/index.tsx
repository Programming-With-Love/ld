import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { AtInput, AtTextarea } from "taro-ui"
import { View, Text, Image } from '@tarojs/components'
import { Auth, Log, Common } from '../../tools';
import ModalView from '../modal';
import Net from '../../net';

import './index.scss';

interface defaultProps {
    className?: string,
    isShow?: boolean,
    onClose?: (isLogin: boolean) => void
}
interface props {
    theme: object
}
type PropsWithDefaults = props & defaultProps;

interface S {
    isClose: boolean,
    login2Code: string,
    captcha: string,
    name: string,
    password: string,
    code: string,
    loginType: number,
    xxxStr: string,
    isNeedLogin2: boolean
}
class Tag extends Component<PropsWithDefaults, S> {
    public static defaultProps: defaultProps = {
        isShow: false,
    }

    static options = {
        addGlobalClass: true
    }
    captcha: string;
    constructor(PropsWithDefaults) {
        super(PropsWithDefaults);
        this.state = {
            xxxStr: '',
            loginType: 0,
            isClose: false,
            login2Code: '',
            captcha: '',
            name: '',
            password: '',
            code: '',
            isNeedLogin2: false
        };
        this.captcha = '';
    }

    handleNameChange = (e): void => {
        this.setState({ name: e });
    }

    handlePasswordChange = (e): void => {
        // Log.Info(e);
        this.setState({ password: e });
    }

    handleCodeChange = (e): void => {
        // Log.Info(e);
        this.setState({ code: e });
    }

    handleXxxStrChange = (e): void => {
        // Log.Info(e);
        this.setState({ xxxStr: e });
    }

    handleLogin2Change = (e): void => {
        // Log.Info(e);
        this.setState({ login2Code: e });
    }


    login = (): void => {
        const { name, code, password, captcha, loginType, xxxStr, isNeedLogin2, login2Code } = this.state;
        const { onClose } = this.props as PropsWithDefaults;

        const getUserInfo = () => {
            Net.req(Net.Url.User.I.Info, {}).then((resp) => {
                if (resp.code === 0) {
                    Auth.setUserInfo(resp.data);
                    Taro.showToast({ title: 'Login', icon: 'success' });
                    this.setState({ isClose: true });
                    if (onClose) onClose(true);
                } else {
                    Auth.setCookie('');
                }
            });
        }

        if (loginType === 0) {
            if (Common.trim(name || '').length === 0) { this.toast('请输入用户名/邮箱/手机号'); return; }
            if (Common.trim(password || '').length === 0) { this.toast('请输入密码'); return; }
            if (Common.trim(code || '').length === 0 && captcha.length != 0) { this.toast('请输入验证码'); return; }
            if (Common.trim(login2Code || '').length === 0 && isNeedLogin2) { this.toast('请输入两部验证码'); return; }
            const loginHandle = (resp) => {
                if (resp.code === 0) {
                    Auth.setCookie(`symphony=${resp.token}`);
                    getUserInfo();
                } else if (resp.code === 10) {
                    Auth.setCookie(`symphony=${resp.token}`);
                    this.setState({ isNeedLogin2: true, captcha: '' });
                } else if (resp.needCaptcha) {
                    if (this.captcha !== resp.needCaptcha && resp.needCaptcha?.length != 0) {
                        this.captcha = resp.needCaptcha;
                        this.setState({ captcha: this.captcha });
                    }
                }
            }
            if (isNeedLogin2) {
                Auth.login2(login2Code).then(loginHandle);
            } else {
                Auth.login(name, password, code).then(loginHandle);
            }
        } else {
            if (xxxStr.length === 0) { this.toast('不能为空！'); return; }
            Auth.setCookie(xxxStr);
            getUserInfo();
        }
    }

    toast = (info: string): void => {
        Taro.showToast({ title: info, icon: 'none' });
    }

    render() {
        const { isClose, captcha, name, code, password, loginType, xxxStr, isNeedLogin2, login2Code } = this.state;
        const { isShow, theme, onClose, className } = this.props as PropsWithDefaults;
        const codeUrl = `${Net.Url.Auth.Captcha}?needCaptcha=${captcha}`
        return (
            <ModalView className='login-view' isOpened={isClose ? !isClose : isShow || false} onClose={() => this.setState({isClose: false})} >
                <View className='login-body'>
                    <View className='login-head at-row at-row__justify--between'>
                        <Text className='at-col at-col-1 login-title'>登录</Text>
                        {/* <View className="at-col at-col-1 close">
                            <AtIcon value='close' size='15' color={theme['&iconColor']} />
                        </View> */}
                    </View>
                    {loginType === 0 ? (
                        <View className='login-inputs'>
                            <View className='at-row at-row__align--center at-row__justify--between login-name'>
                                <Text className='icon icon-user' />
                                <View className='at-col'>
                                    <AtInput
                                        // clear
                                      border={false}
                                      name={`name-${className}`}
                                        // title='用户名'
                                      type='text'
                                      placeholder='用户名/邮箱/手机号'
                                      value={name}
                                      onChange={this.handleNameChange}
                                    />
                                </View>
                            </View>
                            <View className='at-row at-row__align--center at-row__justify--between login-password'>
                                <Text className='icon icon-key' />
                                <View className='at-col'>
                                    <AtInput
                                      border={false}
                                      name={`password-${className}`}
                                        // title='用户名'
                                      type='password'
                                      placeholder='密码'
                                      value={password}
                                      onChange={this.handlePasswordChange}
                                    />
                                </View>
                            </View>
                            {captcha.length > 0 ? (
                                <View className='at-row at-row__align--center at-row__justify--between login-code'>
                                    <Text className='icon icon-yelp' />
                                    <View className='at-col'>
                                        <AtInput
                                          border={false}
                                          name={`code-${className}`}
                                            // title='用户名'
                                          type='text'
                                          placeholder='输入右边字符'
                                          value={code}
                                          onChange={this.handleCodeChange}
                                        />
                                    </View>
                                    <Image src={codeUrl} onClick={() => this.setState({ captcha: `${this.captcha}&t=${new Date().getTime()}` })} />
                                </View>
                            ) : null}
                            {isNeedLogin2 ? (
                                <View className='at-row at-row__align--center at-row__justify--between login-login2'>
                                    <Text className='icon icon-yelp' />
                                    <View className='at-col'>
                                        <AtInput
                                          border={false}
                                          name={`login2-${className}`}
                                          type='text'
                                          placeholder='请输入两步验证码'
                                          value={login2Code}
                                          onChange={this.handleLogin2Change}
                                        />
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    ) : (
                            <View className='input-content'>
                                <AtTextarea
                                  count={false}
                                  value={xxxStr}
                                  maxLength={10000}
                                  onChange={this.handleXxxStrChange}
                                  placeholder='这里粘贴你懂的字符串'
                                />
                            </View>
                        )}
                    <View className='at-row at-row__align--center at-row__justify--end login-buttons'>
                        <Text className='login-hard' onClick={() => this.setState({ loginType: loginType === 0 ? 1 : 0 })}>
                            {loginType === 0 ? '登录不上去？' : '账号密码登录'}
                        </Text>
                        <Text className='icon icon-enter login' onClick={this.login} />
                    </View>
                </View>
            </ModalView>
        )
    }
}

export default Tag;