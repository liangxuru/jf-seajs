// index.js课程列表
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	classService = require('../../service/class'),
    	list = require('../components/list/index'),
    	search = require('../components/search/index'),
    	tablist = require('../components/tablist/index');

    var VueComponent = Vue.extend({
        template: sTpl,
        data: function(){
        	return {
        		classList: [],
        		search: "课程",
                sportType: 1,
                page: 1
        	}
        },
        components: {
        	"list": list,
        	"search": search,
        	"tablist": tablist
        },
        ready: function(){
            this.getClassList();
        },
        watch: {
            sportType: function(){
                this.page = 1;
                this.getClassList();
            }
        },
        events: {
            getList: function(){
                this.getClassList();
            },
            selectItem: function(item){
                this.$router.go({name: 'classinfo', query: {accountName: getLocalData("currentAN"), Id: item.id}});
            },
            selectSportType: function(item){
                this.sportType = item.id;
            },
            search: function(key){
                this.keyword = key;
                this.page = 1;
                this.getClassList();
            }
        },
        methods: {
            getClassList: function(){
                classService.GetClassList({
                    spid: __spid,
                    page: this.page,
                    sporttype: this.sportType,
                    coachId: 0
                }).then(function(data){
                    var arr = [];
                    data && data.items.length && data.items.forEach(function(item){
                        arr.push({
                            id: item.productId,
                            title: item.productName,
                            price: item.Price,
                            des: item.short_description,
                            imgPath: item.thumbnail,
                            hasbtn: true
                        });
                    });
                    this.classList = arr;
                    this.hasMore = data.hasMore;
                }.bind(this));
            }
        }
    });

    module.exports = VueComponent;
});