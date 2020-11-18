import md5 from 'md5';
import dayjs from 'dayjs';

let instance: Common;
class Common {
  temp: object;
   static Instance = ():Common => {
     if (instance) return instance;
     instance = new Common();
     instance.temp = {};
     return instance;
   }
  
  nowDate() {
    return dayjs().format('YYYY-MM-DD');
  }

  // 获取到现在的间隔天数
  getIntervalDays(date): number {
    return dayjs().diff(dayjs(date), 'day');
  }

  encodeMd5 = (str): string => {
    return md5(str);
  }

  trim(str): string {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  }

  debounce(fn, delay): any {
    let timer;
    return function () {
      if (timer) {
        clearTimeout(timer)
        timer = setTimeout(fn, delay)
      } else {
        timer = setTimeout(fn, delay)
      }
    }
  }

  throttle(fn, delay): any {
    let valid = true
    return function () {
      if (!valid) {

        return false
      }

      valid = false
      setTimeout(() => {
        fn()
        valid = true;
      }, delay)
    }
  }
}

export default Common.Instance();