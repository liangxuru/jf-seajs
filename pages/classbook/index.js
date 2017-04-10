//课程预定 
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
        css = require("./css.html"),
        cssCompare = require("compire-css"),
        classService = require('../../service/class'),
        store = require('../../lib/store'),
        pay = require("../components/classpay/index"),
        selectOption = require('../components/selectOption/index'),
        addEmploy = require('../components/addemploy/index'),
        storeKeyEnum = require('../../lib/storeKeyEnum'),
        message = require('../../lib/message');

    var storeKey = storeKeyEnum.shoppingCar;
    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        components: {
            "seloption": selectOption,
            "addemploy": addEmploy,
            "payment": pay
        },
        data: function(){
        	return {
                maxSize: 200,
                covershow: false,
                amount: 0,
                paid: 0,
                cardprice: 0,
                coverEmployShow: false,
                select: {},
                info: {},
                imgServer: __imgServer,
                customer: {}
	        }
        },
        events: {
            closeCover: function(){
                this.covershow = false;
            },
            selectOption: function(item){
                this.select = item;
            },
            closeEmployCover: function(){
                this.coverEmployShow = false;
            },
            choose: function(){
                this.$broadcast("select");
            },
            submit: function(cardpay, wxpay){
                
                if(this.customer.length){
                    this.Submit(cardpay, wxpay);
                }else{
                    message.error("您还未添加学员");
                }
            },
            render: function(){
                this.getCustomerList();
            }
        },
        methods: {
            Submit: function (cardpay, wxpay) {
                var ids = this.customer.filter(function(item){
                    return item.AStatus == 2
                }).map(function(item, index){
                    return item.AId
                }).join(',');
                if(!ids.length){ message.error("您还未选择学员"); return;}
                var maxPerson = (this.select.APersonNumberMax||0)-(this.select.APersonNumber||0);
                if(ids.split(',').length > maxPerson){
                    message.error("当前最多可报"+ maxPerson + "人");
                    return;
                }

                var current = getCurrentData();
                var model = {
                    ProductId: this.info.productId,
                    ClassId: this.select.AId,
                    StudentIdList: ids,
                    IsUseMemberCard: cardpay,
                    isWxPay: wxpay,
                    opid: current.openID,
                    memid: current.userData.memID,
                    spid: __spid
                };
                classService.CreateOrder(model).then(function(data){
                    if(model.isWxPay &&data.payStatus === 0){
                        //未支付,转微信
                        this.payAgin(data.orderCode);
                        // self.getPay(data.data.orderCode, getLocalData("currentAN"), "1", opid);
                    }else{
                        //已支付
                        var jpUrl = getServerURL() + "Mobile/jf/pages/index.html#!/success/:orderCode/:accountName/:canshow/?accountName=" + getLocalData("currentAN") + "&orderCode=" + data.orderCode+ "&canshow=false";
                        
                        location.replace(jpUrl);
                    }
                    store.remove(storeKey);
                }.bind(this));
            },
            openCover: function(){
                this.covershow = true;
            },
            selectOption: function(item){
                this.select = item;
            },
            payAgin: function(orderCode){
                //未支付,转微信
                var current = getCurrentData();
                var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + current.payAppID + "&redirect_uri=" +  encodeURIComponent(getServerURL() + "Mobile/JF/pages/wxpay.html?accountName=" + getLocalData("currentAN") + "&orderCode=" + orderCode) + "&showwxpaytitle=1&response_type=code&scope=snsapi_base&state=1#wechat_redirect";
                history.replaceState(null,'','index.html#!/classlist/:accountName?accountName='+getLocalData("currentAN"));
                location.replace(url);
            },
            getCustomerList: function(){
                /**根据MEMID获取学员列表**/
                classService.GetCustomersByUser({
                    memberId: getCurrentData().userData.memID,
                    spid: __spid
                }).then(function(data){
                    data.length && data.map(function(item){
                        item.AStatus = 2;
                    });
                    this.customer = data;
                    this.$broadcast("select");
                }.bind(this));
            }
        },
        ready: function(){
            this.select = store.get(storeKey);
            this.maxSize = $(window).width() - 90;
            /**根据班级主键获取班级信息**/
            classService.GetClassInfo({
                id: this.$route.query.Id
            }).then(function(data){
                this.info = data;
                this.$broadcast("select");
            }.bind(this));

            this.getCustomerList();
        }
    });

    module.exports = VueComponent;
});
