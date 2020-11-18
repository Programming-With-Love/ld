import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components'
import FView from '../index';
import Tag from '../../components/tag';
import Net from '../../net'
import { Auth, Common, Config, Theme } from '../../tools'

import './index.scss'



interface P { }

interface S {
    userData?: AuthorM,
    eventsData?: EventM[],
    isLogin: boolean,
    isSign: boolean
}

interface AuthorM {
    name: string,
    userName: string,
    img: string,
    url: string,
    userTags: string,
    avatar: string,
    dec: string,
    userNo: number,
    userGeneralRank: number,
    point: number
}

interface EventM {
    title: string,
    content: string,
    relationId: string,
    time: string,
    operation: string,
    type: string,
    url: string,
    name: string
}

export default class Index extends Component<P, S> {
    userName: string;
    userID: string;
    meUserName: string;
    constructor(P) {
        super(P);
        this.state = {
            isSign: !(Config.userConfig.signDate !== Common.nowDate()),
            userData: undefined,
            eventsData: undefined,
            isLogin: false,
        };
        this.userName = '';
        this.userID = '';
        this.meUserName = '';
        const user = Auth.getUserInfo();
        if (user && user.user) {
            this.meUserName = user.user.userName;
        }
    }

    componentDidMount() {
        this.refresh();
    }

    refresh = () => {
        const isLogin = Auth.isHaveCookie();
        this.setState({ isLogin });
        if (isLogin) {
            const data = Taro.getCurrentInstance();
            this.userName = data.router?.params.userName || '';
            this.userID = data.router?.params.id || '';
            this.getUserDetail();
            this.getUserEvent();
        }
    }

    getUserDetail = () => {
        Net.getUserDetail(this.userName).then((resp) => {
            if (resp.code === 0) {
                const authorData = resp.data.user;
                const name = authorData.userNickname.length ? authorData.userNickname : authorData.userName;
                this.setState({
                    isSign: !(Config.userConfig.signDate !== Common.nowDate()),
                    userData: {
                        name,
                        avatar: authorData.userAvatarURL,
                        dec: authorData.userIntro,
                        img: authorData.userCardBImgURL,
                        url: authorData.userURL,
                        userTags: authorData.userTags,
                        userNo: authorData.userNo,
                        userGeneralRank: authorData.userGeneralRank,
                        userName: authorData.userName,
                        point: authorData.userPoint,
                    }
                });
                Taro.setNavigationBarTitle({ title: name });
            }
        });
    }

    getUserEvent = () => {
        Net.getUserEvent(this.userName).then((resp) => {
            if (resp.code === 0 && resp.data.length) {
                const data = resp.data;
                const eventsData: EventM[] = data.map((item) => {
                    let strArr = item.url.split('/comment/');
                    strArr = strArr[0].split('/');
                    const relationId = strArr[strArr.length - 1];
                    return {
                        title: item.title,
                        content: item.content,
                        relationId,
                        time: item.timeAgo,
                        operation: item.operation,
                        type: item.type,
                        url: item.url,
                        name: item.name
                    }
                });
                this.setState({
                    eventsData
                });
            }
        });

        // Auth.getLastUserInfo().then((resp) => {
        //     console.log('1111', resp);
        // });
    }

    getUserCardNode = (data?: AuthorM): React.ReactNode => {
        if (!data) return null;
        const isHaveBGIMG = data && data.img?.length > 0;
        return <View className='me-user-card'>
            <View className={`user-card-body ${isHaveBGIMG ? '' : 'noBGIMG'}`}>
                {isHaveBGIMG ? <Image className='user-card-bg' src={data.img} mode='aspectFill' /> : ''}
                <View className={`user-card-bottom ${isHaveBGIMG ? '' : 'white'}`}>
                    <View className='user-card-bottom-left'>
                        <Image className='user-card-avatar' src={data.avatar} />
                    </View>
                    <View className='user-card-bottom-right'>
                        <View className='user-card-base'>
                            <Text className='user-card-name'>{data.name}</Text>
                            <Text className='user-card-dec'>{data.dec}</Text>
                            <Text className='user-card-tags'>{data.userTags}</Text>
                        </View>
                        <View className='user-card-info'>
                            <Text className='user-card-num'>NO: {data.userNo}</Text>
                            <Text className='user-card-rank'>贡献: {data.userGeneralRank}</Text>
                            <Text className='user-card-point'>积分: {data.point}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    }

    getOtherInfoCardNode = (data?: AuthorM): React.ReactNode => {
        if (!data) return null;
        return <View className='other-info-card'>
            <View onClick={() => this.handleClickBtn('articles')}>帖子</View>
            <View onClick={() => this.handleClickBtn('comments')}>回帖</View>
            <View onClick={() => this.handleClickBtn('watching-articles')}>关注</View>
            <View onClick={() => this.handleClickBtn('following-articles')}>收藏</View>
        </View>
    }

    getEventsNode = (data?: EventM[]): React.ReactNode => {
        if (!data || data.length === 0) return null;
        const theme = Theme.getThemeJson();
        return <View className='events-list' >
            {data.map((item, index) => {
                const key = `events-card-key-${index}`;
                return <View key={key} className='events-card' onClick={() => this.handleClickEvent(item)}>
                    <View className='events-card-head'>
                        <View>{item.operation}</View>
                        <View>{item.time}</View>
                    </View>
                    <View className='events-card-content'>
                        <View>{item.content}</View>
                    </View>
                    <View className='events-card-foot'>
                        {item.type === 'follow-tag' ? <Tag text={item.title} theme={theme} url={item.url} /> : <View>{item.title}</View>}
                    </View>
                </View>
            })}
        </View>
    }

    handleClickBtn = (type: string = Net.UserDetailListType): void => {
        Taro.navigateTo({ url: `/pages/meDetail/index?userName=${this.userName}&type=${type}` });
    }

    handleClickEvent = (data: EventM): void => {
        if (data.relationId.length > 0) {
            let url = '';
            switch (data.type) {
                case 'comment2':
                case 'comment':
                case 'article':
                case 'thank-article':
                case 'thank-comment':
                case 'thank-comment2':
                    url = `/pages/article/index?id=${data.relationId}&commentCount=-1`;
                    break;
                case 'breezemoon':
                case 'thank-breezemoon':
                case 'follow-user':
                case 'vote-breezemoon':
                    url = `/pages/me/index?userName=${data.name}`;
                    break;
                default:
                    break;
            }
            if (url.length) {
                Taro.navigateTo({ url });
            }
        }
    }

    render() {
        const theme = Theme.getThemeJson();
        const { userData, eventsData, isLogin, isSign } = this.state;
        return <FView className='me-page' onCloseLogin={this.refresh}>
            {this.getUserCardNode(userData)}
            {this.getOtherInfoCardNode(userData)}
            {this.getEventsNode(eventsData)}
            {this.userName === this.meUserName ? <View className={`me-sign ${isSign ? 'gray' : ''}`} onClick={() => {
                if (!isSign){
                    Net.sign().then(() => {
                        this.getUserDetail();
                    });
                };
            }}
            >{isSign ? '已签到' : '签到'}</View> : null}
        </FView>
    }
}
