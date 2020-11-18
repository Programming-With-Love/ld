import Taro from '@tarojs/taro';
import { Log, Auth, Common, Storage, Config } from '../tools';
import C from './config';

let instance: Net;
interface result {
    url?: string,
    code?: number,
    msg?: string,
    data?: any
}
interface NetConfigM {
    showError?: boolean, showLoading?: boolean
}
interface NowReqStatusM {
    status: number,
    time: number
}

interface ReqM {
    url: string,
    param?: object,
    method?: string,
    mode?: string
}
class Net {
    Url = C.API
    Sort = C.API.SortType
    NowReqDic: { [key: string]: NowReqStatusM; };
    reqInterval = 3 * 1000 // 请求间隔
    reLogin: { [key: string]: () => void; };
    closeLogin: { [key: string]: () => void; };
    constructor() {
        Taro.cloud.init({
            env: 'ld-6gqlql2i1d286f17'
        });
        this.NowReqDic = {};
        this.reLogin = {};
        this.closeLogin = {};
        Log.Info("Init Net");
    }

    static Instance = (): Net => {
        if (instance) return instance;
        instance = new Net();
        return instance;
    }

    getReqsKey = (reqs: ReqM[]): string => {
        let s = '';
        reqs.forEach(item => {
            s += item.url;
        });
        return Common.encodeMd5(s);
    }

    reqs = (reqs: ReqM[], config: NetConfigM = { showError: false, showLoading: true },): any => {
        const time = new Date().getTime();
        const key = this.getReqsKey(reqs);
        if (this.NowReqDic[key]) {
            const interval = time - this.NowReqDic[key].time;
            if (interval < this.reqInterval) {
                if (this.NowReqDic[key].status === 0) {
                    Taro.atMessage({
                        message: '不要频繁刷新，要不然你懂得',
                        type: 'info'
                    })
                } else {
                    Taro.atMessage({
                        message: '已经在努力加载了，少安勿躁',
                        type: 'warning'
                    })
                }
                return new Promise((resolve, reject) => {
                    resolve({ code: -1 });
                });
            }
            if (Object.keys(this.NowReqDic).length > 20) { // 清理
                const NowReq = this.NowReqDic[key];
                this.NowReqDic = {};
                this.NowReqDic[key] = NowReq;
            }
        }
        this.NowReqDic[key] = { status: 1, time };
        if (config.showLoading) {
            Taro.showLoading({
                title: '请稍等...',
            });
        }
        let urls = '';
        interface temp {
            [propName: string]: any
        }
        const reqs_: temp[] = [];
        let cookie = Auth.getCookie();
        const headers = {
            // "Content-Type": "application/json; charset=utf-8",
            "user-agent": 'ldH5/0.0.1',
        };
        if (cookie.length > 0) {
            // cookie = `symphony=${cookie}`
            headers["cookie"] = cookie;
        }
        reqs.forEach((item) => {
            urls += item.url + '\n';
            reqs_.push({
                url: item.url,
                param: item.param || '',
                method: item.method || 'get',
                mode: item.mode,
                timeout: 60 * 1000,
                headers: headers,
            })
        });
        return new Promise((resolve, reject) => {
            Log.Web(urls, 0);
            Taro.cloud.callFunction({
                // 云函数名称
                name: 'gkRequest',
                data: {
                    reqs: reqs_
                }
            }).then((res) => {
                this.NowReqDic[key] = { status: 0, time };
                const { result } = res;
                const r = result as result[];
                Log.Web(urls, 1, r);
                r.forEach((item) => {
                    if (item.code != 0) {
                        Log.Web(item.url, 2, item);
                    }
                });
                resolve(r);
                Taro.hideLoading();
            }).catch((error) => {
                Taro.hideLoading();
                this.NowReqDic[key] = { status: 0, time };
                Log.Web('Taro.cloud gkRequest:' + urls, 2, error);
                if (config.showError && error) {
                    Taro.showToast({ title: 'cloud gkRequest fail', icon: 'none' });
                }
                reject(error);
            });
        }).catch(() => {
            this.NowReqDic[key] = { status: 0, time };
        });
        // .finally(() => {
        //     Taro.hideLoading();
        // });
    }


    req = (url: string, param: any, method = 'get', config: NetConfigM = { showError: false, showLoading: true }, mode = '', needParm?: object): any => {
        const time = new Date().getTime();
        if (this.NowReqDic[url]) {
            const interval = time - this.NowReqDic[url].time;
            if (interval < this.reqInterval) {
                if (this.NowReqDic[url].status === 0) {
                    Taro.atMessage({
                        message: '不要频繁刷新，要不然你懂得',
                        type: 'info'
                    })
                } else {
                    Taro.atMessage({
                        message: '已经在努力加载了，少安勿躁',
                        type: 'warning'
                    })
                }
                return new Promise((resolve, reject) => {
                    resolve({ code: -1 });
                });
            }
            if (Object.keys(this.NowReqDic).length > 20) { // 清理
                const NowReq = this.NowReqDic[url];
                this.NowReqDic = {};
                this.NowReqDic[url] = NowReq;
            }
        }
        this.NowReqDic[url] = { status: 1, time };
        if (config.showLoading) {
            Taro.showLoading({
                title: '请稍等...',
            });
        }
        return new Promise((resolve, reject) => {
            Log.Web(url, 0);
            let cookie = Auth.getCookie();
            const headers = {
                // "Content-Type": "application/json; charset=utf-8",
                "user-agent": 'ldH5/0.0.1',
            };
            if (cookie.length > 0) {
                // cookie = `symphony=${cookie}`
                headers["cookie"] = cookie;
            }
            Taro.cloud.callFunction({
                // 云函数名称
                name: 'gkRequest',
                data: {
                    reqs: [{
                        method,
                        url,
                        data: param,
                        timeout: 60 * 1000,
                        headers: headers,
                        mode,
                        needParm,
                    }]
                }
            }).then((res) => {
                this.NowReqDic[url] = { status: 0, time };
                const { result } = res;
                const [r] = result as result[];
                if (result && r.code === 0) {
                    Log.Web(url, 1, param, r);
                } else {
                    Taro.showToast({ title: `${r.code} | ${r.msg}`, icon: 'none' });
                    if (r.code === 401) {
                        Auth.setCookie('');
                        if (this.reLogin) {
                            for (const key in this.reLogin) {
                                if (Object.prototype.hasOwnProperty.call(this.reLogin, key)) {
                                    const element = this.reLogin[key];
                                    if (element) element();
                                }
                            }
                        }
                    }
                    Log.Web(url, 2, param, res);
                }
                resolve(r);
                Taro.hideLoading();
            }).catch((error) => {
                Taro.hideLoading();
                this.NowReqDic[url] = { status: 0, time };
                Log.Web('Taro.cloud gkRequest:' + url, 2, error);
                if (config.showError && error) {
                    Taro.showToast({ title: 'cloud gkRequest fail', icon: 'none' });
                }
                reject(error);
            });
        }).catch(() => {
            this.NowReqDic[url] = { status: 0, time };
        });
        // .finally(() => {
        //     Taro.hideLoading();
        // });
    }

    getArticleList = (url: string = this.Url.Articles.Latest, Keywords: string = '', sort: string = this.Sort.time, pageNum: number = 1, pageSize: number = 20, config?: NetConfigM): any => {
        let urlTemp = url;
        if (Keywords.length) {
            urlTemp += `/${Keywords}`;
        }
        if (sort.length) {
            urlTemp += `/${sort}`;
        }
        urlTemp += `?p=${pageNum}`;
        // urlTemp = 'http://musicapi.leanapp.cn/search?keywords=%E5%8E%9F%E7%A5%9E'
        return this.req(urlTemp, {}, 'get', config, 'articleList').then(resp => {
            if (pageNum >= resp.data.pagination.paginationPageCount) {
                Taro.atMessage({
                    message: '已经全部加载',
                })
            }
            return resp;
        });
    }
    UserDetailListType: 'articles' | 'comments' | 'watching-articles' | 'following-users' | 'following-tags' | 'following-articles' | 'followers'
    getUserDetailList = (userName: string, type: string = this.UserDetailListType, pageNum: number = 1, pageSize: number = 20, config?: NetConfigM): any => {
        let urlTemp = this.Url.User.He.Info;
        urlTemp += `/${userName}`;
        const parm = type.replace(/-/g, '/');
        urlTemp += `/${parm}`;
        urlTemp += `?p=${pageNum}`;
        // urlTemp = 'http://musicapi.leanapp.cn/search?keywords=%E5%8E%9F%E7%A5%9E'
        let mode;
        switch (type) {
            case 'articles':
            case 'watching-articles':
            case 'following-articles':
                mode = 'articleList'
                break;
            default:
                mode = undefined;
                break;
        }

        return this.req(urlTemp, {}, 'get', config, mode).then(resp => {
            if (pageNum >= resp.data.pagination.paginationPageCount) {
                let message = '已经全部加载';
                if (resp.data.pagination.paginationPageCount === 0) {
                    message = '暂无数据';
                }
                Taro.atMessage({
                    message,
                })
            }
            return resp;
        });
    }

    NotificationsType: 'commented' | 'comment2ed' | 'reply' | 'at' | 'following' | 'point' | 'broadcast' | 'wallet' | 'sys-announce'
    getNotificationsList = (type: string = this.NotificationsType, pageNum: number = 1, pageSize: number = 20, config?: NetConfigM): any => {
        let urlTemp = this.Url.Noti.List;
        urlTemp += `/${type}`;
        urlTemp += `?p=${pageNum}`;

        return this.req(urlTemp, {}, 'get', config).then(resp => {
            if (pageNum >= resp.data.pagination.paginationPageCount) {
                let message = '已经全部加载';
                if (resp.data.pagination.paginationPageCount === 0) {
                    message = '暂无数据';
                }
                Taro.atMessage({
                    message,
                })
            }
            return resp;
        });
    }

    getTagDetail = (tag: string, config?: NetConfigM): any => {
        let urlTemp = this.Url.Types.TagDetail;
        urlTemp += `/${tag}`;
        return this.req(urlTemp, {}, 'get', config);
    }

    markUnread = (type: string = this.NotificationsType): any => {
        let urlTemp = this.Url.Noti.Mark;
        urlTemp += `/${type}`;
        return this.req(urlTemp, {}, 'get');
    }


    getTypes = (url = this.Url.Types.Domain, config?: NetConfigM): any => {
        return this.req(url, {}, 'get', config);
    }

    getTypeDetail = (url = this.Url.Types.Domain, parm: string): any => {
        const urlTemp = url + `/${parm}`;
        return this.req(urlTemp, {});
    }

    getArticleDetail = (id: string, commentCount: number): any => {
        let p = commentCount % 20 === 0 ? commentCount / 20 : commentCount / 20 + 1;
        p = p === 0 ? 1 : p;
        p = parseInt(`${p}`, 10);
        return this.req(`${this.Url.Detail.Articles}/${id}?p=${p}`, {}, 'get');
    }

    getArticleComments = (id: string, commentCount: number, pageNum = 1): any => {
        let p = commentCount % 20 === 0 ? commentCount / 20 : commentCount / 20 + 1;
        p = p === 0 ? 1 : p;
        p = parseInt(`${p}`, 10);
        const sum = p + 1;
        p = sum - pageNum;
        if (p <= 0) {
            return new Promise((resolve, reject) => {
                Taro.atMessage({
                    message: '已经全部加载',
                })
                resolve({ code: -1 });
            });
        }
        return this.req(`${this.Url.Detail.Articles}/${id}?p=${p}`, {}, 'get', { showError: false, showLoading: true }, 'comments');
    }

    sendComment = (content, articleId, rID = '') => {
        const temp = `<p>${content}<br/><a href="https://github.com/goldhan/ld" style="text-align: end;">来自链滴小程序（非官方）</a></p>`
        return this.req(this.Url.Comment.SendComment, {
            articleId: articleId,
            commentContent: temp,
            commentOriginalCommentId: rID
        }, 'POST');
    }

    getDomainsDetail = (codes: string[]): any => {
        const host = this.Url.Types.DomainDetail;
        const reqs: ReqM[] = codes.map((item) => {
            return {
                url: host + '/' + item
            }
        });
        return this.reqs(reqs);
    }

    getUserDetail = (name?: string): any => {
        let url = this.Url.User.He.Info;
        if (name && name.length > 0) {
            url += '/' + name;
        }
        return this.req(url, {});
    }

    getUserEvent = (name: string): any => {
        const url = this.Url.User.He.Info + '/' + name + '/events';
        return this.req(url, {});
    }

    sign = ():any => {
        return this.req(this.Url.Sign, {}, 'get', undefined, 'sign').then((resp) => {
            if (resp.code === 0) {
                const status = resp.data.status;
                if (status === 1) {
                    Taro.showToast({ title: `签到成功 | ${resp.data.tody}积分`, icon: 'none' });
                }
                if (status === 2) {
                    Taro.showToast({ title: `已经签到过了 | 总积分${resp.data.sum}`, icon: 'none' });
                }
                if (status === 1 || status === 2) {
                    Config.userConfig.signDate = Common.nowDate();
                    Config.updateConfig();
                }
            }
        });
    }

    getUnreadNoti = (config?: NetConfigM): any => {
        return this.req(this.Url.Noti.Unread, config).then((resp) => {
            let index: number = 0
            let type = '';
            // NotificationsType: 'commented' | 'comment2ed' | 'reply' | 'at' | 'following' | 'point' | 'broadcast' | 'wallet' | 'sys-announce'
            if (resp.code === 0) {
                index = resp.data['unreadNotificationCnt'] as number;
                for (const key in resp.data) {
                    if (Object.prototype.hasOwnProperty.call(resp.data, key)) {
                        const element = resp.data[key] as number;
                        if (element > 0) {
                            switch (key) {
                                case 'unreadAtNotificationCnt':
                                    type = 'at';
                                    break;
                                case 'unreadBroadcastNotificationCnt':
                                    type = 'broadcast';
                                    break;
                                case 'unreadChatNotificationCnt':
                                    // type = '';
                                    break;
                                case 'unreadComment2edNotificationCnt':
                                    type = 'comment2ed';
                                    break;
                                case 'unreadCommentedNotificationCnt':
                                    type = 'commented';
                                    break;
                                case 'unreadFollowingNotificationCnt':
                                    type = 'following';
                                    break;
                                case 'unreadNewFollowerNotificationCnt':
                                    type = 'following';
                                    break;
                                case 'unreadNotificationCnt':
                                    // type = '';
                                    break;
                                case 'unreadPointNotificationCnt':
                                    type = 'point';
                                    break;
                                case 'unreadReplyNotificationCnt':
                                    type = 'reply';
                                    break;
                                case 'unreadReviewNotificationCnt':
                                    // type = '';
                                    break;
                                case 'unreadSysAnnounceNotificationCnt':
                                    type = 'sys-announce';
                                    break;
                                case 'unreadWalletNotificationCnt':
                                    type = 'wallet';
                                    break;
                                default:
                                    // type = '';
                                    break;
                            }
                        }
                        
                    }
                }
            }
            return { count: index, type };
        }).catch(() => {
            return { count: 0, type: '' };
        });
    }

    reqLocal = (url: string, param: object, method, config: NetConfigM = { showError: false, showLoading: true }): any => {
        if (config.showLoading) {
            Taro.showLoading({
                title: '请稍等...',
            });
        }
        return new Promise((resolve, reject) => {
            Log.Web(url, 0);
            let cookie = Auth.getCookie();
            const headers = {
                // "Content-Type": "application/json; charset=utf-8",
                // "user-agent": 'ldH5/0.0.1',
            };
            if (cookie.length > 0) {
                headers["cookie"] = cookie;
            }
            Taro.request({
                method: method || 'GET',
                url,
                data: param,
                timeout: 60 * 1000,
                header: headers
            }).then((res) => {
                Taro.hideLoading();
                Log.Info(res);
                resolve(res.data);
                // const { result } = res;
                // const r = result as result;
                // if (r.error) {
                //     Taro.showToast({ title: r.error.code, icon: 'none' });
                // } else {
                //     const body = JSON.parse(r.body);
                //     if (body.code != 0 && body.msg.length != 0) {
                //         Taro.showToast({ title: body.msg, icon: 'none' });
                //     }
                //     Log.Web(url, 1, param, body);
                //     resolve(body);
                // }
            }).catch((error) => {
                Taro.hideLoading();
                Log.Web(url, 2, param, error);
                // if (config.showError && error) {
                //     Taro.showToast({ title: error.message, icon: 'none' });
                // }
                // reject(error);
            });
        }).finally(() => {
            Taro.hideLoading();
        });
    }
}

export default Net.Instance()