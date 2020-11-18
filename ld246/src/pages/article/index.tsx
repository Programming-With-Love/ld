import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import '@tarojs/taro/html.css'
import { View, Text } from '@tarojs/components'
import { AtFab } from 'taro-ui'
import FView from '../index';
import Tag from '../../components/tag';
import Comment from '../../components/comment';
import UserCard from '../../components/userCard';
import CommentEdit from '../../components/commentEdit';
import Net from '../../net'
import { Auth, Theme, Log, Config } from '../../tools'

import './index.scss'


interface P { }

interface S {
    isLogin: boolean,
    unread: UnreadM,
    data?: ArticleM,
    isShowUserCard: boolean,
    needShowAuthorData?: AuthorM,
    isShowEdit: boolean,
    editValue: string,
    placeholder: string
}

interface UnreadM {
    type: string,
    count: number
}

interface ArticleM {
    title: string,
    content: string,
    score: string,
    id: string,
    tags: TagM[],
    author: AuthorM,
    viewCount: number,
    lastTime: string,
    comments: CommentM[]
}

interface CommentM {
    author: AuthorM,
    content: string,
    lastTime: string,
    Id: string,
    originalCommentId: string
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
    userGeneralRank: number,
    point: number
}

interface UrlParmM {
    id: string,
    commentCount: string
}

export default class Index extends Component<P, S> {
    height: number;
    urlParm: UrlParmM;
    rCommentID: string;
    constructor(P) {
        super(P);
        this.state = {
            unread: { count: 0, type: ''},
            isLogin: false,
            data: undefined,
            isShowUserCard: false,
            needShowAuthorData: undefined,
            isShowEdit: false,
            editValue: '',
            placeholder: '请输入回帖内容'
        };
        this.height = Taro.getSystemInfoSync().windowHeight;
        this.urlParm = {
            id: '',
            commentCount: '-1'
        };
        this.rCommentID = '';
    }

    componentDidMount() {
        this.refresh();
    }

    refresh = () => {
        const isLogin = Auth.isHaveCookie();
        this.setState({ isLogin });
        if (isLogin) {

            const data = Taro.getCurrentInstance();
            this.urlParm = {
                id: data.router?.params.id || '',
                commentCount: data.router?.params.commentCount || '-1'
            };

            if (this.urlParm.id.length && this.urlParm.commentCount.length) {
                this.getArticleDetail();
            }

            // this.getUnreadNoti();
            // Taro.
        }
    }

    getArticleDetail = (): void => {
        const commentCount = parseInt(this.urlParm.commentCount, 10);
        Net.getArticleDetail(this.urlParm.id, commentCount < 0 ? 1 : commentCount).then(async (resp) => {
            if (resp.code === 0) {
                const item = resp.data.article;
                const tags: TagM[] = item.articleTagObjs.map((item2, index2) => {
                    const tm: TagM = {
                        title: item2.tagTitle,
                        url: item2.tagURI,
                        img: item2.tagIconPath,
                        id: item2.oId
                    };
                    return tm;
                });
                const authorData = item.articleAuthor;
                const author: AuthorM = {
                    name: authorData.userNickname.length === 0 ? item.articleAuthorName : authorData.userNickname,
                    avatar: item.articleAuthorThumbnailURL48,
                    dec: authorData.userIntro,
                    img: authorData.userCardBImgURL,
                    url: authorData.userURL,
                    userTags: authorData.userTags,
                    userNo: authorData.userNo,
                    userGeneralRank: authorData.userGeneralRank,
                    userName: authorData.userName,
                    point: authorData.userPoint
                };
                let comments: CommentM[] = [];
                if (commentCount >= 0 || resp.data.pagination.paginationPageCount <= 1) {
                    comments = item.articleComments.map((item2) => {
                        const authorData2 = item2.commenter;
                        const author2: AuthorM = {
                            name: authorData2.userNickname.length === 0 ? authorData2.userName : authorData2.userNickname,
                            avatar: item2.commentAuthorThumbnailURL,
                            dec: authorData2.userIntro,
                            img: authorData2.userCardBImgURL,
                            url: authorData2.userURL,
                            userTags: authorData2.userTags,
                            userNo: authorData2.userNo,
                            userGeneralRank: authorData2.userGeneralRank,
                            userName: authorData2.userName,
                            point: authorData.userPoint
                        };
                        const m: CommentM = {
                            author: author2,
                            content: item2.commentContent,
                            lastTime: item2.timeAgo,
                            Id: item2.oId,
                            originalCommentId: item2.commentOriginalCommentId
                        };
                        return m
                    });
                } else {
                    this.urlParm.commentCount = `${item.articleCommentCount}`;
                    const resp1 = await Net.getArticleComments(this.urlParm.id, item.articleCommentCount, 1);
                    if (resp1.code === 0) {
                        const item1 = resp1.data.article;
                        const commentsTemp: CommentM[] = item1.articleComments.map((item2) => {
                            const authorData2 = item2.commenter;
                            const author2: AuthorM = {
                                name: authorData2.userNickname.length === 0 ? authorData2.userName : authorData2.userNickname,
                                avatar: item2.commentAuthorThumbnailURL,
                                dec: authorData2.userIntro,
                                img: authorData2.userCardBImgURL,
                                url: authorData2.userURL,
                                userTags: authorData2.userTags,
                                userNo: authorData2.userNo,
                                userGeneralRank: authorData2.userGeneralRank,
                                userName: authorData2.userName
                            };
                            const m: CommentM = {
                                author: author2,
                                content: item2.commentContent,
                                lastTime: item2.timeAgo,
                                Id: item2.oId,
                                originalCommentId: item2.commentOriginalCommentId
                            };
                            return m
                        });
                        comments = commentsTemp;
                    }
                }
                const m: ArticleM = {
                    title: item.articleTitle,
                    content: item.articleContent,
                    score: item.articleOriginalIndex,
                    id: item.oId,
                    tags,
                    author,
                    viewCount: item.articleViewCount,
                    lastTime: item.articleUpdateTimeStr,
                    comments: comments.reverse()
                    // commentCount: item.articleCommentCount
                };
                this.setState({ data: m });
            }
        });
    }

    getUnreadNoti = (): void => {
        Net.getUnreadNoti({ showLoading: false }).then((unread) => {
            this.setState({ unread });
        });
    }

    editChange = (e) => {
        this.setState({ editValue: e });
    }

    sendComment = () => {
        this.setState({ isShowEdit: false });
        const { editValue } = this.state;
        if (editValue.length === 0) { this.toast('请输入内容'); return; }
        Net.sendComment(editValue, this.urlParm.id, this.rCommentID).then((resp) => {
            if (resp.code === 0) {
                this.toast('回帖成功');
                this.getArticleDetail();
                this.setState({ editValue: '' });
            } else {
                this.toast('回帖失败');
            }
        });
    }

    toast = (info: string): void => {
        Taro.showToast({ title: info, icon: 'none' });
    }


    render() {
        const { unread, isShowEdit, data, isShowUserCard, needShowAuthorData, editValue, isLogin, placeholder } = this.state;
        const theme = Theme.getThemeJson();
        const fontSizeTemp = Config.userConfig.fontSizeMode === 'big' ? 'bi' : Config.userConfig.fontSizeMode;
        return (
            <FView className='article' unread={unread} onCloseLogin={this.refresh} >
                <AtFab className='rComment' size='small' onClick={() => { this.rCommentID = ''; this.setState({ isShowEdit: true, placeholder: '请输入回帖内容' }); }}>
                    <text className='icon icon-quill' />
                </AtFab>
                <View className='head'>
                    <View>{data?.title}</View>
                    <View className='author' onClick={() => this.setState({ isShowUserCard: true, needShowAuthorData: data?.author })}>
                        <text className='icon icon-user' />
                        {data?.author.name}
                    </View>
                    <View><text className='icon icon-clock' />{data?.lastTime}</View>
                </View>
                <View className='content'>
                    <parser id={`font-${fontSizeTemp}`} html={data?.content} />
                </View>
                <View className='tags at-row'>
                    {data?.tags.map((item2, index2) => {
                        const key2 = `tag2-key-${index2}`;
                        return <Tag theme={theme} key={key2} text={item2.title} url={item2.url} />
                    })}
                </View>
                {data && data.comments?.length > 0 ? (
                    <View className='comment-bottom'>
                        <Comment
                          data={data.comments}
                          theme={theme}
                          onClickAuthor={(e) => this.setState({ isShowUserCard: true, needShowAuthorData: e })}
                          onComment={(id, name) => {
                                this.rCommentID = id;
                                this.setState({ isShowEdit: true, placeholder: `回帖 ${name}` })
                            }}
                        />
                        {Number(this.urlParm.commentCount) > 20 ? (
                            <View className='comment-more' onClick={() => {
                                Taro.navigateTo({ url: `/pages/comments/index?id=${this.urlParm.id}&commentCount=${this.urlParm.commentCount}` });
                            }}
                            >MORE</View>
                        ) : ''}
                    </View>
                ) : ''}
                <UserCard isOpened={isShowUserCard} onClose={() => this.setState({ isShowUserCard: false })} data={needShowAuthorData} />
                <CommentEdit
                  isOpened={isShowEdit}
                  value={editValue}
                  onChange={this.editChange}
                  onClose={() => this.setState({ isShowEdit: false })}
                  placeholder={placeholder}
                  onOK={this.sendComment}
                />
            </FView>
        )
    }
}
