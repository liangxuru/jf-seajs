// 订单详情
define(function (require, exports, module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
    	cssCompare = require("compire-css"),
    	orderService = require('../../service/order'),
        message = require('../../lib/message');

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        data: function () {
            return {
                order: {},
                imgServer: __imgServer,
                thumbnailPath: ""
            }
        },
        ready: function () {
            orderService.GetLockInfo({
                Id: this.$route.query.Id
            }).then(function (data) {
                this.order = data;
            }.bind(this));
        }
    });

    module.exports = VueComponent;
});