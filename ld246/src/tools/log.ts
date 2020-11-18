const level:number = 0;
let instance: Log;
class Log {
    level: number;
    constructor() {
        this.level = 0;
    }

    static Instance = (): Log => {
        if (!instance) {
            instance = new Log();
            instance.level = level;
        }
        return instance;
    }

    log = (title, ...obj):void => {
        const [o] = obj
        console.log(`* ${new Date()} ${title} **`, ...o);
    }

    Info = (...obj):void => {
        if (this.level === 0) this.log("INFO", obj);
    }

    Highlight = (...obj): void => {
        console.warn(`* ${new Date()} HERE **`, ...obj);
    }

    Web = (url, status, ...obj):void => {
        switch (status) {
            case 0:
                this.log(`Net Start ${url}`, obj);
                break;
            case 1:
                this.log(`Net End ${url}`, obj);
                break;
            case 2:
                this.log(`Net ERROR ${url}`, obj);
                break;
            default:
                this.log(`Net INFO ${url}`, obj);
        }
    }
}

export default Log.Instance();