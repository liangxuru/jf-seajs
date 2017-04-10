// 主页
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
    	cssCompare = require("compire-css"),
    	swiper = require("../components/swiper/index");

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        components: {
        	"swiper": swiper
        },
        data: function(){
        	return {
        		imgs: [{
        			id: 1,
        			url: '../resource/banner.png',
                    Absolute: true
        		},{
        			id: 2,
        			url: '../resource/Bitmap3.png',
                    Absolute: true
        		}],
                showYue: false,
                accountName: ''
        	};
        },
        methods: {
            showCover: function(){
                this.showYue = true;
            },
            closeCover: function(){
                this.showYue = false;
            }
        },
        ready: function(){
            this.accountName = this.$route.query.accountName;
        }
    });

    module.exports = VueComponent;
});