// 课程详情
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
    	cssCompare = require("compire-css"),
    	comment = require("../components/comment/index"),
    	swiper = require("../components/swiper/index"),
    	classService = require('../../service/class'),
        tab = require('../components/tab/index'),
        selectOption = require('../components/selectOption/index'),
        store = require('../../lib/store'),
        storeKeyEnum = require('../../lib/storeKeyEnum'),
        message = require('../../lib/message');

    var storeKey = storeKeyEnum.shoppingCar;
    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        components: {
        	"comment": comment,
        	"swiper": swiper,
            "tab": tab,
            "seloption": selectOption,
            "loading": loading
        },
        data: function() {
        	return {
                imgs: [],
	        	info: {},
                select: {},
                covershow: false,
                current: 0
	        }
        },
        init: function(){
            classService.GetClassInfo({
                id: this.$route.query.Id
            }).then(function(data){
                this.imgs.push({id: 1, url: data.PollingImg1});
                this.imgs.push({id: 2, url: data.PollingImg2});
                this.imgs.push({id: 3, url: data.PollingImg3});
                this.info = data;
            }.bind(this));
        },
        events: {
            closeCover: function(){
                this.covershow = false;
            },
            selectOption: function(item){
                this.select = item;
            },
            select: function(value){
                this.current = value;
            }
        },
        methods: {
            openCover: function(){
                this.covershow = true;
            },
            SignUp: function(){
                if(!this.select.AId){
                    message.error("您还未选择资源");
                }else{
                    store.set(storeKey, this.select);
                    this.$router.go({path: 'classbook', name: 'classbook', query: { Id: this.$route.query.Id, accountName: this.$route.query.accountName}});
                }
            }
        }
    });

    module.exports = VueComponent;
});