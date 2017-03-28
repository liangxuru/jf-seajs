// 场地列表
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
    	placeService = require('../../service/place'),
    	cssCompare = require("compire-css");

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        data: function(){
        	return {
        		productList: []
        	}
        },
        ready: function(){
            placeService.GetProductsBySportType({
        		SportType: this.$route.query.SportsType,
                spid: __spid
        	}).then(function(data){
        		this.productList = data;
        		if(this.productList && this.productList.length > 0){
                    //location.href = "/mobile/jf/pages/index.html#!/placeinfo/:productId/:accountName?accountName=" + this.$route.query.accountName+"&productId="+ this.productList[0].AProductId;
                    // this.$router.redirect("/placeinfo/:productId/:accountName?accountName=" + this.$route.query.accountName+"&productId="+ this.productList[0].AProductId);
        			this.$router.go({path:'/coachinfo',name: 'coachinfo', query: {productId: this.productList[0].AProductId, accountName: this.$route.query.accountName}});
        		}
        	}.bind(this));
        }
    });

    module.exports = VueComponent;
});