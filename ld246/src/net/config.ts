const defaultAPIParm = {
    host: "https://ld246.com/",
    apiPath: "api/v2/",
    page: "p",
    pageSize: "",
    sortType: {
        time: "",
        hot: "hot",
        good: "good",
        reply: "reply",
        perfect: "perfect"
    },
}
// https://ld246.com/api/v2/
const API = `${defaultAPIParm.host}${defaultAPIParm.apiPath}`;
const URL = (url: string):string => (`${API}${url}`)
export default {
    API: {
        Sign: defaultAPIParm.host +  'activity/checkin',
        SortType: defaultAPIParm.sortType,
        User: {
            I: {
                Info: URL('user')
            },
            He: {
                Info: URL('user'),
                InfoWithNum: URL('user/n')
            }
        },
        Auth: {
            Login: URL('login'),
            Logout: URL('logout'),
            Login2: URL('login/2fa'),
            Captcha: 'https://ld246.com/captcha/login'
        },
        Articles: {
            // 获取最新帖子列表
            Latest: URL('articles/latest'),
            // 获取最新领域帖子列表 https://ld246.com/api/v2/articles/domain/Java?p=1
            Domain: URL('articles/domain'),
            // 获取最新标签帖子列表 https://ld246.com/api/v2/articles/tag/Java?p=1
            Tag: URL('articles/tag'),
        },
        Detail: {
            Articles: URL('article')
        },
        Types: {
            Domain: URL('domains'),
            Tag: URL('tags'),
            // https://ld246.com/api/v2/domain/Java
            DomainDetail: URL('domain'),
            // https://ld246.com/api/v2/tag/Java
            TagDetail: URL('tag'),
        },
        Noti: {
            Unread: URL('notifications/unread/count'),
            List: URL('notifications'),
            Mark: URL('notifications/make-read'),
        },
        Comment: {
            SendComment: URL('comment')
        }

    }
}