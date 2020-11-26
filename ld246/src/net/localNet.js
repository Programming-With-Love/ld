import Taro from '@tarojs/taro';
import cheerio from 'cheerio';

const localNet = async (event, context) => {
    const {
        reqs,
    } = event;

    const analysisComments = (resp) => {
        if (resp.data.data && resp.data.data.article && resp.data.data.article.articleComments) {
            return {
                msg: resp.data.msg,
                random: resp.data.random,
                code: resp.data.code,
                data: {
                    pagination: resp.data.pagination,
                    article: {
                        articleComments: resp.data.data.article.articleComments
                    }
                }
            };
        } else {
            return resp.data
        }
    }

    const analysisArticleList = (r) => {
        const resp = r.data;
        if (resp.code === 0 && resp.data && resp.data.articles && resp.data.articles.length) {
            const articles = resp.data.articles.map((item) => {
                const tags = item.articleTagObjs.map((item2) => {
                    const tm = {
                        title: item2.tagTitle,
                        url: item2.tagURI,
                        img: item2.tagIconPath,
                        id: item2.oId
                    };
                    return tm;
                });
                const authorData = item.articleAuthor;
                const author = {
                    name: authorData.userNickname.length === 0 ? item.articleAuthorName : authorData.userNickname,
                    avatar: authorData.userAvatarURL,
                    dec: authorData.userIntro,
                    img: authorData.userCardBImgURL,
                    url: authorData.userURL,
                    userTags: authorData.userTags,
                    userNo: authorData.userNo,
                    userGeneralRank: authorData.userGeneralRank,
                    userName: authorData.userName,
                    point: authorData.userPoint,
                };
                const m = {
                    title: item.articleTitle,
                    content: item.articlePreviewContent,
                    score: item.articleOriginalIndex,
                    id: item.oId,
                    tags,
                    author,
                    viewCount: item.articleViewCount,
                    commentCount: item.articleCommentCount
                };
                return m;
            });
            return {
                msg: resp.msg,
                random: resp.random,
                code: resp.code,
                data: {
                    pagination: resp.data.pagination,
                    articles
                }
            };
        } else {
            return resp;
        }
    }

    const sign = (url, cookie) => {
        const getSignUrl = (urlTemp) => {
            return new Promise(res => {
                Taro.request({
                    method: 'get',
                    url: urlTemp,
                    headers: {
                        'Upgrade-Insecure-Requests': 1,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
                        'cookie': cookie
                    }
                }).then(response => {
                    const $ = cheerio.load(response.data)
                    let signUrl = '';
                    let tody = '';
                    let sum = '';
                    if ($('.btn.green').get(0) && $('.btn.green').get(0).attribs.href) {
                        signUrl = $('.btn.green').get(0).attribs.href;
                    }
                    if ($('code').get(0) && $('code').get(0).children[0].data) {
                        tody = $('code').get(0).children[0].data;
                    }
                    if ($('.btn').get(0) && $('.btn').get(0).children[0].data) {
                        sum = $('.btn').get(0).children[0].data;
                    }
                    // console.log($('.module__body.ft__center.vditor-reset'))
                    res({
                        code: 0,
                        data: {
                            status: signUrl.length > 0 ? 0 : 2,
                            signUrl,
                            tody,
                            sum,
                        }
                    })
                }).catch(err => {
                    return {
                        url: urlTemp,
                        code: err.response.status || 502,
                        msg: err.response.statusText || 'net bad!',
                        data: null
                    }
                });
            })
        }

        const toSign = (signUrl, referer) => {
            return new Promise(res => {
                Taro.request({
                    method: 'get',
                    url: signUrl,
                    headers: {
                        'Referer': referer,
                        'Upgrade-Insecure-Requests': 1,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
                        'cookie': cookie
                    }
                }).then(response => {
                    const $ = cheerio.load(response.data)
                    let tody = '';
                    let sum = '';
                    if ($('code').get(0) && $('code').get(0).children[0].data) {
                        tody = $('code').get(0).children[0].data;
                    }
                    if ($('.btn').get(0) && $('.btn').get(0).children[0].data) {
                        sum = $('.btn').get(0).children[0].data;
                    }
                    res({
                        code: 0,
                        data: {
                            status: 1,
                            signUrl: '',
                            tody,
                            sum,
                        }
                    })
                }).catch(err => {
                    return {
                        url: referer,
                        code: err.response.status || 502,
                        msg: err.response.statusText || 'net bad!',
                        data: null
                    }
                });
            })
        }
        return new Promise(async (res) => {
            const r = await getSignUrl(url);
            // status  0 没有签到， 1 签到成功 2 已经签到过了
            if (r.code === 0 && r.data.status === 0) {
                const r2 = await toSign(r.data.signUrl, url);
                res(r2)
            } else {
                res(r)
            }
        });
    }

    const req_ = async (r) => {
        // if (r.mode != 'sign') {
        //     const resp = await axios(r);
        //     console.log(resp);
        //     if (resp.data) {
        //         let f = resp.data;
        //         switch (r.mode) {
        //             case 'comments':
        //                 f = analysisComments(resp);
        //                 break;
        //             case 'articleList':
        //                 f = analysisArticleList(resp);
        //                 break;
        //             default:
        //                 f = resp.data;
        //                 break
        //         }
        //         f.url = r.url;
        //         return f;
        //     }
        // } else {
        //     const resp = await sign(r.url, r.headers.cookie);
        //     resp.url = r.url;
        //     return resp;
        // }
        try {
            if (r.mode != 'sign') {
                const resp = await Taro.request(r);
                if (resp.data) {
                    let f = resp.data;
                    switch (r.mode) {
                        case 'comments':
                            f = analysisComments(resp);
                            break;
                        case 'articleList':
                            f = analysisArticleList(resp);
                            break;
                        default:
                            f = resp.data;
                            break
                    }
                    f.url = r.url;
                    return f;
                }
            } else {
                const resp = await sign(r.url, r.headers.cookie);
                resp.url = r.url;
                return resp;
            }
        } catch (err) {
            return {
                url: r.url,
                code: err.status || 502,
                msg: err.statusText || 'net bad!',
                data: null
            }
        }
    }

    const reqs_ = reqs.map((r) => req_(r));
    return Promise.all(reqs_);
}

export default localNet;