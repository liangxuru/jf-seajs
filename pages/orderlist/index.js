
// 订单列表
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
    	tab = require('../components/tab/index'),
        orderService = require('../../service/order'),
    	cssCompare = require("compire-css"),
        message = require('../../lib/message'),
        loading = require('../components/loading/index');
        // swiperout = require('../../lib/swiperout');

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        components: {
        	"tab": tab,
            "loading": loading
        },
        data: function(){
            return {
                current: 0,
                resource: [{pgNo:1, pgSize: 50, rawItems: [], items: [], hasMore: true},{pgNo:1,pgSize: 10, rawItems: [], items: [], hasMore: true},{pgNo:1,pgSize: 50, rawItems: [], items: [], hasMore: true},{pgNo:1, rawItems: [], items: [], hasMore: true}],
                imgServer: __imgServer,
                accountName: '',
                loading: false
            };
        },
        ready: function(){
            // swiperout();
            this.accountName = this.$route.query.accountName;
            this.getOrderList();
            var self = this;
            $(window).scroll(function () {
                var scrollTop = $(this).scrollTop();
                var scrollHeight = $(document).height();
                var windowHeight = $(this).height();
                if (scrollTop + windowHeight == scrollHeight) {
                    //此处是滚动条到底部时候触发的事件，在这里写要加载的数据，或者是拉动滚动条的操作
                    self.resource[self.current].pgNo++;
                    self.getOrderList();
                }
            });
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
            getOrderList: function(){
                if(this.resource[this.current].hasMore){
                    this.loading = true;
                    orderService.GetOrderList({
                        pageNo: this.resource[this.current].pgNo,
                        PageSize: this.resource[this.current].pgSize,
                        memID: getCurrentData().userData.memID,
                        status: this.current+1
                    }).then(function(data){
                        this.resource[this.current].rawItems = this.resource[this.current].rawItems.concat(data.Orders);
                        this.loading = false;
                        if(this.resource[this.current].pgSize*this.resource[this.current].pgNo >= data.TotalCount){
                            this.resource[this.current].hasMore = false;
                        }
                        this.$emit("render");
                    }.bind(this));
                }
            },
            cancelOrder: function(event, orderCode, parentCode, payStatus, parentPaymentTypeID){
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
                });

                function cancel(orderCode, cancelType){
                    orderService.CancelOrder({
                        orderCode: orderCode,
                        cancelType: cancelType,
                        memId: getCurrentData().userData.memID
                    }).then(function(data){
                        if(data){
                           message.success("取消成功");
                           var jpUrl = getServerURL() + "Mobile/jf/pages/index.html#!/orderlist/:accountName/?accountName=" + getLocalData("currentAN");
                           location.href = jpUrl;
                           location.reload();
                        }else{
                            message.error("取消失败");
                        }
                    });
                }

                event.preventDefault();
            },
            onScroll: function(event){
              var offsetHeight = event.currentTarget.offsetHeight,
              scrollHeight = event.target.scrollHeight,
              scrollTop = event.target.scrollTop,
              scrollBottom = offsetHeight + scrollTop;
              if(scrollTop===0)
              {
                if(this.resource[this.current].pgNo===1)
                {
                  return;
                }
                this.resource[this.current].pgNo--;
                this.changePgItems();
                event.target.scrollTop=offsetHeight-1;
              }
              if(scrollBottom===scrollHeight || scrollBottom===scrollHeight+2)
              {
                this.resource[this.current].pgNo++;
                this.getOrderList();
                if(this.resource[this.current].pgNo==Math.ceil(this.resource[this.current].rawItems.length/this.resource[this.current].pgSize))
                {
                  return;
                }
                event.target.scrollTop=1;
              }
            },
            changePgItems: function(){
              var start = (this.resource[this.current].pgNo-1) * this.resource[this.current].pgSize,
              items = this.resource[this.current].rawItems.slice(start,this.resource[this.current].pgSize+((this.resource[this.current].pgNo-1)*this.resource[this.current].pgSize));
              this.resource[this.current].items = items;
            },
            payAgin: function(orderCode){
                //未支付,转微信
                var current = getCurrentData();
                var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + current.payAppID + "&redirect_uri=" +  encodeURIComponent(getServerURL() + "Mobile/JF/pages/wxpay.html?accountName=" + getLocalData("currentAN") + "&orderCode=" + orderCode) + "&showwxpaytitle=1&response_type=code&scope=snsapi_base&state=1#wechat_redirect";
                
                location.href = url;
            },
        },
        events: {
            select: function(value){
                this.current = value;
                if(!this.resource[this.current].rawItems.length){
                    this.getOrderList();
                }else{
                    this.resource[this.current].pgNo = 1;
                    this.changePgItems();
                }
            },
            render: function(){
                this.changePgItems();
            }
        }
    });

    module.exports = VueComponent;
});