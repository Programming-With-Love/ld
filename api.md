 链滴 社区客户端 API 文档
  作者:88250 原文链接:https://ld246.com/article/1488603534762 来源网站:链滴
许可协议:署名-相同方式共享 4.0 国际 (CC BY-SA 4.0)

## 概述

该文档主要面向社区客户端开发者，如果你想开发一个移动端 APP 的话请仔细阅读该文档。如 你喜欢写博客，想要将博客和社区进行联动的话请参考[内容 API 开放，欢迎各位独立博客主进行连接](https://ld246.com/article/145715 841475) 。

目前以下列出的 API 已经可用，大家有什么想补充的请跟帖。

## 使用原则

*   欢迎用于 APP、插件、数据分析研究等
*   禁止用于以内容填充为目的应用或站点

## 公共约定

对于请求和响应的一些公共约定在这里统一进行描述。

### HTTP

*   数据使用 UTF-8 编码
*   参数可能是查询字符串也可能是通过 body 传递
*   响应的 Status Code 可能是 `200` 也可能是其他值，客户端需要校验

    *   `401`:需要登录
    *   `403`:权限不足

### User-Agent

不要使用 HTTP 客户端自带的 UA，请**一定要自定义 UA**，推荐格式 <cod >{App}/{Ver}</code>，比如 `Solo/2.9.5`。如果不自定义 UA，请求将会被社区的 量监控系统阻断，并且对发起请求的 IP 进行一定时间的拦截。

### 鉴权

*   服务端使用 HTTP Cookie `symphony` 进行身份验证

### 列表分页

请求:

*   使用查询字符串 `p` 作为当前页号
*   服务端固定页大小为 `20`

响应:

返回 `pagination` 对象，包含两个字段:

*   `paginationPageCount`:分页总页数
*   `paginationPageNums`:以参数 `p` 为中间的窗口页码列表 窗口最大宽度为 15

### 响应结构

响应中的 HTTP body 为 JSON 结构，固定包含 3 个字段:

    <span class="highlight-p">{</span>
    <span class="highlight-s2">"code"</span><span class="highlight-o">:</span> <span cla s="highlight-mi">0</span><span class="highlight-p">,</span>
    <span class="highlight-s2">"msg"</span><span class="highlight-o">:</span> <span cla s="highlight-s2">""</span><span class="highlight-p">,</span>
    <span class="highlight-s2">"data"</span><span class="highlight-o">:</span> <span cla s="highlight-kc">null</span>
    <span class="highlight-p">}</span>
    `</pre>
    原文链接:社区客户端 API 文档
    
    其中:

*   `code`:类型是 int，不会为 null，表示状态码，其值请参考 [StatusCode.java](https:// ink.ld246.com/forward?goto=https%3A%2F%2Fgithub.com%2F88250%2Fsymphony%2Fblo %2Fmaster%2Fsrc%2Fmain%2Fjava%2Forg%2Fb3log%2Fsymphony%2Futil%2FStatusCodes.ja a)

    ## 注意事项

*   使用 HTTPS 协议
*   所有 API 都会做**是否允许非登录请求**的校验，如果返回 `401</co
    e> 则请带上 Cookie
*   请勿频繁调用，每个 IP 每分钟请求数不能超过 120 次，每个 IP 只能建立一个连接

    ## 帖子

    ### 获取最新帖子列表

    GET 方法:

*   按发布时间排序:[https://ld246.c m/api/v2/articles/latest?p=1](https://ld246.com/api/v2/articles/latest?p=1)
*   按热议排序:[https://ld246.c m/api/v2/articles/latest/hot?p=1](https://ld246.com/api/v2/articles/latest/hot?p=1)
*   按好评排序:[https://ld246. om/api/v2/articles/latest/good?p=1](https://ld246.com/api/v2/articles/latest/good?p=1)
*   按最近回帖排序:[https://ld 46.com/api/v2/articles/latest/reply?p=1](https://ld246.com/api/v2/articles/latest/reply?p=1)
*   按优选排序:[https://ld2 6.com/api/v2/articles/latest/perfect?p=1](https://ld246.com/api/v2/articles/latest/perfect?p=1)

    ### 获取领域帖子列表

*   GET 方法:<code>https://ld246.com/api/v2/articles/domain/{domainURI}?p=1`
    /li>
    <li>示例:[https://ld246.com
    api/v2/articles/domain/Java?p=1](https://ld246.com/api/v2/articles/domain/Java?p=1)

    ### 获取标签帖子列表

*   GET 方法:`https://ld246.com/api/v2/articles/tag/{tagURI}?p=1`

    示例:

*   按发布时间排序:[https://ld246 com/api/v2/articles/tag/Java?p=1](https://ld246.com/api/v2/articles/tag/Java?p=1)
*   按热议排序:[https://ld246 com/api/v2/articles/tag/Java/hot?p=1](https://ld246.com/api/v2/articles/tag/Java/hot?p=1)
*   按好评排序:[https://ld 46.com/api/v2/articles/tag/Java/good?p=1](https://ld246.com/api/v2/articles/tag/Java/good?p=1)
*   按优选排序:[https://l 246.com/api/v2/articles/tag/Java/perfect?p=1](https://ld246.com/api/v2/articles/tag/Java/perfect?p=1)

    原文链接:社区客户端 API 文档*   按最近回帖排序:[https:/ ld246.com/api/v2/articles/tag/Java/reply?p=1](https://ld246.com/api/v2/articles/tag/Java/reply?p=1)

    ### 获取帖子详情

*   GET 方法:`https://ld246.com/api/v2/article/{articleId}?p=1`，分页参数 <
    ode>p</code> 是回帖的
*   示例:[https://ld246.c
    m/api/v2/article/1488603534762?p=1](https://ld246.com/api/v2/article/1488603534762?p=1)

    ### 发布帖子

*   POST 方法:`https://ld246.com/api/v2/article`
*   Body: <pre>`<span class="highlight-p"> </span>
    <span class="highlight-s2">"articleTitle"</span><span class="highlight-o">:</span> <sp n class="highlight-s2">""</span><span class="highlight-p">,</span>
    <span class="highlight-s2">"articleTags"</span><span class="highlight-o">:</span> <s an class="highlight-s2">""</span><span class="highlight-p">,</span> <span class="highli ht-c1">// 用英文逗号分隔
    </span><span class="highlight-c1"></span> <span class="highlight-s2">"articleContent" /span><span class="highlight-o">:</span> <span class="highlight-s2">""</span><span cla s="highlight-p">,</span>
    <span class="highlight-s2">"articleRewardContent"</span><span class="highlight-o">:</ pan> <span class="highlight-s2">""</span> <span class="highlight-c1">// 打赏区内容 </span><span class="highlight-c1"></span> <span class="highlight-s2">"articleRewardPo nt"</span><span class="highlight-o">:</span> <span class="highlight-kr">int</span> <sp n class="highlight-c1">// 打赏积分
    </span><span class="highlight-c1"></span><span class="highlight-p">}</span> `</pre>

    ### 获取帖子详情用于更新

*   GET 方法:`https://ld246.com/api/v2/article/update/{articleId}`
*   示例:[https://ld246.
    om/api/v2/article/update/1488603534762](https://ld246.com/api/v2/article/update/1488603534762)

    ### 更新帖子

*   PUT 方法:`https://ld246.com/api/v2/article/{articleId}`
*   Body: <pre>`<span class="highlight-p"> </span>
    <span class="highlight-s2">"articleTitle"</span><span class="highlight-o">:</span> <sp n class="highlight-s2">""</span><span class="highlight-p">,</span>
    <span class="highlight-s2">"articleTags"</span><span class="highlight-o">:</span> <s an class="highlight-s2">""</span><span class="highlight-p">,</span> <span class="highli ht-c1">// 用英文逗号分隔
    </span><span class="highlight-c1"></span> <span class="highlight-s2">"articleContent" /span><span class="highlight-o">:</span> <span class="highlight-s2">""</span><span cla s="highlight-p">,</span>
    <span class="highlight-s2">"articleType"</span><span class="highlight-o">:</span> <s an class="highlight-kr">int</span><span class="highlight-p">,</span> <span class="highli ht-c1">// 帖子类型，按获取帖子后的值传入即可
    </span><span class="highlight-c1"></span> <span class="highlight-s2">"articleRewardC
    原文链接:社区客户端 API 文档
    ntent"</span><span class="highlight-o">:</span> <span class="highlight-s2">""</span> < pan class="highlight-c1">// 打赏区内容
    </span><span class="highlight-c1"></span> <span class="highlight-s2">"articleRewardPo nt"</span><span class="highlight-o">:</span> <span class="highlight-kr">int</span> <sp n class="highlight-c1">// 打赏积分
    </span><span class="highlight-c1"></span><span class="highlight-p">}</span> `</pre>

    ## 回帖

    ### 发布回帖

*   POST 方法:`https://ld246.com/api/v2/comment`
*   Body: <pre>`<span class="highlight-p"> </span>
    <span class="highlight-s2">"articleId"</span><span class="highlight-o">:</span> <span class="highlight-s2">""</span><span class="highlight-p">,</span>
    <span class="highlight-s2">"commentContent"</span><span class="highlight-o">:</spa > <span class="highlight-s2">""</span><span class="highlight-p">,</span>
    <span class="highlight-s2">"commentOriginalCommentId"</span><span class="highligh -o">:</span> <span class="highlight-s2">""</span><span class="highlight-p">,</span> < pan class="highlight-c1">// 可选，如果是回复则传入原回帖 id
    </span><span class="highlight-c1"></span><span class="highlight-p">}</span> `</pre>

    ## 领域

    ### 获取领域列表

*   GET 方法:[https://ld246.com/api/v2/ omains?p=1](https://ld246.com/api/v2/domains?p=1)

    ### 获取领域详情

*   GET 方法:`https://ld246.com/api/v2/domain/{domainURI}`
*   示例:[https://ld246.com/api/v2/doma
    n/Java](https://ld246.com/api/v2/domain/Java)

    ## 标签

    ### 获取标签列表

*   GET 方法:[https://ld246.com/api/v2/tags p=1](https://ld246.com/api/v2/tags?p=1)

    ### 获取标签详情

*   GET 方法:`https://ld246.com/api/v2/tag/{tagURI}`
*   示例:[https://ld246.com/api/v2/tag/Java<
    a>

    ## 用户

    ### 获取当前登录用户详情

*   GET 方法:`https://ld246.com/api/v2/user`
*   示例:<a href="https://ld246.com/api/v2/user">https://ld246.com/api/v2/user](https://ld246.com/api/v2/tag/Java)

    ### 根据用户名获取用户详情

*   GET 方法:`https://ld246.com/api/v2/user/{userName}`
*   示例:[https://ld246.com/api/v2/user/8 250](https://ld246.com/api/v2/user/88250)

    ### 根据用户序号获取用户详情

*   GET 方法:`https://ld246.com/api/v2/user/n/{userNo}`
*   示例:[https://ld246.com/api/v2/user/n/1<
    a>

    ### 获取用户帖子列表

*   GET 方法:`https://ld246.com/api/v2/user/{userName}/articles?p=1`
*   示例:<a href="https://ld246.com/api/v2/user/88250/articles?p=1">https://ld246.com/a i/v2/user/88250/articles?p=1](https://ld246.com/api/v2/user/n/1)

    ### 获取用户回帖列表

*   GET 方法:`https://ld246.com/api/v2/user/{userName}/comments?p=1`</
    i>
    <li>示例:[https://ld246.co
    /api/v2/user/88250/comments?p=1](https://ld246.com/api/v2/user/88250/comments?p=1)

    ### 获取用户近期动态列表

*   GET 方法:`https://ld246.com/api/v2/user/{userName}/events?size=16`</l >
    <li>示例:[https://ld246.co /api/v2/user/88250/events?size=16](https://ld246.com/api/v2/user/88250/events?size=16)

    `size` 为获取条数，最小为 `1`，最大为 `64` 不传该参数则默认为 `16`。

    ### 获取用户关注帖子列表

*   GET 方法:`https://ld246.com/api/v2/user/{userName}/watching/articles?p=1</c de>
*   示例:[https://ld 46.com/api/v2/user/88250/watching/articles?p=1](https://ld246.com/api/v2/user/88250/watching/articles?p=1)

    ### 获取用户关注用户列表

*   GET 方法:<code>https://ld246.com/api/v2/user/{userName}/following/users?p=1</co
    e>
*   示例:[https://ld2
    6.com/api/v2/user/88250/following/users?p=1](https://ld246.com/api/v2/user/88250/following/users?p=1)

    ### 获取用户关注标签列表

*   GET 方法:<code>https://ld246.com/api/v2/user/{userName}/following/tags?p=1</cod >
*   示例:[https://ld246
    原文链接:社区客户端 API 文档
    com/api/v2/user/88250/following/tags?p=1](https://ld246.com/api/v2/user/88250/following/tags?p=1)

    ### 获取用户收藏帖子列表

*   GET 方法:<code>https://ld246.com/api/v2/user/{userName}/following/articles?p=1</c de>
*   示例:[https://ld 46.com/api/v2/user/88250/following/articles?p=1](https://ld246.com/api/v2/user/88250/following/articles?p=1)

    ### 获取用户关注者列表

*   GET 方法:<code>https://ld246.com/api/v2/user/{userName}/followers?p=1`</l
    >
    ><li>示例:[https://ld246.com
    >api/v2/user/88250/followers?p=1](https://ld246.com/api/v2/user/88250/followers?p=1)

    ## 通知

    ### 获取未读消息计数

*   GET 方法:`https://ld246.com/api/v2/notifications/unread/count`
*   示例:[https://ld246.com api/v2/notifications/unread/count](https://ld246.com/api/v2/notifications/unread/count)

    ### 获取收到的回帖消息列表

*   GET 方法:`https://ld246.com/api/v2/notifications/commented?p=1`
*   示例:[https://ld246. om/api/v2/notifications/commented?p=1](https://ld246.com/api/v2/notifications/commented?p=1)

    ### 获取收到的评论消息列表

*   GET 方法:`https://ld246.com/api/v2/notifications/comment2ed?p=1`</l
    >
    ><li>示例:[https://ld246
    >com/api/v2/notifications/comment2ed?p=1](https://ld246.com/api/v2/notifications/comment2ed?p=1)

    ### 获取收到的回复消息列表

*   GET 方法:`https://ld246.com/api/v2/notifications/reply?p=1`
*   示例:[https://ld246.com/ap /v2/notifications/reply?p=1](https://ld246.com/api/v2/notifications/reply?p=1)

    ### 获取提及我的消息列表

*   GET 方法:`https://ld246.com/api/v2/notifications/at?p=1`
*   示例:[https://ld246.com/api/v
    /notifications/at?p=1](https://ld246.com/api/v2/notifications/at?p=1)

    ### 获取我关注的消息列表

*   GET 方法:`https://ld246.com/api/v2/notifications/following?p=1`
*   示例:[https://ld246.co /api/v2/notifications/following?p=1](https://ld246.com/api/v2/notifications/following?p=1)

    ### 获取我的积分消息列表

*   GET 方法:`https://ld246.com/api/v2/notifications/point?p=1`
*   示例:[https://ld246.com/ap /v2/notifications/point?p=1](https://ld246.com/api/v2/notifications/point?p=1)

    ### 获取同城广播消息列表

*   GET 方法:`https://ld246.com/api/v2/notifications/broadcast?p=1`
*   示例:[https://ld246.c
    m/api/v2/notifications/broadcast?p=1](https://ld246.com/api/v2/notifications/broadcast?p=1)

    ### 获取钱包消息列表

*   GET 方法:`https://ld246.com/api/v2/notifications/wallet?p=1`
*   示例:[https://ld246.com/a i/v2/notifications/wallet?p=1](https://ld246.com/api/v2/notifications/wallet?p=1)

    ### 获取系统公告消息列表

*   GET 方法:`https://ld246.com/api/v2/notifications/sys-announce?p=1`</l
    >
    ><li>示例:[https://ld24
    >.com/api/v2/notifications/sys-announce?p=1](https://ld246.com/api/v2/notifications/sys-announce?p=1)

    ### 标记消息列表为已读

*   GET 方法:`https://ld246.com/api/v2/notifications/make-read/{type}`

    其中 `{type}` 是消息类型:

*   `commented`:收到的回帖，包括合并回帖
*   `comment2ed`:收到的评论
*   `reply`:收到的回复
*   `at`:提及我的
*   `following`:我关注的

    同城广播、钱包和系统公告消息拉取后会被自动标记为已读状态，无需调用此 API 进行标记已读 

    ### 通知关联的数据类型说明

    每条获取到的消息都会有 `dataType` 字段，表示与该消息关联的数据类型。</ >
    <details>
    <summary>数据类型说明</summary> <table>
    <thead> <tr>
    <th>dataType</th> <th>dataId</th> <th>备注</th>
    </tr> </thead>
    原文链接:社区客户端 API 文档

    <tbody> <tr>
    <td>-1</td> <td>没有该字段</td> <td>关联数据已被删除</td>
    </tr> <tr>
    <td>0</td> <td></td> <td>暂未使用</td>
    </tr> <tr>
    <td>1</td> <td></td> <td>暂未使用</td>
    </tr> <tr>
    <td>2</td>
    <td>帖子 id 或回帖 id</td>
    <td>此处为设计缺陷，建议用 `dataId` 先查回帖，为空的话再查帖子</td>
    </tr> <tr>
    <td>3</td> <td>回帖 id</td> <td></td>
    </tr> <tr>
    <td>4</td>
    <td>帖子 id</td> <td>关注的用户发新贴</td>
    </tr> <tr>
    <td>5</td>
    <td>积分转账 id</td> <td>转账记录会关联转账类型，目前暂时没有接口查询，下同</td>
    </tr> <tr>
    <td>6</td> <td>积分转账 id</td> <td></td>
    </tr> <tr>
    <td>7</td>
    <td>打赏 id</td> <td>打赏记录会关联打赏类型，目前暂时没有接口查询，下同</td>
    </tr> <tr>
    <td>8</td>
    <td>感谢 id</td> <td>感谢记录会关联感谢类型，目前暂时没有接口查询，下同</td>
    </tr> <tr>
    <td>9</td> <td>帖子 id</td>
    原文链接:社区客户端 API 文档

    <td></td> </tr>
    <tr>
    <td>10</td> <td>积分转账 id</td> <td></td>
    </tr> <tr>
    <td>11</td> <td>积分转账 id</td> <td></td>
    </tr> <tr>
    <td>12</td> <td>感谢 id</td> <td></td>
    </tr> <tr>
    <td>13</td> <td>回复 id</td> <td></td>
    </tr> <tr>
    <td>14</td> <td>用户 id</td> <td></td>
    </tr> <tr>
    <td>15</td> <td>帖子 id</td> <td></td>
    </tr> <tr>
    <td>16</td> <td>帖子 id</td> <td></td>
    </tr> <tr>
    <td>17</td> <td>用户 id</td> <td></td>
    </tr> <tr>
    <td>18</td> <td>用户 id</td> <td></td>
    </tr> <tr>
    <td>19</td>
    <td>老角色 id - 新角色 id</td> <td></td>
    </tr> <tr>
    <td>20</td>
    原文链接:社区客户端 API 文档

    <td>帖子 id</td>
    <td></td> </tr>
    <tr>
    <td>21</td> <td>回帖 id</td> <td></td>
    </tr> <tr>
    <td>22</td> <td>帖子 id</td> <td></td>
    </tr> <tr>
    <td>23</td> <td>帖子 id - <td></td>
    </tr> <tr>
    <td>24</td> <td>帖子 id - <td></td>
    </tr> <tr>
    <td>25</td> <td>回帖 id - <td></td>
    </tr> <tr>
    <td>26</td> <td>回帖 id - <td></td>
    </tr> <tr>
    <td>27</td> <td>帖子 id - <td></td>
    </tr> <tr>
    <td>28</td> <td>帖子 id - <td></td>
    </tr> <tr>
    用户 id</td>
    用户 id</td>
    用户 id</td>
    用户 id</td>
    用户 id</td>
    用户 id</td>
    <td>29</td> <td>货币转账 id</td> <td></td>
    </tr> <tr>
    <td>30</td> <td>货币转账 id</td> <td></td>
    </tr> <tr>
    原文链接:社区客户端 API 文档

    <td>31</td> <td>货币转账 id</td> <td></td>
    </tr> <tr>
    <td>32</td> <td>货币转账 id</td> <td></td>
    </tr> <tr>
    <td>33</td> <td>回帖 id</td> <td></td>
    </tr> <tr>
    <td>34</td>
    <td>回帖 id</td>
    <td>合并后所有的回帖 id 需要通过 `data` 字段获取</td>
    </tr> <tr>
    <td>35</td> <td>回帖 id</td> <td>同 34</td>
    </tr> <tr>
    <td>36</td> <td>积分转账 id</td> <td></td>
    </tr> <tr>
    <td>37</td> <td>聊天会话 id</td> <td></td>
    </tr> <tr>
    <td>38</td>
    <td>评论 id - 用户 id</td> <td></td>
    </tr> <tr>
    <td>39</td> <td>感谢 id</td> <td></td>
    </tr> <tr>
    <td>40</td> <td>评论 id</td> <td></td>
    </tr> <tr>
    <td>41</td> <td>评论 id</td> <td></td>
    </tr>
    原文链接:社区客户端 API 文档

    <tr> <td>42</td> <td>帖子 id</td> <td></td>
    </tr> <tr>
    <td>43</td> <td>帖子 id</td> <td></td>
    </tr> <tr>
    <td>44</td> <td>回帖 id</td> <td></td>
    </tr> <tr>
    <td>45</td> <td>回帖 id</td> <td></td>
    </tr> <tr>
    <td>46</td> <td>评论 id</td> <td></td>
    </tr> <tr>
    <td>47</td> <td>评论 id</td> <td></td>
    </tr> <tr>
    <td>48</td> <td>帖子 id</td> <td></td>
    </tr> <tr>
    <td>49</td> <td>回帖 id</td> <td></td>
    </tr> <tr>
    <td>50</td> <td>评论 id</td> <td></td>
    </tr> <tr>
    <td>51</td> <td>帖子 id</td> <td></td>
    </tr> <tr>
    <td>52</td> <td>回帖 id</td> <td></td>
    原文链接:社区客户端 API 文档

    </tr> <tr>
    <td>53</td> <td>评论 id</td> <td></td>
    </tr> <tr>
    <td>54</td> <td>积分转账 id</td> <td></td>
    </tr> </tbody>
    </table>
    </details>

    ## 榜单

    ### 获取新注册用户列表

*   GET 方法:`https://ld246.com/api/v2/tops/users/newbies`
*   示例:[https://ld246.com/api/v2 tops/users/newbies](https://ld246.com/api/v2/tops/users/newbies)

    ### 获取粉丝榜

*   GET 方法:`https://ld246.com/api/v2/tops/users/followers`
*   示例:[https://ld246.com/api/v
    /tops/users/followers](https://ld246.com/api/v2/tops/users/followers)

    ## 登录

    ### 密码验证

*   <p>POST 方法:`https://ld246.com/api/v2/login`
*   Body:
     <pre>`<span class="hig light-p">{</span>
    <span class="highlight-s2">"userName"</span><span class="highlight-o">:</span> <sp n class="highlight-s2">""</span><span class="highlight-p">,</span> <span class="highligh -c1">// 用户名或者邮箱
    </span><span class="highlight-c1"></span> <span class="highlight-s2">"userPassword" /span><span class="highlight-o">:</span> <span class="highlight-s2">""</span><span cla s="highlight-p">,</span> <span class="highlight-c1">// 使用 MD5 哈希后的值 </span><span class="highlight-c1"></span> <span class="highlight-s2">"captcha"</spa ><span class="highlight-o">:</span> <span class="highlight-s2">""</span> <span class="h ghlight-c1">// 正常登录不用带该字段，登录失败次数过多时必填
    </span><span class="highlight-c1"></span><span class="highlight-p">}</span> `</pre>*   返回:
     <pre>`<span class="highl ght-p">{</span>
    <span class="highlight-s2">"code"</span><span class="highlight-o">:</span> <span cla s="highlight-mi">0</span><span class="highlight-p">,</span> <span class="highlight-c1" // 0 为成功，10 为需要两步验证
    </span><span class="highlight-c1"></span> <span class="highlight-s2">"msg"</span>< pan class="highlight-o">:</span> <span class="highlight-s2">""</span><span class="highl ght-p">,</span>
    <span class="highlight-s2">"token"</span><span class="highlight-o">:</span> <span cl ss="highlight-s2">""</span><span class="highlight-p">,</span> <span class="highlight-c1
    原文链接:社区客户端 API 文档
    >// 成功时才有该值
    </span><span class="highlight-c1"></span> <span class="highlight-s2">"userName"</s an><span class="highlight-o">:</span> <span class="highlight-s2">""</span><span class= highlight-p">,</span> <span class="highlight-c1">// 用户名
    </span><span class="highlight-c1"></span> <span class="highlight-s2">"needCaptcha"< span><span class="highlight-o">:</span> <span class="highlight-s2">""</span> <span cla s="highlight-c1">// 登录失败次数过多会返回该值
    </span><span class="highlight-c1"></span><span class="highlight-p">}</span> `</pre>

    登录成功后会返回 `token`，后续请求需要将该值设置为 Cookie `symp ony` 的值，用于鉴权。如果需要填验证码，则使用 `needCaptcha` 返回的 作为参数 GET 请求一次 `/captcha/login?needCaptcha={needCaptcha}`，返回的 片就是验证码了。

    ### 两步验证

*   POST 方法:`https://ld246.com/api/v2/login/2fa`
*   Cookie:`Cookie: symphony={token}`，请求 Cookie 需要带 `symp ony` 项，值为 login 接口返回的 `token`
*   Body: <pre>`<span class="highlight-p"> </span>
    <span class="highlight-s2">"twofactorAuthCode"</span><span class="highlight-o">:</s an> <span class="highlight-s2">""</span> <span class="highlight-c1">// 身份验证器动态口 验证码，6 位纯数字
    </span><span class="highlight-c1"></span><span class="highlight-p">}</span> `</pre>*   返回: <pre>`<span class="highlight-p">{ /span>
    <span class="highlight-s2">"code"</span><span class="highlight-o">:</span> <span cla s="highlight-mi">0</span><span class="highlight-p">,</span> <span class="highlight-c1" // 0 为成功
    </span><span class="highlight-c1"></span> <span class="highlight-s2">"msg"</span>< pan class="highlight-o">:</span> <span class="highlight-s2">""</span><span class="highl ght-p">,</span>
    <span class="highlight-s2">"token"</span><span class="highlight-o">:</span> <span cl ss="highlight-s2">""</span><span class="highlight-p">,</span> <span class="highlight-c1 >// 成功时才有该值
    </span><span class="highlight-c1"></span> <span class="highlight-s2">"userName"</s an><span class="highlight-o">:</span> <span class="highlight-s2">""</span> <span class "highlight-c1">// 用户名
    </span><span class="highlight-c1"></span><span class="highlight-p">}</span>

## 登出

*   POST 方法:`https://ld246.com/api/v2/logout`

## 系统

### 获取系统当前时间

*   GET 方法:`https://ld246.com/api/v2/system/time`
*   示例:[https://ld246.com/api/v2/syste /time](https://ld246.com/api/v2/system/time)
原文链接:社区客户端 API 文档