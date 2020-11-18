import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, RichText } from '@tarojs/components'
import FView from '../index';
import Tag from '../../components/tag';
import Net from '../../net'
import { Auth, Theme, Log, Config, Storage, Common } from '../../tools'

import './index.scss'



interface P { }

interface S {
    data?: DataM[]
}

interface DataM {
    domain: DomainM,
    tags: TagM[]
}

interface DomainM {
    title: string,
    id: string,
    img: string,
    url: string,
    dec: string,
    viewCount: number
}

interface TagM {
    title: string,
    url: string,
    img: string,
    id: string,
}

export default class Index extends Component<P, S> {
    constructor(P) {
        super(P);
        this.state = {
            data: undefined
        };
    }

    componentDidMount() {
        this.refresh();
    }

    refresh = () => this.getData();

    getData = () => {
        const nowDate = Common.nowDate();
        const domainData = Storage.getData(Config.StorageDataKey.Domain);
        let isNeedUpdate = true;
        if (domainData && domainData.data) {
            isNeedUpdate = false;
            const days = Common.getIntervalDays(domainData.date);
            if (days > 7) {
                isNeedUpdate = true;
            }
        }
        if (isNeedUpdate) {
            const NavDatas = Storage.getData(Config.StorageDataKey.NavDatas);
            if (NavDatas && NavDatas.data) {
                const codes: string[] = [];
                NavDatas.data.forEach((item) => {
                    if (item.code.length > 0) {
                        codes.push(item.code);
                    }
                });
                if (codes.length > 0) {
                    Net.getDomainsDetail(codes).then((resp) => {
                        if (resp && resp.length > 0) {
                            const data: DataM[] = [];
                            resp.forEach((item) => {
                                if (item.code === 0) {
                                    const tags: TagM[] = [];
                                    const domain = item.data.domain;
                                    if (domain.domainTags && domain.domainTags.length > 0) {
                                        domain.domainTags.forEach((item2) => {
                                            tags.push({
                                                title: item2.tagTitle,
                                                img: item2.tagIconPathWithStyle,
                                                id: item2.oId,
                                                url: item2.tagURI
                                            })
                                        });
                                    }
                                    data.push({
                                        domain: {
                                            title: domain.domainTitle,
                                            id: domain.oId,
                                            img: domain.domainIconPath,
                                            url: domain.domainURI,
                                            dec: domain.domainDescription,
                                            viewCount: domain.domainViewCount
                                        },
                                        tags
                                    })
                                }
                            });
                            if (data.length === codes.length) {
                                Storage.setData(Config.StorageDataKey.Domain, { data, date: nowDate });
                            }
                            this.setState({ data });
                        }
                    });
                }
            }
        } else {
            this.setState({ data: domainData.data });
        }
       
    }

    getTitleNode = (data:DomainM): React.ReactNode => {
        return <View className='domain-head'>
            {/* <parser className='domain-head-img' html={data.img} /> */}
            <RichText className='domain-head-img' nodes={[{ "attrs": { "src": `data: image/svg+xml;utf8,${data.img}` }, "name": "img" }]} />
            <View className='domain-head-text'>
                <View>{data.title}</View>
                <RichText className='domain-head-dec' nodes={data.dec} />
            </View>
        </View>
    }

    getTagsNode = (data: TagM[]): React.ReactNode => {
        const theme = Theme.getThemeJson();
        return <View className='domain-tags'>
            {data.map((item, index) => {
                return <Tag key={`tag-key-${index}`} theme={theme} text={item.title} img={item.img} url={item.url} />
            })}
        </View>
    }

    getSubDomainNode = (data: DataM): React.ReactNode => {
        return <View key={`key-domain-${data.domain.title}`} className='sub-domain' >
            {this.getTitleNode(data.domain)} 
            {this.getTagsNode(data.tags)}
        </View>
    }

    render() {
        const theme = Theme.getThemeJson();
        const { data } = this.state;
        return <FView className='domain-page' onCloseLogin={this.refresh}>
            {data && data.length > 0 ? (
                data.map((item) => {
                    return this.getSubDomainNode(item);
                })
            ) : ''}
        </FView>
    }
}
