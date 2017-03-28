// 场地订单
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
        css = require("./css.html"),
        cssCompare = require("compire-css"),
        pay = require("../components/pay/index"),
        store = require('../../lib/store'),
        weekdayEnum = require('../../lib/weekdayEnum'),
        storeKeyEnum = require('../../lib/storeKeyEnum'),
        wx = require('../../lib/jWeixin'),
        loading = require('../components/loading/index'),
        // orderService = require('../../service/order'),
        lastRun = require('../../lib/last-run'),
        message = require('../../lib/message');

    var storeKey = storeKeyEnum.shoppingCar,
        productKey = storeKeyEnum.product;

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        components: {
            "payment": pay,
            "loading": loading
        },
        data: function() {
        	return {
                carShops: [],
                more: 3,
                inermore: true,//默认收起
                expand: "展开",
                // amount: 0,
                productName: '',
                productIcon: '',
                resourceGroup: [],
                loading: false
	        }
        },
        ready: function(){
            if(store.get(productKey)){
                this.productName = store.get(productKey).name;
                this.productIcon = store.get(productKey).icon;
            }
            this.carShops = store.get(storeKey);

            var temp ={};
            this.carShops.length && this.carShops.sort(function(a, b){
                return a.AStartDate> b.AStartDate;
            }).map(function(item){
                // this.amount += item.APrice;
                item.AStatus = 2;
                if(!temp[item.AStartDate]){
                    temp[item.AStartDate] = [];
                }
                temp[item.AStartDate].push(item);
            }.bind(this));

            for(item in temp){
                this.resourceGroup.push({
                    date: getDateStr(item)[0],
                    week: getDateStr(item)[1],
                    resource: temp[item]
                });
            }

            function getDateStr(date){
                var _date = new Date(date);
                return [[_date.getFullYear(), _date.getMonth()+1, _date.getDate()].join('-'),weekdayEnum[_date.getDay()]];
            }
        },
        events: {
            submit: function(cardpay, wxpay){
                this.submit(cardpay, wxpay);
            }
        },
        methods: {
            open: function(){
                if(this.expand == "展开"){
                    this.more = this.carShops.length;
                    this.inermore = false;
                    this.expand = "收起";
                }else{
                    this.more = 3;
                    this.inermore = true;
                    this.expand = "展开";
                }
            },
            select: function(ele){
                if(ele.AStatus == 2){//选中变为不选
                    ele.AStatus = 1;
                    // this.amount -= ele.APrice;
                }else{
                    ele.AStatus = 2;
                    // this.amount += ele.APrice;
                }
                this.$broadcast("select");
            },
            submit: function(cardpay, wxpay){
                if(!this.lastRun){
                    this.lastRun = lastRun(1);
                }
                this.lastRun(function(){
                    var current = getCurrentData();
                    var selectItems = this.carShops.length && this.carShops.filter(function(item){
                        return item.AStatus ==2;
                    });
                    //校验
                    var name="", caculate={};
                    function getdate(date) {
                        var _date = new Date(date);
                        return [_date.getFullYear(), _date.getMonth() + 1, _date.getDate()].join('');
                    }
                    selectItems && selectItems.map(function(item){
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
                    if(selectItems.length==0) {message.error("您还未选择资源"); return;}

                    var obj = {
                        resource: selectItems,
                        iscardPay: cardpay,
                        isWXpay: wxpay,
                        opid: current.openID,
                        memid: current.userData.memID,
                        spid: __spid
                    };
                    this._ajax(current.openID, obj);
                });
            },
            _ajax: function(opid, obj){
                var self = this;
                $.ajax({
                    url: getServerURL() + 'api/Ground/CreateOrder',
                    type: 'Post',
                    dataType: 'json',
                    data: {
                        "": JSON.stringify(obj)
                    },
                    success: function(data){
                        data = JSON.parse(data);
                        if(data.status == 1){
                            if(data.data.payStatus === 0){
                                //未支付,转微信
                                self.payAgin(data.data.orderCode);
                                // self.getPay(data.data.orderCode, getLocalData("currentAN"), "1", opid);
                            }else if(data.data.payStatus === 1){
                                //已支付
                                var jpUrl = getServerURL() + "Mobile/jf/pages/index.html#!/success/:orderCode/:accountName/?accountName=" + getLocalData("currentAN") + "&orderCode=" + data.data.orderCode;
                                
                                location.replace(jpUrl);
                                //self.$router.go({path:'/success',name: 'success', query: {orderCode: data.data.orderCode,accountName: self.$route.query.accountName}});
                            }
                            store.remove(storeKey);
                        }else{
                            message.error(data.massage);
                        }
                    },
                    error: function(){
                        message.error("error");
                    }
                });
            },
            payAgin: function(orderCode){
                //未支付,转微信
                var current = getCurrentData();
                var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + current.payAppID + "&redirect_uri=" +  encodeURIComponent(getServerURL() + "Mobile/JF/pages/wxpay.html?accountName=" + getLocalData("currentAN") + "&orderCode=" + orderCode) + "&showwxpaytitle=1&response_type=code&scope=snsapi_base&state=1#wechat_redirect";
                history.replaceState(null,'','index.html#!/placebook/:productId/:date/:accountName?accountName='+getLocalData("currentAN")+'&date='+this.carShops[this.carShops.length -1].AStartDate+'&productId=' + store.get(productKey).id);
                location.replace(url);
            }
        }
    });

    module.exports = VueComponent;
});