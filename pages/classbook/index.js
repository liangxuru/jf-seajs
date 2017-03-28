//课程预定 
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
        css = require("./css.html"),
        cssCompare = require("compire-css"),
        classService = require('../../service/class'),
        store = require('../../lib/store'),
        pay = require("../components/pay/index"),
        selectOption = require('../components/selectOption/index'),
        addEmploy = require('../components/addemploy/index'),
        storeKeyEnum = require('../../lib/storeKeyEnum');

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
                imgServer: __imgServer
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
            choose: function(item, direct){
                // if(direct){
                //     this.selectItems.push(item);
                //     this.amount += item.APrice;
                // }else{
                //     this.selectItems = this.selectItems.filter(function (element) {
                //         return !(element.AproductID == item.AproductID && element.AStartDate == item.AStartDate && element.AGroundFieldAId == item.AGroundFieldAId && element.AGround_Time_AId == item.AGround_Time_AId);
                //     });
                //     this.amount -= item.APrice;
                // }
                //store.set(storeKey, this.selectItems);
            }
        },
        methods: {
            Submit: function () {
                
                this.$router.go({path:'/placeorder',name: 'placeorder', query: {accountName: this.$route.query.accountName}});
            },
            openCover: function(){
                this.covershow = true;
            },
            selectOption: function(item){
                this.select = item;
            }
        },
        ready: function(){
            this.select = store.get(storeKey);
            this.maxSize = $(window).width() - 90;
            classService.GetClassInfo({
                id: 1947//this.$route.query.Id
            }).then(function(data){
                this.info = data;
            }.bind(this));
        }
    });

    module.exports = VueComponent;
});
