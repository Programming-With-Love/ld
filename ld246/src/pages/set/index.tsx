import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { AtFab, AtTag } from "taro-ui";
import { View, Button } from "@tarojs/components";
import { Auth, Config, Theme } from "../../tools";
import Alert from "../../components/alert";
import FView from "../index";
import TailEdit from '../../components/commentEdit';
import "./index.scss";

interface P { }
interface S {
    isShowExitAlert: boolean,
    themeMode: string,
    themeName: string,
    fontSizeMode: string,
    isAutoSign: boolean,
    tail: string,
    isTailEdit: boolean,
}

class Index extends Component<P, S> {
    ver: string;
    themes: string[];
    constructor(P) {
        super(P);
        this.state = {
            themeMode: Config.userConfig.themeMode,
            fontSizeMode: Config.userConfig.fontSizeMode,
            isShowExitAlert: false,
            themeName: Theme.getNowThemeName(),
            isAutoSign: Config.userConfig.isAutoSign === 1,
            tail: Config.userConfig.tail,
            isTailEdit: false
        };
        const accountInfo = Taro.getAccountInfoSync();
        this.ver = `${accountInfo.miniProgram.envVersion} ${accountInfo.miniProgram.version}`;
        this.themes = Theme.getThemes();
    }

    componentDidMount() {
        this.refresh();
    }

    refresh = () => { };

    toast = (info: string): void => {
        Taro.showToast({ title: info, icon: "none" });
    };

    handleClickFunc = (mode: string, obj: string): void => {
        const { themeMode, fontSizeMode, isAutoSign } = this.state;
        switch (mode) {
            case "themeMode": {
                const themeModeTemp = themeMode === "auto" ? "custom" : "auto";
                let themeName = Config.userConfig.theme;
                if (themeModeTemp === "auto") {
                    themeName = Theme.getSystemTheme();
                    Config.userConfig.theme = themeName;
                    this.handleCickTheme(themeName);
                } else {
                    Config.updateConfig();
                }
                this.setState({ themeMode: themeModeTemp, themeName });
                Config.userConfig.themeMode = themeModeTemp;
            }
                break;
            case "fontSize": {
                if (obj !== fontSizeMode) {
                    this.setState({ fontSizeMode: obj });
                    Config.userConfig.fontSizeMode = obj;
                    this.updateFontSizeMode(obj);
                    Config.updateConfig();
                }
            }
            case "autoSign": {
                this.setState({ isAutoSign: !isAutoSign });
                Config.userConfig.isAutoSign = isAutoSign ? 0 : 1;
                Config.updateConfig();
            }
                break
            case "tailMode": {
                if (obj.length) {
                    this.setState({ isTailEdit: false, tail: obj });
                    Config.userConfig.tail = obj;
                    Config.updateConfig();
                } else {
                    this.setState({ isTailEdit: false, tail: Config.userConfig.tail });
                }
            }
                break
            default:
                break;
        }
    };

    updateFontSizeMode = (mode: string): void => {
        for (const key in Config.configChange) {
            if (Object.prototype.hasOwnProperty.call(Config.configChange, key)) {
                const element = Config.configChange[key];
                if (element) {
                    element('fontSize', mode);
                }
            }
        }
    }

    handleCickTheme = (name: string): void => {
        const navTheme = Theme.getNavThemeJson(name);
        Taro.setNavigationBarColor({
            frontColor: navTheme.frontColor,
            backgroundColor: navTheme.backgroundColor
        });
        for (const key in Config.configChange) {
            if (Object.prototype.hasOwnProperty.call(Config.configChange, key)) {
                const element = Config.configChange[key];
                if (element) {
                    element('theme', name);
                    this.setState({ themeName: name });
                    Config.userConfig.theme = name;
                    Config.updateConfig();
                }
            }
        }
    };

    getThemeTempNode = (name: string): React.ReactNode => {
        const { themeName } = this.state;
        return (
            <View
              className={`theme-temp theme-${name} ${name === themeName ? "active" : ""
                    }`}
              onClick={() => this.handleCickTheme(name)}
            >
                <View className='tabs-temp'>
                    <View className='tabs-temp-text'>{name}</View>
                </View>
                <View className='card-temp'>
                    <View className='card-temp-title'>{name}</View>
                    <View className='card-temp-content'>这是内容</View>
                </View>
            </View>
        );
    };

    handleTailChange = (text: string): void => {
        this.setState({ tail: text });
    }

    render() {
        const { isShowExitAlert, themeMode, fontSizeMode, isAutoSign, tail, isTailEdit } = this.state;
        return (
            <FView className='set-page' onCloseLogin={this.refresh}>
                <Alert
                  isOpened={isShowExitAlert}
                  content='确定退出？'
                  onClose={() => this.setState({ isShowExitAlert: false })}
                  onOk={() => {
                        Auth.exit();
                        Taro.navigateBack();
                    }}
                />
                <AtFab
                  className='set-exit'
                  size='small'
                  onClick={() => this.setState({ isShowExitAlert: true })}
                >
                    <text className='icon icon-exit' />
                </AtFab>
                <View className='set-btn'>
                    <View className='theme-func'>
                        <View>主题模式</View>
                        <View onClick={() => this.handleClickFunc("themeMode", '')}>
                            {themeMode === "auto" ? "跟随系统" : "自定义"}
                        </View>
                    </View>
                    {themeMode === "auto" ? null : (
                        <View className='themes'>
                            {this.themes.map(item => this.getThemeTempNode(item))}
                        </View>
                    )}
                </View>
                <View className='set-btn font-size'>
                    <View>字体大小</View>
                    <View>
                        <View className={`small ${fontSizeMode === 'small' ? 'active' : ''}`} onClick={() => this.handleClickFunc("fontSize", 'small')}>小</View>
                        <View className={`normal ${fontSizeMode === 'normal' ? 'active' : ''}`} onClick={() => this.handleClickFunc("fontSize", 'normal')}>中</View>
                        <View className={`big ${fontSizeMode === 'big' ? 'active' : ''}`} onClick={() => this.handleClickFunc("fontSize", 'big')}>大</View>
                    </View>
                </View>
                <View className='set-btn autoSign'>
                    <View>自动签到</View>
                    <AtTag
                      className='autoSign-switch'
                      active={isAutoSign}
                      onClick={() => this.handleClickFunc("autoSign", '')}
                    >
                        {isAutoSign ? 'ON': 'OFF'}</AtTag>
                </View>
                <View className='set-btn tail'>
                    <View>尾巴定制</View>
                    <View onClick={() => this.setState({isTailEdit: true})}>
                        {tail}
                    </View>
                </View>
                <Button className='set-btn' openType='feedback'>
                    反馈
        </Button>
                <View className='set-btn'>
                    版本：{this.ver} 本次更新内容：
                    <View>
                        <View>支持两部验证登录</View>
                        <View>增加尾巴定制</View>
                        <View>优化消息通知获取业务逻辑</View>
                        <View>修复标签显示问题</View>
                        <View>增加新主题一套</View>
                    </View>
                </View>
                <View className='set-btn about-me'>
                    <View>About</View>
          一个不想做H5的iOS工程师不是一个好的UI设计师。
          <View>
                        第一次写小程序，第一次写ts语言，如看到一些迷惑写法，迷惑逻辑，呃......那就继续看吧，
                        本项目已经开源在 Github https://github.com/goldhan/ld
                        能希望对你有所帮助！
          </View>
                </View>
                <TailEdit
                  isOpened={isTailEdit}
                  value={tail}
                  onChange={this.handleTailChange}
                  onClose={() => this.setState({ isTailEdit: false, tail: Config.userConfig.tail })}
                  placeholder='请输入定制尾巴内容'
                  onOK={() => this.handleClickFunc("tailMode", tail)}
                />
            </FView>
        );
    }
}

export default Index;
