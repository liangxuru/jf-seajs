// 列表
define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        cssCompare = require("compire-css");

    var list = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: {
            hasMore: {
              type: Boolean,
              default: true
            },
            items: {
                type: Array,
                default: []
            },
            page: {
                type: Number,
                default: 1
            }
        },
        data: function() {
            return {
                list: [],
                limit: 10,
                imgServer: __imgServer,
            };
        },
        watch: {
            page: function(){
                this.get();
            },
            items: function(){
                if(this.page === 1){
                    this.list = this.items;
                }else{
                    this.list = this.list.concat(this.items);
                }
            }
        },
        methods: {
        	get: function(){
                this.$dispatch("getList", this.page);
            },
            selectItem: function(item, event){
                this.$dispatch("selectItem", item);
            },
            // 触发加载更多
            dispatchLoad () {
                if(this.hasMore){
                    var dscrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                      if (document.documentElement.offsetHeight <= (dscrollTop + window.innerHeight + 50)) {
                        
                        this.page++;
                    }
                }
            }
        },
        ready: function(){
            var self = this;
            setTimeout(function(){
                window.addEventListener('scroll', self.dispatchLoad, false);
            }, 0);
            // var self = this;
            // $(document).scroll(function () {
            //     if(self.hasMore){
            //         var scrollTop = $(this).scrollTop();
            //         var scrollHeight = $(document).height();
            //         var windowHeight = $(this).height();
            //         if (scrollTop + windowHeight == scrollHeight) {
            //             self.page++;
            //         }
            //     }
            // });
        }
    });

    module.exports = list;
});