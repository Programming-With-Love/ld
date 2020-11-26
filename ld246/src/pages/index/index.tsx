import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components'
import { AtTabs, AtTabsPane, AtFab } from 'taro-ui'
import FView from '../index';
import Tag from '../../components/tag';
import Menu from '../../components/menu';
import UserCard from '../../components/userCard';
import Net from '../../net'
import { Auth, Theme, Log, Storage, Config, Common } from '../../tools'

import './index.scss'

interface P { }

interface S {
  nowTabsIndex: number,
  navDatas: NavDatas[],
  // tagDic: object,
  listDic: object,
  isLogin: boolean,
  scrollStatus: boolean,
  unread: UnreadM,
  isShowUserCard: boolean,
  userData?: AuthorM
}

interface UnreadM {
  type: string,
  count: number
}

interface TagM {
  title: string,
  url: string,
  img: string,
  id: string,
}

interface NavDatas {
  id: string,
  code: string,
  title: string,
  // content: string,
  // time: string,
  // tags: Tag[]

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

export default class Index extends Component<P, S> {
  pageNumDic: object;
  height: number;
  isLodingMore: boolean;
  theme: object;
  constructor(P) {
    super(P);
    let navDatas: NavDatas[] = [{ id: '000', title: '最新', code: '' }];
    const data = Storage.getData(Config.StorageDataKey.NavDatas);
    if (data.data && data.data.length) {
      navDatas = data.data;
    }
    this.state = {
      isLogin: false,
      nowTabsIndex: 0,
      navDatas,
      // tagDic: {},
      listDic: {},
      scrollStatus: false,
      unread: { count: 0, type: '' },
      isShowUserCard: false,
      userData: undefined
    };
    this.pageNumDic = { '最新': 1 };
    this.height = Taro.getSystemInfoSync().windowHeight;
    this.isLodingMore = false;
    this.theme = Theme.getThemeJson();
    // this.getUnreadNoti = Common.debounce(this.getUnreadNoti, 5000);
  }

  componentDidShow() {
    if (Common.temp['isNotiBack']) {
      Common.temp['isNotiBack'] = false;
      this.getUnreadNoti();
    }
  }

  componentDidMount() {
    this.refresh();
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      Taro.onAppHide(() => {
        this.getUnreadNoti();
      });
    }
  }

  refresh = ():void => {
    const isLogin = Auth.isHaveCookie();
    if (isLogin) {
      this.getTypes((datas) => {
        this.setState({ navDatas: datas, isLogin }, async () => {
          await this.getArticle();
          this.updateStorageTypes();
          await this.getUnreadNoti();
          this.sign();
        });
      });
    }
  }

  sign = ():void => {
    // 开启自动签到，并且今天没有签到
    if (Config.userConfig.isAutoSign && Config.userConfig.signDate !== Common.nowDate()) {
      Net.sign();
    }
  }

  getUnreadNoti = ():void => {
    return Net.getUnreadNoti({ showLoading: false }).then((unread) => {
      this.setState({ unread });
    });
  }

  getTypes = async (callback?: (navDatas: NavDatas[]) => void): Promise<any> => {
    let navDatas: NavDatas[] = [{ id: '000', title: '最新', code: '' }];
    const data = Storage.getData(Config.StorageDataKey.NavDatas);
    if (data.data && data.data.length) {
      navDatas = data.data;
    } else {
      navDatas = await this.updateStorageTypes(true);
    }
    navDatas.forEach((item) => {
      this.pageNumDic[item.title] = 1;
    });
    if (callback) {
      callback(navDatas);
    }
  }

  updateStorageTypes = async (showLoading: boolean = false): Promise<any> => {
    const data = Storage.getData(Config.StorageDataKey.NavDatas);
    let isNeedUpdate = !data || !data.data;
    const nowDate = Common.nowDate();
    if (data.data && data.data.length) {
      const dataDate = data.date;
      isNeedUpdate = dataDate !== nowDate;
    }
    if (isNeedUpdate) {
      const navDatas: NavDatas[] = [{ id: '000', title: '最新', code: '' }];
      const typesData = await Net.getTypes(Net.Url.Types.Domain, { showLoading });
      if (typesData.code === 0) {
        typesData.data.domains.forEach((item) => {
          const url = item.domainURI as string;
          const urlArr = url.split('/');
          navDatas.push({
            id: item.oId, title: item.domainTitle, code: urlArr[urlArr.length - 1]
          });
        });
        Storage.setData(Config.StorageDataKey.NavDatas, { data: navDatas, date: nowDate });
        return navDatas;
      }
    }
    return data.data;
  }

  getArticle = (): any => {
    const { nowTabsIndex, navDatas, listDic } = this.state;
    const url = nowTabsIndex === 0 ? Net.Url.Articles.Latest : Net.Url.Articles.Domain;
    const keyword = navDatas[nowTabsIndex].code;
    const pageNum = this.pageNumDic[navDatas[nowTabsIndex].title];
    let listData: ArticleM[] = listDic[navDatas[nowTabsIndex].title] || [];
    return Net.getArticleList(url, keyword, Net.Sort.time, pageNum).then(resp => {
      if (resp.code === 0 && resp.data && resp.data.articles && resp.data.articles.length) {
        // 已经在云函数中进行数据解析，以免数据量过大，循环过多，导致效率低
        const articles: ArticleM[] = resp.data.articles;
        if (pageNum === 1) {
          listData = [];
        }
        listData = [...listData, ...articles];
        listDic[navDatas[nowTabsIndex].title] = listData;
        if (pageNum >= resp.data.pagination.paginationPageCount) {
          this.pageNumDic[navDatas[nowTabsIndex].title] = resp.data.pagination.paginationPageCount;
        }
        this.setState({ listDic }, () => {
          this.isLodingMore = false;
        });
      } else {
        this.isLodingMore = false;
      }
    }).catch(() => {
      this.isLodingMore = false;
    });
  }

  handleClickTabs = (i: number): void => {
    this.setState({ nowTabsIndex: i }, () => {
      const { nowTabsIndex, navDatas, listDic } = this.state;
      const title = navDatas[nowTabsIndex].title;
      if (!listDic[title] || listDic[title].length === 0) {
        this.getArticle();
      }
    });
  }

  onRefresherRefresh = (): void => {
    this.setState({ scrollStatus: true });
    const { nowTabsIndex, navDatas } = this.state;
    const title = navDatas[nowTabsIndex].title;
    this.pageNumDic[title] = 1;
    this.getArticle();
    this.setState({ scrollStatus: false });
  }

  onScroll = (e): void => {
    const { scrollTop, scrollHeight, deltaY } = e.detail;
    if (scrollHeight - (scrollTop + this.height) < 30 && !this.isLodingMore && deltaY < 0) {
      const { nowTabsIndex, navDatas } = this.state;
      this.isLodingMore = true;
      const title = navDatas[nowTabsIndex].title;
      this.pageNumDic[title]++;
      this.getArticle();
      Log.Info('加载', title, this.pageNumDic[title]);
    }
  }

  getTagsNode = (datas: TagM[]): React.ReactNode => {
    return <View className='tags'>
      {datas.map((item, index) => {
        const key = `tag-key-${index}`;
        return <Tag theme={this.theme} key={key} text={item.title} img={item.img} url={item.url} />
      })}
    </View>
  }

  getCardNode = (datas: ArticleM[]): React.ReactNode => {
    if (datas && datas.length) {
      return <View className='list'>
        <View className='space-card' />
        {datas.map((item, index) => {
          const key = `tag-key-${index}`;
          return <View key={key} className='card'>
            <View className='at-row at-row__justify--between card-head' onClick={() => this.handleClickCard(item)}>
              <View className='at-col title'>{item.title}</View>
              <View className={`at-col at-col-1 at-col--auto score s${item.score}`}>
                <Text className='icon icon-bookmark' />
              </View>
            </View>
            <View className='card-content' onClick={() => this.handleClickCard(item)}>{item.content}</View>
            <View className='at-row at-row__justify--between card-foot'>
              <View className='at-row'>
                {item.tags.map((item2, index2) => {
                  const key2 = `tag2-key-${index2}`;
                  return <Tag theme={this.theme} key={key2} text={item2.title} url={item2.url} />
                })}
              </View>
              <View className='at-row at-row__align--center at-row__justify--end card-info'>
                <View onClick={() => this.setState({ isShowUserCard: true, userData: item.author })}>
                  <Text className='icon icon-user' />
                  {item.author.name}
                </View>
                <View>
                  <Text className='icon icon-eye' />
                  {item.viewCount}
                </View>
              </View>
            </View>
          </View>
        })}
      </View>
    }
    return
  }

  handleClickCard = (data: ArticleM) => {
    const { id, commentCount } = data;
    Taro.navigateTo({ url: `/pages/article/index?id=${id}&commentCount=${commentCount}` });
  }

  render() {
    const { navDatas, isLogin, nowTabsIndex, listDic, scrollStatus, unread, isShowUserCard, userData } = this.state;
    const theme = this.theme;
    return (
      <FView className='home' unread={unread} theme={theme} onCloseLogin={(e) => {
        this.setState({isLogin: e }, () => {
            if (e) {
                // this.getTypes((datas) => {
                //     this.setState({ navDatas: datas }, this.getArticle);
                // });
                // this.updateStorageTypes();
                // this.getUnreadNoti();
                this.refresh();
            }
        })
      }}
      >
        {isLogin ? (
          <View style={{height: '100%'}}>
            <Menu theme={theme} />
            <AtTabs
              className='tab'
              current={nowTabsIndex}
              scroll
              tabList={navDatas}
              onClick={this.handleClickTabs}
            >
              {navDatas.map((item, index) => {
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
                      {this.getCardNode(listDic[item.title])}
                    </ScrollView>
                  </AtTabsPane>
                )
              })}
            </AtTabs>
            <UserCard isOpened={isShowUserCard} onClose={() => this.setState({ isShowUserCard: false })} data={userData} />
          </View>
        ) : (
            <View className='no-login' onClick={() => {Net.reLogin.home()}}>
              <Text className='icon icon-user' />
              Login
            </View>
          )}
      </FView>
    )
  }
}
