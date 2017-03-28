//场地预定 
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
        css = require("./css.html"),
        cssCompare = require("compire-css")
        calendar = require("../components/calendar/calendarB"),
        selecttime = require("../components/selecttime/index"),
        placeService = require('../../service/place'),
        store = require('../../lib/store'),
        weekdayEnum = require('../../lib/weekdayEnum'),
        storeKeyEnum = require('../../lib/storeKeyEnum'),
        loading = require("../components/loading/index"),
        message = require('../../lib/message');
        
        // parabola = require('../../lib/parabola');

    var storeKey = storeKeyEnum.shoppingCar;

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        components: {
            "calendar": calendar,
            "selecttime": selecttime,
            "loading": loading
        },
        data: function(){
        	return {
                current: 0,
                currentDate: new Date(),
                productId: 0,
	        	weekdays: [],
                prices: {
                	vertical: [],
                	horizontal: []
                },
                companys: [],
                selectItems: [],
                amount: 0,
                loading: false
	        }
        },
        events: {
            selected: function(index, date){
                this.getPriceByDate.call(this,date);
                //tab渲染
                this.current = index;
            },
            choose: function(item, direct){
                if(direct){
                    this.selectItems.push(item);
                    this.amount += item.APrice;
                }else{
                    this.selectItems = this.selectItems.filter(function (element) {
                        return !(element.AproductID == item.AproductID && element.AStartDate == item.AStartDate && element.AGroundFieldAId == item.AGroundFieldAId && element.AGround_Time_AId == item.AGround_Time_AId);
                    });
                    this.amount -= item.APrice;
                }
                store.set(storeKey, this.selectItems);
            }
        },
        methods: {
            getPriceByDate: function(_date){
                this.loading = true;
                placeService.GetResourcePrice({
                    date: _date,
                    productId: this.productId,
                    memberId: getCurrentData().userData.memID//'ea3dc280-7ad7-49ac-a82d-e2899aa53aa5'
                }).then(function(data){
                    this.prices.vertical = data.ATime;
                    this.prices.horizontal = data.AGroundFieldFront;
                    this.reset();
                    this.loading = false;
                }.bind(this));
            },
            reset: function(){
                this.selectItems.map(function(item){
                    this.prices.horizontal.map(function(ele){
                        ele.AGroundResourcePriceList.map(function(element){
                            //复位
                            if(element.AproductID == item.AproductID && element.AStatus && element.AStartDate == item.AStartDate && element.AGroundFieldAId == item.AGroundFieldAId && element.AGround_Time_AId == item.AGround_Time_AId){
                                element.AStatus = 1;
                                return false;
                            }
                        })
                        return false;
                    });
                }.bind(this));
            },
            Submit: function () {
                var name="", caculate={};
                function getdate(date) {
                    var _date = new Date(date);
                    return [_date.getFullYear(), _date.getMonth() + 1, _date.getDate()].join('');
                }
                this.selectItems.map(function(item){
                    name = item.AproductID + getdate(item.AStartDate) + item.AGroundFieldAId;
                    if (!caculate[name]) {
                        caculate[name] = [];
                    }
                    caculate[name].push(item.AGround_Time_AId);
                });

                for (var item in caculate) {
                    var flag = 0;
                    caculate[item].map(function (it, ii, arr) {
                        if (arr.indexOf(it - 1)==-1 && arr.indexOf(it + 1)==-1) {//前后两个数都不存在
                            flag = 1;
                            return;
                        }else if(arr.indexOf(it + 1)==-1&&arr.indexOf(it + 2)>-1){//后一个数存在但后两个数存在
                            flag = 2;
                            return;
                        }
                    });
                    if (flag===1) { 
                        message.error("最小起订一小时"); return; 
                    }else if(flag===2){
                        message.error("请不要留下单个半小时"); return;
                    }
                }
                if(this.selectItems.length==0) {message.error("您还未选择资源"); return;}
                // location.href = "../pages/placeorder/index.html?accountName=" + this.$route.query.accountName;
                this.$router.go({path:'/placeorder',name: 'placeorder', query: {accountName: this.$route.query.accountName}});
            }
        },
        ready: function(){
            this.productId = this.$route.query.productId;
            this.currentDate = this.$route.query.date;
            var user = getCurrentData();
            
            //获取会员属于哪些公司信息
            // placeService.GetMemberCardInfo({
            //     memberId: user.userData.memID
            // }).then(function(data){
            //     this.companys = data && data.companyInfo && data.companyInfo.forEach(function(item){
            //         return item.shopId
            //     }).join(',');
            // }.bind(this));

            //日期
            var now = new Date();
            placeService.GetWeekdays({
                ProductId: this.productId,
                spid: __spid,
                Date: [now.getFullYear(), now.getMonth()+1, now.getDate()].join('-'),
                Datecount: 7
            }).then(function(data){
                var curr = new Date() + '';
                function getWeekday(date){
                    if(date.formatDate('yyyy-MM-dd') == curr.formatDate('yyyy-MM-dd')){
                        return '今天';
                    }else{
                        return weekdayEnum[new Date(date).getDay()];
                    }
                }
                data.forEach(function(item, i){
                    item.Week = getWeekday(item.ADate);
                });
                this.weekdays = data;
            }.bind(this)).then(function(){
                //价格DateTime date, Int32 productId, string memberId
                this.getPriceByDate.call(this,this.currentDate);
                //初始化选中日期
                this.weekdays.forEach(function(item, i){
                    if(item.ADate == this.currentDate){
                        this.current = i;
                        return false;
                    }
                }.bind(this));
            }.bind(this));

            //获取缓存中产品下列表
            if(store.get(storeKey).length){
                this.selectItems = store.get(storeKey);
                this.selectItems.map(function(item){
                    if(new Date(item.AStartDate) < new Date([now.getFullYear(), now.getMonth()+1, now.getDate()].join('/'))){
                        this.selectItems.$remove(item);
                    }else{
                        this.amount += item.APrice;
                    }
                }.bind(this));
            }
        }
    });

    module.exports = VueComponent;
});
