// 教练详情
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
    	cssCompare = require("compire-css"),
    	swiper = require("../components/swiper/index"),
        coachService = require('../../service/coach'),
    	classService = require('../../service/class'),
        tab = require('../components/tab/index');

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        components: {
        	"swiper": swiper,
            "tab": tab
        },
        data: function() {
        	return {
                current: 1,
                classList: [],
                info: {},
                imgServer: __imgServer
	        }
        },
        init: function(){
            coachService.GetCoachInfo({
                id: this.$route.query.Id
            }).then(function(data){
                this.info = data;
            }.bind(this));
            classService.GetClassList({
                spid: __spid,
                coachId: this.$route.query.Id,
                sporttype: this.$route.query.sportType
            }).then(function(data){
                this.classList = data.CCMList;
                this.price = data.Price;
            }.bind(this));
        },
        events: {
            select: function(value){
                this.current = value;
            }
        },
        methods: {
            com_status: function(value){
                return value==1?'班课':(value==2?'1对N':'月卡')
            },
            getList: function(){
                this.getCoachList();
            },
            search: function(key){
                this.keyword = key;
                this.page = 1;
                this.getCoachList();
            }
        }
    });

    module.exports = VueComponent;
});