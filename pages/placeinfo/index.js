// 场地详情
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
    	cssCompare = require("compire-css"),
    	comment = require("../components/comment/index"),
    	calendar = require("../components/calendar/calendarA"),
    	swiper = require("../components/swiper/index"),
    	placeService = require('../../service/place'),
    	weekdayEnum = require('../../lib/weekdayEnum'),
        sportTypeEnum = require('../../lib/sportTypeEnum'),
        storeKeyEnum = require('../../lib/storeKeyEnum'),
        tab = require('../components/tab/index'),
        store = require('../../lib/store'),
        loading = require("../components/loading/index");

    var storeKey = storeKeyEnum.shoppingCar,
        productKey = storeKeyEnum.product;
    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        components: {
        	"comment": comment,
        	"calendar": calendar,
        	"swiper": swiper,
            "tab": tab,
            "loading": loading
        },
        data: function() {
        	return {
                SportsType: 0,
                productId: 1,
        		imgs: [],
	        	weekdays: [],
	        	info: {},
	        	detail: {},
                current: 0,
                loading: false,
	        }
        },
        events: {
            select: function(value){
                this.current = value;
            }
        },
        init: function(){
            placeService.GetProductsBySportType({
                SportType: this.$route.query.SportsType,
                spid: __spid
            }).then(function(data){
                this.productId = data && data.length && data[0].productId || 0;
            }.bind(this)).then(function(){
                if(this.productId){
                    var now = new Date();
                    placeService.GetPrductById({
                        ProductId: this.productId
                    }).then(function(data){
                        var self = this;
                        this.info = data.info;
                        this.detail = data.detail;
                        if(data.info){
                            this.imgs.push({id: 1, url: data.info.PollingImg1});
                            this.imgs.push({id: 2, url: data.info.PollingImg2});
                            this.imgs.push({id: 3, url: data.info.PollingImg3});
                        }
                        this.$broadcast('imageready');
                        store.set(storeKey, []);
                        store.set(productKey, {id: this.productId, name: this.info.productName, icon: sportTypeEnum.filter(function(it){return it.id==self.$route.query.SportsType})[0].icon});
                    }.bind(this));

                    this.loading = true;
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
                            item.Path = {
                                path: '/placebook',
                                name: 'placebook',
                                query: {
                                    productId:  this.productId,
                                    date: item.ADate,
                                    accountName: this.$route.query.accountName
                                }
                            };
                        }.bind(this));
                        this.weekdays = data;
                        this.loading = false;
                    }.bind(this));

                }
                
            }.bind(this));
        },
        
    });

    module.exports = VueComponent;
});