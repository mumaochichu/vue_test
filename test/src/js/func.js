/*逻辑功能类
*创建：20210114 dxkj
*主要依赖类：this.Earth、this.index等
调用方式:this.Earth.func
备注：本功能类用于临时演示相关功能
*/
function LogicFunc(_self) {
    this.Vue = _self;
    this.serverAddress = this.Vue.$store.state.appConfig.ServerConfig.serverAddress;//后台服务地址

}

LogicFunc.prototype = {
    /*获得解析的polygon/polyline类型geojson文件中数据
    */
    getPolygonData(url, callback) {
        this.getAxios(url, function (result) {
            var features = result.features;
            if (features && features[0]) {
                if (typeof callback == "function") {
                    callback(features);
                }
            }
        });
    },
}
var axios = {
    /*get请求数据
    */
    getAxios(url, callback) {
        this.Vue.axios.get(url).then(response => {
            if (typeof callback == "function") {
                callback(response.data);
                console.log('读取成功');
            }
        }, response => {
            console.log("error");
        });
    },
    /*post请求服务*/
    postAxios(url, params, callback) {
        var common = this.Vue.axios.create({
            method: 'post',
            transformRequest: [function (data) {
                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
        });

        common.post(url, params).then(function (response) {
            if (typeof callback == "function") {
                callback(response)
            }
        }).catch(function (error) {
            console.log(error);
        });
        // this.Vue.axios.post(url, params).then(function (response) {
        //     if (typeof callback == "function") {
        //         callback(response)
        //     }
        // }).catch(function (error) {
        //     console.log(error);
        // });
    },
};


/*匹配数据源
*/
var match = {
    /*选择所要解析的文件
    */
    switchFileName(name) {
        let url = "";
        switch (name) {
            case "价格行情":
                url = "json/价格行情.json";
                break;
            case "储量按国家统计":
                url = "json/储量按国家统计.json";
                break;
            case "长江有色市场价":
                url = "json/长江有色市场价.json";
                break;
            case "top10矿山":
                url = "json/top10矿山.json";
                break;
            case "铜加工费":
                url = "json/铜加工费.json";
                break;
            case "储量按公司统计":
                url = "json/储量按公司统计.json";
                break;
            case "全球铜矿产量":
                url = "json/全球铜矿产量.json";
                break;
            case "全球精炼铜产量":
                url = "json/全球精炼铜产量.json";
                break;
            case "中国月度精炼铜产量":
                url = "json/中国月度精炼铜产量.json";
                break;
            case "全球铜消费量":
                url = "json/全球铜消费量.json";
                break;
            case "中国月度铜产量":
                url = "json/中国月度铜产量.json";
                break;
            case "矿业项目":
                url = "json/矿业项目.json";
                break;
            case "矿业公司":
                url = "json/矿业公司.json";
                break;
            case "贸易情况-全球铜矿":
                url = "txt/贸易数据/贸易情况-全球铜矿.txt";
                break;
            case "贸易情况-全球精炼铜":
                url = "txt/贸易数据/贸易情况-全球精炼铜.txt";
                break;
            case "中国铜历史进口量":
                url = "txt/贸易数据/中国铜历史进口量.txt";
                break;
            case "中国铜进口来源-铜矿":
                url = "txt/贸易数据/中国铜进口来源-铜矿.txt";
                break;
            case "中国铜进口来源-精炼铜":
                url = "txt/贸易数据/中国铜进口来源-精炼铜.txt";
                break;
            case "成本曲线":
                url = "txt/成本曲线/成本曲线.txt";
                break;
            case "全球铜勘查投入占比":
                url = "txt/勘查投入/全球铜勘查投入占比.txt";
                break;
            case "各大洲勘查投入变化":
                url = "txt/勘查投入/各大洲勘查投入变化.txt";
                break;
            case "不同公司铜勘查投入":
                url = "txt/勘查投入/不同公司铜勘查投入.txt";
                break;
            case "铜矿勘查投入分国家":
                url = "txt/勘查投入/铜矿勘查投入分国家.txt";
                break;
            case "不同阶段勘查投入":
                url = "txt/勘查投入/不同阶段勘查投入.txt";
                break;
            default:
                return null;
        }
        return "/common/data/" + url;
    },

};

/*常用get方法
*/
var get = {
    /*解析.json或者.txt文件，传给相应页面回调函数
    */
    getDbJsonData(name, callback) {
        if (!name) return;
        let url = this.switchFileName(name);
        if (!url) return;
        $.getJSON(url, function (data) {
            if (typeof callback == "function") {
                callback(data);
            }
        });
    },
    /*根据国家英文名匹配到中文名
    */
    getCountyCNameByEName(CName) {
        let _this = this;
        let countyArr = _this.Vue.$store.state.appConfig.CountryNameConfig;
        if (countyArr && countyArr.length > 0) {
            for (let i = 0; i < countyArr.length; i++) {
                let item = countyArr[i];
                if (item.EName == CName) {
                    return item.CName;
                }
            }
        }
        return null;
    },
    /*根据国家中文名匹配到英文名
    */
    getCountyENameByCName(EName) {
        let _this = this;
        let countyArr = _this.Vue.$store.state.appConfig.CountryNameConfig;
        if (countyArr && countyArr.length > 0) {
            for (let i = 0; i < countyArr.length; i++) {
                let item = countyArr[i];
                if (item.CName == EName) {
                    return item.EName;
                }
            }
        }
        return null;
    },
    /*获得去除字符串首尾空格的对象
        *@param:obj {object} eg：{aa:'',bb:''}
    */
    getObjByRemoveStrSpace(obj) {
        let result = {};
        for (let key in obj) {
            let key2 = key.trim();
            let val2 = obj[key].trim();
            result[key2] = val2;
        }
        return result;
    },
};

/*扩展对象
*/
var extendObj = function (target, sources) {
    if (typeof (sources) == "object" && sources.length > 0) {
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            if (typeof (source) == "object") {
                for (var obj in source) {
                    target[obj] = source[obj];
                }
            }
        }
    }
    return target;
}

LogicFunc.prototype = extendObj(LogicFunc.prototype, [axios, match, get]);
export default LogicFunc
