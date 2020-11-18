import React from 'react';
import { View } from '@tarojs/components';
import ModalView from '../modal';
import './index.scss';

const Index = (props) => {
    return <ModalView className={`ld-alert ${props.className}`} isOpened={props.isOpened} onClose={props.onClose}>
        <View className='alert-content'>
            <View className='alert-title'>{props.title || '提醒'}</View>
            <View className='alert-text'>{props.content || ''}</View>
            <View className='alert-btns'>
                <View className='alert-cancel' onClick={() => {
                    if (props.onClose) props.onClose();
                    if (props.onCancel) props.onOk();
                }}
                >cancel</View>
                <View className='alert-ok' onClick={() => {
                    if (props.onClose) props.onClose();
                    if (props.onOk) props.onOk();
                }}
                >ok</View>
            </View>
        </View>
    </ModalView>
}

export default Index;