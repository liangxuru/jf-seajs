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
            orderService.getOrderInfo({
                orderCode: this.$route.query.orderCode
            }).then(function (data) {
                var dic = {};
                data.OrderPrizes && data.OrderPrizes.forEach(function(item, index){
                    if(dic[item.AFeeName]){
                        dic[item.AFeeName] += item.AMoney;
                    }else{
                        dic[item.AFeeName] = item.AMoney;
                    }
                });
                data.OrderPrizes = dic;
                this.order = data;
            }.bind(this));
        },
        filters: {
            showOrderStatus: function(obj){
               
                var html = "";
                switch (obj.statusId) {
                    case 21:
                        if (obj.parentPaymentTypeID == __onlinePay && obj.payStatus == 0) {
                            html += '<span style="color:#fe5100;">等待付款</span>';
                        }
                        else {
                            html += '<span>订单待消费</span>';
                        }
                        break;
                    case 22:
                        html += '<span>订单已完成</span>';
                        break;
                    case 23:
                        html += '<span>订单已取消</span>';
                        break;
                    default:
                        break;

                }
                return html;
            },
        },
        methods: {
        	modifyDate: function(value){
                return value && value.substring(0,16).replace('T',' ')||"";
        	},
            cancelOrder: function(event, orderCode, parentCode, payStatus, parentPaymentTypeID){
                var self = this;
                orderService.CheckOrder({
                    orderCode: parentPaymentTypeID == __onlinePay && payStatus == 0? parentCode: orderCode
                }).then(function(data){
                    if(data.IsCanCancel){
                        //可以取消
                        if(data.Message.length){
                            layer.open({
                              title: ['确认取消订单?', 'background-color: #6cd9fd;color:#fff;'] ,
                              content: data.Message,
                              btn: ["确定","关闭"],
                              yes: function(index){
                                layer.close(index);
                                if(data.CancelType == 1)//主订单
                                {
                                    cancel(parentCode, 1);
                                }else{
                                    cancel(orderCode, 2);
                                }
                              }
                            });
                        }else{
                            layer.open({
                              content: "确认取消订单?",
                              btn: ["确定","关闭"],
                              yes: function(index){
                                layer.close(index);
                                if(data.CancelType == 1)//主订单
                                {
                                    cancel(parentCode, 1);
                                }else{
                                    cancel(orderCode, 2);
                                }
                              }
                            });
                        }
                    }else{
                        //不可以取消，提示原因
                        layer.open({
                          title: ['订单不允许取消', 'background-color: #6cd9fd;color:#fff;'] ,
                          content: data.Message,
                          btn: "关闭"
                        });
                    }
                }.bind(this));

                function cancel(orderCode, cancelType){
                    orderService.CancelOrder({
                        orderCode: orderCode,
                        cancelType: cancelType,
                        memId: getCurrentData().userData.memID
                    }).then(function(data){
                        if(data){
                           message.success("取消成功"); 
                           self.order.statusId = 23;
                        }else{
                            message.error("取消失败");
                        }
                    }.bind(this));
                }

                event.preventDefault();
            },
            payAgin: function(orderCode){
                //未支付,转微信
                var current = getCurrentData();
                var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + current.payAppID + "&redirect_uri=" +  encodeURIComponent(getServerURL() + "Mobile/JF/pages/wxpay.html?accountName=" + getLocalData("currentAN") + "&orderCode=" + orderCode) + "&showwxpaytitle=1&response_type=code&scope=snsapi_base&state=1#wechat_redirect";
                
                location.href = url;
                //this.getPay(orderCode, getLocalData("currentAN"), "1", getCurrentData().openID);
            },
        }
    });

    module.exports = VueComponent;
});