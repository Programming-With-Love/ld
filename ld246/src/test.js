
const axios = require('axios');
const cheerio = require('cheerio');
// request({
//     url: "https://ld246.com/api/v2/login",
//     method: "POST",
//     data: JSON.stringify({
//         "userName": "goldhan",
//         "userPassword": "",
//         "captcha": "axgn"
//     }),
//     headers: {
//         "user-agent": "ldH5/0.0.1",
//     }
// }, function (error, response, body) {
//         console.log(error, body);
//     // if (!error && response.statusCode == 200) {
//     //     res.set('Content-Type', 'image/png;');
//     //     console.log("body", body);
//     //     res.send(body);
//     // }
// })




const sign = (url, cookie) => {
  const getSignUrl = (urlTemp) => {
    return new Promise(res => {
      axios({
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
      axios({
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
const url = 'https://ld246.com/activity/checkin';
const cookie = '';
sign(url,cookie).then(r => {
  console.log(r);
});

