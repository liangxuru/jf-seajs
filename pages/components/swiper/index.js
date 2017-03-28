//幻灯片
define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        cssCompare = require("compire-css"),
        image = require('../../../lib/swiper');
    
    var swiper = Vue.extend({
        template: cssCompare(css) + sTpl,
        data: function(){
        	return {
        		widthSize: document.body.offsetWidth,
                imgServer: __imgServer
        	};
        },
        props: ["items"],
        events: {
            imageready: function(){
                this.$nextTick(function(){
                    image.init({
                        target:$('.carousel-image'),
                        num:$('.carousel-num')
                    });
                })
            }
        }
    });

    module.exports = swiper;
});