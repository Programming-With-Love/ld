import React, { Component } from 'react'
import { AtTag } from 'taro-ui'
import Taro from '@tarojs/taro';
import { View, Text, Image} from '@tarojs/components'

import './index.scss';

interface defaultProps {
    text?: string,
    img?: string
}
interface props {
    theme: object,
    url: string
}
type PropsWithDefaults = props & defaultProps;

class Tag extends Component<PropsWithDefaults> {
    public static defaultProps: defaultProps = {
        text: '--',
        img: ''
    }
    
    static options = {
        addGlobalClass: true
    }

    onClick = () => {
        const { url } = this.props as PropsWithDefaults;
        if (url && url.length) {
            const arr = url.split('/');
            const tag = arr[arr.length - 1];
            Taro.navigateTo({ url: `/pages/tagDetail/index?tag=${tag}` });
        }
    }

    render() {
        const { text, img } = this.props as PropsWithDefaults;
        return (
            <AtTag circle size='small' onClick={() => this.onClick()} >
                {img?.length != 0 ? <Image src={img || ''} /> : null }
                {text}
            </AtTag>
        )
    }
}

export default Tag;