import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components'
import { AtFab } from 'taro-ui'
import FView from '../index';
import Comment from '../../components/comment';
import UserCard from '../../components/userCard';
import CommentEdit from '../../components/commentEdit';
import Net from '../../net'
import { Auth, Theme, Log } from '../../tools'

import './index.scss'


interface P { }

interface S {
    isLogin: boolean,
    unread: UnreadM,
    data?: CommentM[],
    isShowUserCard: boolean,
    needShowAuthorData?:AuthorM,
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
    pageNum: number;
    isLodingMore: boolean;
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
        this.isLodingMore = false;
        this.height = Taro.getSystemInfoSync().windowHeight;
        this.urlParm = {
            id: '',
            commentCount: ''
        };
        this.pageNum = 1;
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
                commentCount: data.router?.params.commentCount || ''
            };

            if (this.urlParm.id.length && this.urlParm.commentCount.length) {
                this.getComments();
            }

            // this.getUnreadNoti();
            // Taro.
        }
    }

    getNextPageComments = async () => {
        this.isLodingMore = true;
        this.pageNum++;
        const resp1 = await Net.getArticleComments(this.urlParm.id, parseInt(this.urlParm.commentCount, 10), this.pageNum);
        this.isLodingMore = false;
        const { data } = this.state;
        let comments: CommentM[] = data || [];
        if (resp1.code === 0) {
            const item = resp1.data.article;
            const commentsTemp: CommentM[] = item.articleComments.map((item2) => {
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
                    point: authorData2.userPoint
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
            comments = [...comments, ...commentsTemp.reverse()];
        } else {
            this.pageNum--;
        }
        this.setState({ data: comments });
    }

    getComments = async ():Promise<void> => {
        this.pageNum = 1;
     const resp1 = await Net.getArticleComments(this.urlParm.id, parseInt(this.urlParm.commentCount, 10), this.pageNum);
        let comments: CommentM[] = []
        if (resp1.code === 0) {
            const item = resp1.data.article;
            const commentsTemp: CommentM[] = item.articleComments.map((item2) => {
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
            comments = [...comments, ...commentsTemp.reverse()];
        }
        if (comments.length < 20) {
            this.pageNum ++;
            const resp2 = await Net.getArticleComments(this.urlParm.id, parseInt(this.urlParm.commentCount, 10), this.pageNum);
            if (resp2.code === 0) {
                const item = resp2.data.article;
                const commentsTemp: CommentM[] = item.articleComments.map((item2) => {
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
                comments = [...comments, ...commentsTemp.reverse()];
            } else {
                this.pageNum--;
            }
        }
        this.setState({ data: comments });
    }

    getUnreadNoti = ():void => {
        Net.getUnreadNoti({ showLoading: false }).then((unread) => {
            this.setState({ unread });
        });
    }

    onScroll = (e): void => {
        const { scrollTop, scrollHeight, deltaY } = e.detail;        
        if (scrollHeight - (scrollTop + this.height) < 30 && !this.isLodingMore && deltaY < 0) {
            this.getNextPageComments();
            Log.Info('加载更多评论');
        }
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
                this.getComments();
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
        const { unread, isLogin, data, isShowUserCard, needShowAuthorData, isShowEdit, editValue, placeholder } = this.state;
        const theme = Theme.getThemeJson();
        return (
            <FView className='comments-page' unread={unread} onCloseLogin={this.refresh} >
                <AtFab className='rComment' size='small' onClick={() => { this.rCommentID = ''; this.setState({ isShowEdit: true, placeholder: '请输入回帖内容' }); }}>
                    <text className='icon icon-quill' />
                </AtFab>
                <View className='comment-page-view'>
                    <Comment
                      data={data || []}
                      theme={theme}
                      onClickAuthor={(e) => this.setState({ isShowUserCard: true, needShowAuthorData: e })}
                      onScroll={this.onScroll}
                      onRefresherRefresh={() => {
                            this.getComments();
                        }}
                      refresherEnabled
                      onComment={(id, name) => {
                            this.rCommentID = id;
                            this.setState({ isShowEdit: true, placeholder: `回帖 ${name}` })
                        }}
                    />
                </View>
                <UserCard isOpened={isShowUserCard} onClose={() => this.setState({ isShowUserCard: false })} data={needShowAuthorData}  />
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
