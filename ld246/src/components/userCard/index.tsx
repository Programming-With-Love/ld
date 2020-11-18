import React from 'react';
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro';
import ModalView from '../modal';
import './index.scss';

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
    point: number,
}
const UserCard = (props) => {
    const data = props.data as AuthorM;
    const isHaveBGIMG = data && data.img?.length > 0;
    return <ModalView className='user-card' isOpened={props.isOpened && props.data} onClose={props.onClose}>
        {props.isOpened && props.data ? (
            <View className='user-card-body' onClick={() => {
                if (props.onClose) props.onClose();
                Taro.navigateTo({ url: `/pages/me/index?userName=${data.userName}` });
            }}
            >
                {isHaveBGIMG ? <Image className='user-card-bg' src={data.img} mode='aspectFill' /> : ''}
                <View className={`user-card-bottom ${isHaveBGIMG ? '' : 'white'}`}>
                    <View className='user-card-bottom-left'>
                        <Image className='user-card-avatar' src={data.avatar} />
                    </View>
                    <View className='user-card-bottom-right'>
                        <View className='user-card-base'>
                            <Text className='user-card-name'>{data.name}</Text>
                            <Text className='user-card-dec'>{data.dec}</Text>
                            <Text className='user-card-tags'>{data.userTags}</Text>
                        </View>
                        <View className='user-card-info'>
                            <Text className='user-card-num'>NO: {data.userNo}</Text>
                            <Text className='user-card-rank'>贡献: {data.userGeneralRank}</Text>
                            <Text className='user-card-point'>积分: {data.point}</Text>
                        </View>
                    </View>
                    
                </View>
            </View>
        ) : ''}
    </ModalView>
}

export default UserCard;