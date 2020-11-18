import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Image, ScrollView } from '@tarojs/components'
// import { AtFloatLayout } from 'taro-ui';
import { Auth, Log, Common, Config } from '../../tools';
import './index.scss';


interface defaultProps {
    data?: CommentM[],
    onClickAuthor?: (data: AuthorM) => void,
    refresherEnabled: boolean,
    onRefresherRefresh?: () => void
    onScroll?: (e: any) => void,
    onComment?:(id: string, name: string) => void
    // isLodingMore: boolean
    // img?: string
}

interface S {
    scrollStatus: boolean
}
interface props {
    theme: object
}
type PropsWithDefaults = props & defaultProps;
interface CommentM {
    author: AuthorM,
    content: string,
    lastTime: string,
    Id: string,
    originalCommentId: string
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

interface ShowDataM {
    sComment?: CommentM,
    rComment: CommentM
}
class Comment extends Component<PropsWithDefaults, S> {
    parser?: object;
    // height: number;
    // isLodingMore: boolean;
    public static defaultProps: defaultProps = {
        // isLodingMore: false
        // text: '--',
        // img: ''
    }

    static options = {
        addGlobalClass: true,
        usingComponents: {
            parser: "../../components/parser/parser"
        }
    }
    constructor(PropsWithDefaults) {
        super(PropsWithDefaults);
        this.state = {
            scrollStatus: false
        }
        // this.isLodingMore = false;
        // this.height = Taro.getSystemInfoSync().windowHeight;
    }

    componentDidMount() {
        // const app = Taro.getApp();
        // Log.Highlight(this.parser)
        // global.Parser.onLinkpress = function (e) {
        //     Log.Highlight(e);
        //     // if (e.href == "xxx")
        //     //     e.ignore();
        // }
    }

    analysisData = (data: CommentM[]): ShowDataM[] => {
        const dataS = data;
        const dataTemp: ShowDataM[] = [];
        dataS.forEach(item => {
            let sComment;
            if (item.originalCommentId != '') {
                for (let i = 0; i < dataS.length; i++) {
                    const item2 = dataS[i];
                    if (item2.Id === item.originalCommentId) {
                        sComment = item2;
                        break;
                    }
                }
            }
            dataTemp.push({
                sComment,
                rComment: item
            })
        });
        return dataTemp;
    }

    onRefresherRefresh = (): void => {
        this.setState({ scrollStatus: true });
        const { onRefresherRefresh } = this.props;
        if (onRefresherRefresh) onRefresherRefresh();
        this.setState({ scrollStatus: false });
    }

    render() {
        const { data, theme, onClickAuthor, refresherEnabled, onScroll, onComment } = this.props as PropsWithDefaults;
        const { scrollStatus } = this.state;
        const dataTemp = this.analysisData(data || []);
        const fontSizeTemp = Config.userConfig.fontSizeMode === 'big' ? 'bi' : Config.userConfig.fontSizeMode;
        return (
            <ScrollView
              className='comment-view'
              scrollY
              enableBackToTop
              scrollWithAnimation
              refresherEnabled={refresherEnabled}
              refresherTriggered={scrollStatus}
              refresherBackground={theme["&bgColor"]}
              onRefresherRefresh={this.onRefresherRefresh}
              onScroll={onScroll}
            >
                {dataTemp?.map((item, index) => {
                    const key = `comment-key-${index}`;
                    const r = item.rComment;
                    const s = item.sComment;
                    return <View className='comment' key={key}>
                        <Image className='comment-avatar' src={r.author.avatar} onClick={() => { if (onClickAuthor) onClickAuthor(r.author)}} />
                        <View className='comment-right'>
                            {s ? (
                                <View className='comment-sub'>
                                    <Image className='comment-avatar' src={s.author.avatar} onClick={() => { if (onClickAuthor) onClickAuthor(s.author) }} />
                                    <View className='comment-sub-right'>
                                        <View className='comment-head' onClick={() => { if (onClickAuthor) onClickAuthor(s.author) }}>
                                            {`${s.author.name} ${s.lastTime}`}
                                        </View>
                                        <View className='comment-content' onClick={() => {
                                            if (onComment) onComment(s.Id, s.author.name);
                                        }}
                                        >
                                            <parser id={`font-${fontSizeTemp}`} html={s.content} />
                                        </View>
                                    </View>
                                </View>
                            ) : ''}
                            <View className='comment-head' onClick={() => { if (onClickAuthor) onClickAuthor(r.author) }}>
                                {`${r.author.name} ${r.lastTime}`}
                            </View>
                            <View className='comment-content' onClick={() => {
                                if (onComment) onComment(r.Id, r.author.name);
                            }}
                            >
                                <parser id={`font-${fontSizeTemp}`} ref={e => {this.parser = e }} html={r.content} />
                            </View>
                        </View>
                    </View>
                })}
            </ScrollView>
        )
    }
}

export default Comment;