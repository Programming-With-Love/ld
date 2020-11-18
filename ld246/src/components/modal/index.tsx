import React from 'react';
import { AtFloatLayout } from 'taro-ui';
import './index.scss';

const Index = (props) => {
    return <AtFloatLayout className={`ld-modal ${props.className}`} isOpened={props.isOpened} onClose={props.onClose}>
        {React.Children.map(props.children, (child) => {
            return child;
        })}
    </AtFloatLayout>
}

export default Index;