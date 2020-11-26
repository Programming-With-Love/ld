import React from 'react';
import { View } from '@tarojs/components'
import { AtFloatLayout, AtTextarea } from 'taro-ui';
import './index.scss';

interface AuthorM {
    name: string,
    img: string,
    url: string,
    userTags: string,
    avatar: string,
    dec: string,
    userNo: number,
    userGeneralRank: number
}
const CommentEdit = (props) => {
    return <AtFloatLayout className='commentEdit' isOpened={props.isOpened} onClose={props.onClose}>
        {props.isOpened ? (
            <View className='commentEdit-body'>
                <View className='input-content'>
                    <AtTextarea
                      count={false}
                      value={props.value || ''}
                      maxLength={10000}
                      onChange={props.onChange}
                      placeholder={props.placeholder || '输入回复内容'}
                    />
                </View>
                <View className='ok-buttons'>
                    <text onClick={props.onOK} >OK</text>
                </View>
            </View>
        ) : ''}
    </AtFloatLayout>
}

export default CommentEdit;