import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { AtTabs, AtTabsPane, AtFab } from 'taro-ui'
import FView from '../index';
import Tag from '../../components/tag';
import UserCard from '../../components/userCard';
import Net from '../../net'
import { Auth, Theme, Log, Config, Storage } from '../../tools'

import './index.scss'



interface P { }

interface S {
    data: { [key: string]: ListDataM[]; },
    isLogin: boolean,
    nowTabsIndex: number,
    isShowUserCard: boolean,
    userData?: AuthorM,
    scrollStatus: boolean,
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

interface ListDataM {
    title: string,
    content: string,
    score: string,
    id: string,
    tags: TagM[],
    author: AuthorM,
    viewCount: number,
    commentCount: number,
}

interface TagM {
    title: string,
    url: string,
    img: string,
    id: string,
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
    userGeneralRank: number
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
            userData: undefined,
            scrollStatus: false
        };
        this.height = Taro.getSystemInfoSync().windowHeight;
        this.userName = '';
        this.userID = '';
        this.type = 'articles';
        this.pageNumDic = {};
        this.isLodingMore = false;
        this.navDatas = [
            { title: '帖子', type: 'articles' }, { title: '回帖', type: 'comments' },
            { title: '关注的帖子', type: 'watching-articles' }, { title: '关注的用户', type: 'following-users' },
            { title: '关注的标签', type: 'following-tags' }, { title: '收藏的帖子', type: 'following-articles' }, { title: 'FANS', type: 'followers' }
        ];
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
            this.type = data.router?.params.type || 'articles';
            Taro.setNavigationBarTitle({ title: this.userName });
            if (this.type !== 'articles') {
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

    getData = () => {
        // 'articles' | 'comments' | 'watching-articles' | 'following-users' | 'following-tags' | 'following-articles' | 'followers'
        if (!this.pageNumDic[this.type]) {
            this.pageNumDic[this.type] = 1;
        }
        Net.getUserDetailList(this.userName, this.type, this.pageNumDic[this.type]).then((resp) => {
            
            if (resp.code === 0 && resp.data) {
                const { data } = this.state;
                let lastData = data[this.type] || []; 
                if (this.pageNumDic[this.type] === 1) {
                    lastData = [];
                }
                switch (this.type) {
                    case 'articles':
                    case 'watching-articles':
                    case 'following-articles':
                        data[this.type] = [...lastData, ...resp.data.articles];
                        break;
                    case 'following-tags': {
                            const tags: TagM[] = [];
                            const m: ListDataM = {
                                title: '',
                                content: '',
                                score: '',
                                id: '',
                                tags,
                                author: {
                                    name: '',
                                    userName: '',
                                    img: '',
                                    url: '',
                                    userTags: '',
                                    avatar: '',
                                    dec: '',
                                    userNo: 0,
                                    userGeneralRank:0,
                                    point: 0
                                },
                                viewCount: 0,
                                commentCount: 0,
                            }
                            resp.data.tags.forEach((item) => {
                                tags.push({
                                    title: item.tagTitle || '',
                                    url: item.tagURI || '',
                                    img: item.tagIconPathWithStyle || '',
                                    id: item.oId || '',
                                })
                            })
                            data[this.type] = [m];
                            break;
                        }
                    case 'comments': {
                        const m: ListDataM[] = [];
                        resp.data.comments.forEach((item) => {
                            const authorData = item.commenter;
                            const author = {
                                name: authorData.userNickname.length === 0 ? item.commentArticleAuthorName : authorData.userNickname,
                                avatar: authorData.userAvatarURL,
                                dec: authorData.userIntro,
                                img: authorData.userCardBImgURL,
                                url: authorData.userURL,
                                userTags: authorData.userTags,
                                userNo: authorData.userNo,
                                userGeneralRank: authorData.userGeneralRank,
                                userName: authorData.userName,
                                point: authorData.userPoint
                            };
                            m.push({
                                title: item.commentArticleTitle,
                                content: item.commentContent,
                                score: '',
                                id: item.commentOnArticleId,
                                tags: [],
                                author,
                                viewCount: 0,
                                commentCount: 0,
                            })
                        })
                        data[this.type] = [...lastData, ...m];
                        break;
                    }
                    case 'following-users':
                    case 'followers': {
                        const m: ListDataM[] = [];
                        resp.data.users.forEach((item) => {
                            const authorData = item;
                            const author = {
                                name: authorData.userNickname.length === 0 ? item.userName : authorData.userNickname,
                                avatar: authorData.userAvatarURL,
                                dec: authorData.userIntro,
                                img: authorData.userCardBImgURL,
                                url: authorData.userURL,
                                userTags: authorData.userTags,
                                userNo: authorData.userNo,
                                userGeneralRank: authorData.userGeneralRank,
                                userName: authorData.userName,
                                point: authorData.userPoint
                            };
                            m.push({
                                title: '',
                                content: '',
                                score: '',
                                id: '',
                                tags: [],
                                author,
                                viewCount: 0,
                                commentCount: 0,
                            })
                        })
                        data[this.type] = [...lastData, ...m];
                        break;
                    }   
                    default:
                        data[this.type] = [];
                        break;
                }
                if (this.pageNumDic[this.type] >= resp.data.pagination.paginationPageCount) {
                    this.pageNumDic[this.type] = resp.data.pagination.paginationPageCount;
                }
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
        const theme = Theme.getThemeJson();
        const fontSizeTemp = Config.userConfig.fontSizeMode === 'big' ? 'bi' : Config.userConfig.fontSizeMode;
        return <View className='user-list' >
            {data.map((item, index) => {
                const key = `user-list-card-key-${this.type}${index}`;
                let node = <View />;
                switch (this.type) {
                    case 'articles':
                    case 'watching-articles':
                    case 'following-articles':
                    case 'comments':{
                            node = (
                                <View key={key} className='card article' onClick={() => this.handleClickCard(item)}>
                                    <View className='at-row at-row__justify--between card-head' onClick={() => this.handleClickCard(item)}>
                                        <View className='at-col title'>{item.title}</View>
                                        <View className={`at-col at-col-1 at-col--auto score s${item.score}`}>
                                            <text className='icon icon-bookmark' />
                                        </View>
                                    </View>
                                    <View className='card-content' onClick={() => this.handleClickCard(item)}>
                                        {this.type === 'comments' ? <parser id={`font-${fontSizeTemp}`} html={item.content} /> : <View>{item.content}</View>}
                                    </View>
                                    <View className='at-row at-row__justify--between card-foot'>
                                        <View className='at-row'>
                                            {item.tags.map((item2, index2) => {
                                                const key2 = `tag2-key-${index2}`;
                                                return <Tag theme={theme} key={key2} text={item2.title} url={item2.url} />
                                            })}
                                        </View>
                                        {this.type === 'comments' ? null : (
                                            <View className='at-row at-row__align--center at-row__justify--end card-info'>
                                                {this.type === 'articles' ? null : (
                                                    <View onClick={() => this.setState({ isShowUserCard: true, userData: item.author })}>
                                                        <text className='icon icon-user' />
                                                        {item.author.name}
                                                    </View>
                                                )}
                                                <View>
                                                    <text className='icon icon-eye' />
                                                    {item.viewCount}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                            break;
                        }
                       
                    case 'following-tags':{
                        
                            node = (
                                <View key={key} className='card tags' onClick={() => this.handleClickCard(item)}>
                                    {item.tags.map((item2, index2) => {
                                        const key2 = `tag2-key-${index2}`;
                                        return <Tag theme={theme} key={key2} text={item2.title} url={item2.url} img={item2.img} />
                                    })}
                                </View>
                            );
                            break;
                        }
                       
                    case 'following-users':
                    case 'followers': {
                        const author = item.author;
                        const isHaveBGIMG = author.img?.length > 0;
                            node = (
                                <View className='card-user'>
                                    <View className={`user-card-body ${isHaveBGIMG ? '' : 'noBG'}`} onClick={() => this.handleClickCard(item)}>
                                        {isHaveBGIMG ? <Image className='user-card-bg' src={author.img} mode='aspectFill' /> : ''}
                                        <View className={`user-card-bottom ${isHaveBGIMG ? '' : 'white'}`}>
                                            <View className='user-card-bottom-left'>
                                                <Image className='user-card-avatar' src={author.avatar} />
                                            </View>
                                            <View className='user-card-bottom-right'>
                                                <View className='user-card-base'>
                                                    <Text className='user-card-name'>{author.name}</Text>
                                                    <Text className='user-card-dec'>{author.dec}</Text>
                                                    <Text className='user-card-tags'>{author.userTags}</Text>
                                                </View>
                                                <View className='user-card-info'>
                                                    <Text className='user-card-num'>NO: {author.userNo}</Text>
                                                    <Text className='user-card-rank'>贡献: {author.userGeneralRank}</Text>
                                                    <Text className='user-card-point'>积分: {author.point}</Text>
                                                </View>
                                            </View>

                                        </View>
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
        // 'articles' | 'comments' | 'watching-articles' | 'following-users' | 'following-tags' | 'following-articles' | 'followers'
        let url = '';
        switch (this.type) {
            case 'articles':
            case 'comments':
            case 'watching-articles':
            case 'following-articles':
                url = `/pages/article/index?id=${data.id}&commentCount=-1`;
                break;
            case 'following-users':
            case 'followers':
                url = `/pages/me/index?userName=${data.author.userName}`;
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
 
    render() {
        const theme = Theme.getThemeJson();
        const { data, isLogin, nowTabsIndex, isShowUserCard, userData, scrollStatus } = this.state;
         // 'articles' | 'comments' | 'watching-articles' | 'following-users' | 'following-tags' | 'following-articles' | 'followers'
        return <FView className='me-detail' onCloseLogin={this.refresh}>
            <AtTabs
              className='tab'
              current={nowTabsIndex}
              scroll
              tabList={this.navDatas}
              onClick={this.handleClickTabs}
            >
                {this.navDatas.map((item, index) => {
                    const key = `tab-view-key-${index}`
                    return (
                        <AtTabsPane key={key} current={nowTabsIndex} index={index}>
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
            <UserCard isOpened={isShowUserCard} onClose={() => this.setState({ isShowUserCard: false })} data={userData} />
        </FView>
    }
}
