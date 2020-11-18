import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, ScrollView } from '@tarojs/components'
import FView from '../index';
import Tag from '../../components/tag';
import UserCard from '../../components/userCard';
import Net from '../../net'
import { Auth, Theme, Log, Config, Storage } from '../../tools'

import './index.scss'



interface P { }

interface S {
    data: ArticleM[],
    tagData?: TagDetailM,
    isLogin: boolean,
    isShowUserCard: boolean,
    userData?: AuthorM,
    scrollStatus: boolean,
}

interface TagDetailM {
    title: string,
    content: string,
    id: string,
    domain: string,
    img: string,
    viewCount: number,
    commentCount: number,
    followerCount: number,
    referenceCount: number,
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


interface ArticleM {
    title: string,
    content: string,
    score: string,
    id: string,
    tags: TagM[],
    author: AuthorM,
    viewCount: number,
    commentCount: number
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
    tag: string;
    pageNum: number;
    navDatas: any[];
    height: number;
    isLodingMore: boolean;
    theme: object;
    constructor(P) {
        super(P);
        this.state = {
            data: [],
            tagData: undefined,
            isLogin: false,
            isShowUserCard: false,
            userData: undefined,
            scrollStatus: false
        };
        this.height = Taro.getSystemInfoSync().windowHeight;
        this.tag = '';
        this.pageNum = 1;
        this.isLodingMore = false;
        this.theme = Theme.getThemeJson();
    }

    componentDidMount() {
        this.refresh();
    }

    refresh = () => {
        const isLogin = Auth.isHaveCookie();
        this.setState({ isLogin });
        if (isLogin) {
            const data = Taro.getCurrentInstance();
            this.tag = data.router?.params.tag || '';
            this.getTagDetail();
            this.getData();
        }
    }

    getTagDetail = () => {
        Net.getTagDetail(this.tag).then((resp) => {
            if (resp.code === 0 && resp.data) { 
                const data = resp.data.tag;
                const domains: string[] = data.tagDomains.map((item) => item.domainTitle);
                const tagData: TagDetailM = {
                    title: data.tagTitle,
                    content: data.tagDescription,
                    img: data.tagIconPathWithStyle,
                    id: data.oId,
                    domain: domains.join('/'),
                    viewCount: data.tagViewCount,
                    commentCount: data.tagCommentCount,
                    followerCount: data.tagFollowerCount,
                    referenceCount: data.tagReferenceCount,
                }
                Taro.setNavigationBarTitle({ title: data.tagTitle });
                this.setState({ tagData });
            }
        });
    }

    getData = () => {
        // 'articles' | 'comments' | 'watching-articles' | 'following-users' | 'following-tags' | 'following-articles' | 'followers'
        // if (!this.pageNumDic[this.type]) {
        //     this.pageNumDic[this.type] = 1;
        // }
        Net.getArticleList(Net.Url.Articles.Tag, this.tag, Net.Sort.time, this.pageNum).then((resp) => {
            if (resp.code === 0 && resp.data) {
                let { data } = this.state;
                let lastData = data || []; 
                if (this.pageNum === 1) {
                    lastData = [];
                }
                data = [...lastData, ...resp.data.articles];
                if (this.pageNum >= resp.data.pagination.paginationPageCount) {
                    this.pageNum = resp.data.pagination.paginationPageCount;
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

    getTagDetailNode = (data?: TagDetailM): React.ReactNode => {
    //      viewCount: number,
    // commentCount: number,
    // followerCount: number,
    // referenceCount: number,
        const fontSizeTemp = Config.userConfig.fontSizeMode === 'big' ? 'bi' : Config.userConfig.fontSizeMode;
        if (data) {
            return <View className='tag-view-detail'>
                {data.domain.length > 0 ? (<View className='tag-detail-domain'>{data.domain}</View>) : null}
                <View className='tag-detail-content'>
                    <View className='content'>
                        {data.img.length > 0 ? (<View className='image'><Image src={data.img} /></View>) : null}
                        <View>
                            <View className='title'>{data.title}</View>
                            <parser id={`font-${fontSizeTemp}`} html={data.content} />
                        </View>
                    </View>
                    <View className='foot'>
                        <View>引用•{data.referenceCount}</View>
                        <View>回帖•{data.commentCount}</View>
                        <View>关注•{data.followerCount}</View>
                        <View>浏览•{data.viewCount}</View>
                    </View>
                </View>
            </View>
        }
        return null;
    }

    getCardNode = (datas: ArticleM[]): React.ReactNode => {
        if (datas && datas.length) {
            return <View className='list'>
                {datas.map((item, index) => {
                    const key = `tag-key-${index}`;
                    return <View key={key} className='card'>
                        <View className='at-row at-row__justify--between card-head' onClick={() => this.handleClickCard(item)}>
                            <View className='at-col title'>{item.title}</View>
                            <View className={`at-col at-col-1 at-col--auto score s${item.score}`}>
                                <text className='icon icon-bookmark' />
                            </View>
                        </View>
                        <View className='card-content' onClick={() => this.handleClickCard(item)}>{item.content}</View>
                        <View className='at-row at-row__justify--between card-foot'>
                            <View className='at-row'>
                                {item.tags.map((item2, index2) => {
                                    const key2 = `tag2-key-${index2}`;
                                    const arr = item2.url.split('/');
                                    const tag = arr[arr.length - 1];
                                    if (tag === decodeURI(this.tag) || tag === this.tag) {
                                        return <View />;
                                    } else {
                                        return <Tag theme={this.theme} key={key2} text={item2.title} url={item2.url} />
                                    }
                                })}
                            </View>
                            <View className='at-row at-row__align--center at-row__justify--end card-info'>
                                <View onClick={() => this.setState({ isShowUserCard: true, userData: item.author })}>
                                    <text className='icon icon-user' />
                                    {item.author.name}
                                </View>
                                <View>
                                    <text className='icon icon-eye' />
                                    {item.viewCount}
                                </View>
                            </View>
                        </View>
                    </View>
                })}
            </View>
        }
        return null;
    }

    handleClickCard = (data: ArticleM) => {
        const { id, commentCount } = data;
        Taro.navigateTo({ url: `/pages/article/index?id=${id}&commentCount=${commentCount}` });
    }

    onRefresherRefresh = (): void => {
        this.setState({ scrollStatus: true });
        this.pageNum = 1;
        this.getData();
        this.setState({ scrollStatus: false });
    }

    onScroll = (e): void => {
        const { scrollTop, scrollHeight, deltaY } = e.detail;
        if (scrollHeight - (scrollTop + this.height) < 30 && !this.isLodingMore && deltaY < 0) {
            this.isLodingMore = true;
            this.pageNum++;
            this.getData();
            Log.Info('加载', this.pageNum);
        }
    }
 
 
    render() {
        const theme = Theme.getThemeJson();
        const { data, isLogin, tagData, isShowUserCard, userData, scrollStatus } = this.state;
         // 'articles' | 'comments' | 'watching-articles' | 'following-users' | 'following-tags' | 'following-articles' | 'followers'
        return <FView className='tag-detail' onCloseLogin={this.refresh}>
            <ScrollView
              className='tag-detail-list'
              scrollY
              enableBackToTop
              scrollWithAnimation
              refresherEnabled
              refresherTriggered={scrollStatus}
              refresherBackground={theme["&bgColor"]}
              onRefresherRefresh={this.onRefresherRefresh}
              onScroll={this.onScroll}
            >
                {this.getTagDetailNode(tagData)}
                {this.getCardNode(data || [])}
            </ScrollView>
            <UserCard isOpened={isShowUserCard} onClose={() => this.setState({ isShowUserCard: false })} data={userData} />
        </FView>
    }
}
