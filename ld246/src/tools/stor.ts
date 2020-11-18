import Taro from '@tarojs/taro';
import Log from './log';

class Storage {
    setData = (key: string, data: any, async = false): any => {
        if (async) {
            return Taro.setStorage({key, data});
        }
        Log.Info('Storage', key, data);
        try {
            Taro.setStorageSync(key, data);
        } catch (e) {
            Log.Info('Storage err', e);
        }

    }
    getData = (key: string, async = false): any => {
        if (async) {
            return Taro.getStorage({key});
        }
        return Taro.getStorageSync(key);  
    }
}

export default new Storage();