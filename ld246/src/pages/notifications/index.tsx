import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import FView from '../index';
import Net from '../../net'
import { Auth, Theme, Log, Config, Common } from '../../tools'

import './index.scss'

interface P { }

interface S {
    data: { [key: string]: ListDataM[]; },
    isLogin: boolean,
    nowTabsIndex: number,
    isShowUserCard: boolean,
    scrollStatus: boolean,
}

interface ListDataM {
    title: string,
    content: string,
    score: string,
    id: string,
    hasRead: boolean,
    authorName: string,
    type: number
}



export default class Index extends Component<P, S> {
    userName: string;
    userID: string;
    type: string;
    pageNumDic: { [key: string]: number };
    navDatas: any[];
    height: number;
    isLodingMore: boolean;
    constructor(P) {
        super(P);
        this.state = {
            nowTabsIndex: 0,
            data: {},
            isLogin: false,
            isShowUserCard: false,
            scrollStatus: false
        };
        this.height = Taro.getSystemInfoSync().windowHeight;
        this.userName = '';
        this.userID = '';
        this.type = 'articles';
        this.pageNumDic = {};
        this.isLodingMore = false;
        this.navDatas = [
            { title: '回帖', type: 'commented', value: 'commentedNotifications' }, { title: '评论', type: 'comment2ed', value: 'comment2edNotifications' }, { title: '回复', type: 'reply', value: 'replyNotifications' },
            { title: '提及', type: 'at', value: 'atNotifications' }, { title: '关注', type: 'following', value: 'followingNotifications' }, { title: '积分', type: 'point', value: 'pointNotifications' },
            { title: '同城', type: 'broadcast', value: 'broadcastNotifications' }, { title: '钱包', type: 'wallet', value: 'walletNotifications' }, { title: '公告', type: 'sys-announce', value: 'sysAnnounceNotifications' }
        ];
    }

    componentDidMount() {
        this.refresh();
        Common.temp['isNotiBack'] = true;
    }

    refresh = () => {
        const isLogin = Auth.isHaveCookie();
        this.setState({ isLogin });
        if (isLogin) {
            const data = Taro.getCurrentInstance();
            this.type = data.router?.params.type || 'commented';
            if (this.type !== 'commented') {
                let nowTabsIndex = 0;
                this.navDatas.forEach((item, index) => {
                    if (this.type === item.type) {
                        nowTabsIndex = index;
                    }
                });
                this.setState({ nowTabsIndex });
            }
            this.getData();
        }
    }
    // NotificationsType: 'commented' | 'comment2ed' | 'reply' | 'at' | 'following' | 'point' | 'broadcast' | 'wallet' | 'sys-announce'
    getData = () => {
        if (!this.pageNumDic[this.type]) {
            this.pageNumDic[this.type] = 1;
        }
        Net.getNotificationsList(this.type, this.pageNumDic[this.type]).then((resp) => {
            if (resp.code === 0 && resp.data) {
                const { data, nowTabsIndex } = this.state;
                let lastData = data[this.type] || []; 
                if (this.pageNumDic[this.type] === 1) {
                    lastData = [];
                    if (resp.data.pagination.paginationPageCount != 0 && this.type != 'broadcast' && this.type != 'wallet' && this.type != 'sys-announce') {
                        this.markUnread();
                    }
                }
                if (this.pageNumDic[this.type] >= resp.data.pagination.paginationPageCount) {
                    this.pageNumDic[this.type] = resp.data.pagination.paginationPageCount;
                }
                const key = this.navDatas[nowTabsIndex].value;
                const m: ListDataM[] = resp.data[key].map((item) => {
                    return {
                        title: item.title || '',
                        content: item.content || '',
                        id: item.dataId,
                        hasRead: item.hasRead,
                        authorName: item.authorName,
                        type: item.dataType
                    }
                });
                data[this.type] = [...lastData, ...m];
                this.setState({ data }, () => {
                    this.isLodingMore = false;
                });
            } else {
                this.isLodingMore = false;
            }
        }).catch(() => {
            this.isLodingMore = false;
        });
    }

    getCardNode = (data?: ListDataM[]): React.ReactNode => {
        if (!data) return <View />;
        // const isHaveBGIMG = data && data.img?.length > 0;
        // NotificationsType: 'commented' | 'comment2ed' | 'reply' | 'at' | 'following' | 'point' | 'broadcast' | 'wallet' | 'sys-announce'
        const theme = Theme.getThemeJson();
        const fontSizeTemp = Config.userConfig.fontSizeMode === 'big' ? 'bi' : Config.userConfig.fontSizeMode;
        return <View className='user-list' >
            {data.map((item, index) => {
                const key = `user-list-card-key-${this.type}${index}`;
                let node = <View />;
                switch (this.type) {
                    case 'commented':
                    case 'comment2ed':
                    case 'reply':
                    case 'following':
                    case 'point':
                    case 'broadcast':
                    case 'wallet':
                    case 'sys-announce':
                    case 'at':{
                            node = (
                                <View key={key} className='card article' onClick={() => this.handleClickCard(item)}>
                                    <View className='at-row at-row__justify--between card-head' onClick={() => this.handleClickCard(item)}>
                                        <View className='at-col title'>{item.title}</View>
                                    </View>
                                    <View className='card-content' onClick={() => this.handleClickCard(item)}>
                                        <parser id={`font-${fontSizeTemp}`} html={item.content} />
                                    </View>
                                    <View className='at-row at-row__justify--between card-foot'>
                                        {this.type === 'comments' ? null : (
                                            <View className='at-row at-row__align--center at-row__justify--end card-info'>
                                                {item.authorName !== '' ? null : (
                                                    <View>
                                                        <text className='icon icon-user' />
                                                        {item.authorName}
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                            break;
                        }
                    default:
                        node = <View />;
                        break;
                }
                return node;
            })}
        </View>
    }

    handleClickCard = (data: ListDataM):void => {
        let url = '';
        switch (this.type) {
            case 'commented':
            case 'comment2ed':
            case 'reply':
                url = `/pages/article/index?id=${data.id}&commentCount=-1`;
                break;
            default:
                break;
        }
        if (url.length) {
            Taro.navigateTo({ url });
        }
    }

    onRefresherRefresh = (): void => {
        this.setState({ scrollStatus: true });
        this.pageNumDic[this.type] = 1;
        this.getData();
        this.setState({ scrollStatus: false });
    }

    onScroll = (e): void => {
        const { scrollTop, scrollHeight, deltaY } = e.detail;
        if (scrollHeight - (scrollTop + this.height) < 30 && !this.isLodingMore && deltaY < 0) {
            this.isLodingMore = true;
            this.pageNumDic[this.type]++;
            this.getData();
            Log.Info('加载', this.type, this.pageNumDic[this.type]);
        }
    }
 
    handleClickTabs = (i: number): void => {
        const { data } = this.state;
        this.type = this.navDatas[i].type;
        this.setState({ nowTabsIndex: i }, () => {
            if (!data[this.type] || data[this.type].length === 0) {
                this.getData();
            }
        });
    }

    markUnread = () => {
        Net.markUnread(this.type);
    }
 
    render() {
        const theme = Theme.getThemeJson();
        const { data, isLogin, nowTabsIndex, isShowUserCard, scrollStatus } = this.state;
         // 'articles' | 'comments' | 'watching-articles' | 'following-users' | 'following-tags' | 'following-articles' | 'followers'
        return <FView className='notifications' onCloseLogin={this.refresh}>
            <AtTabs
              className='tab'
              current={nowTabsIndex}
              scroll
              tabList={this.navDatas}
              onClick={this.handleClickTabs}
              tabDirection='vertical'
            >
                {this.navDatas.map((item, index) => {
                    const key = `tab-view-key-${index}`
                    return (
                        <AtTabsPane key={key} current={nowTabsIndex} index={index} tabDirection='vertical'>
                            <ScrollView
                              className='sub-tab-view'
                              scrollY
                              enableBackToTop
                              scrollWithAnimation
                              refresherEnabled
                              refresherTriggered={scrollStatus}
                              refresherBackground={theme["&bgColor"]}
                              onRefresherRefresh={this.onRefresherRefresh}
                              onScroll={this.onScroll}
                            >
                                {/* {this.getTagsNode(tagDic[item.id] || [])} */}
                                {this.getCardNode(data[item.type] || [])}
                            </ScrollView>
                        </AtTabsPane>
                    )
                })}
            </AtTabs>
        </FView>
    }
}
