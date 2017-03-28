// index.js教练列表
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
        css = require("./css.html"),
        cssCompare = require("compire-css"),
    	coachService = require('../../service/coach'),
    	list = require('../components/list/index'),
    	search = require('../components/search/index'),
    	tablist = require('../components/tablist/index');

    var VueComponent = Vue.extend({
        template: sTpl + cssCompare(css),
        data: function(){
        	return {
        		coachList: [],
                places: [],
        		search: "教练",
                coachId: 0,
                sportType: 1,
                page: 1,
                hasMore: true,
                keyword: "",
                showCover: false
        	}
        },
        components: {
        	"list": list,
        	"search": search,
        	"tablist": tablist
        },
        ready: function(){
            this.getCoachList();
        },
        watch: {
            sportType: function(){
                this.page = 1;
                this.getCoachList();
            }
        },
        events: {
            selectItem: function(item){
                this.coachId = item.id;
                this.sportType = item.sporttype;

                this.$router.go({path:'/coachinfo',name: 'coachinfo', query: {Id: this.coachId, sportType: this.sportType, accountName: this.$route.query.accountName}});
                // coachService.GetCoachPlace({
                //     coachId: item.id
                // }).then(function(data){
                //     this.places = data;
                //     if(data.length == 1){
                //         this.selectPlace(data[0].id);
                //     }
                //     this.showCover = true;
                // }.bind(this));
            },
            selectSportType: function(item){
                this.sportType = item.id;
            },
            getList: function(){
                this.getCoachList();
            },
            search: function(key){
                this.keyword = key;
                this.page = 1;
                this.getCoachList();
            }
        },
        methods: {
            getCoachList: function(){
                coachService.GetCoachList({
                    spid: __spid,
                    page: this.page,
                    sportType: this.sportType,
                    key: this.keyword
                }).then(function(data){
                    var arr = [];
                    data && data.items.length && data.items.forEach(function(item){
                        arr.push({
                            id: item.ACoachId,
                            title: item.ACoachName,
                            des: item.AIntroduction,
                            imgPath: item.APic,
                            sporttype: item.ASportType,
                            hasbtn: false
                        });
                    });
                    this.coachList = arr;
                    this.hasMore = data.hasMore;
                }.bind(this));
            },
            closeCover: function(){
                this.showCover = false;
            }
        }
    });

    module.exports = VueComponent;
});