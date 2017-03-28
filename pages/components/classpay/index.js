//支付
define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        placeService = require('../../../service/place'),
        cssCompare = require("compire-css");
    var payment = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["items", "product"],
        data: function(){
            return {
                customer: {},
                ABalance: 0,
                cardPrice: 0,
                wxPrice: 0,
                amount: 0,
                discount: 0
            }
        },
        ready: function(){
            //获取会员卡信息
            placeService.GetMemberCardInfo({
                memberId: getCurrentData().userData.memID
            }).then(function(data){
                this.customer = data;
                this.ABalance = this.customer && this.customer.ABalance || 0;
                this.calculate();
            }.bind(this));
        },
        methods: {
            selectCard: function(){
                if(this.cardPrice){
                    this.cardPrice = 0;
                }else{
                    this.cardPrice = Math.min(this.ABalance, this.amount-this.discount);
                }
                this.wxPrice = this.amount - this.discount - this.cardPrice;
            },
            selectWx: function(){
                if(this.wxPrice){//选中变为非选
                    if(this.ABalance < this.amount - this.discount){
                        this.cardPrice = 0;
                    }
                    this.wxPrice = this.amount - this.discount - this.cardPrice;
                }else{
                    this.wxPrice = this.amount - this.discount;
                    this.cardPrice = 0;
                }
            },
            calculate: function(){
                this.amount = 0;
                this.discount = 0;
                this.items.map(function(item){
                    if(item.AStatus == 2){
                        this.discount += this.product.Price * (1- item.discount);
                        this.amount += this.product.Price;
                    }
                }.bind(this));
                this.cardPrice = Math.min(this.amount - this.discount, this.ABalance);
                this.wxPrice = (this.amount - this.discount - this.cardPrice).toFixed(2) - 0;
            },
            submit: function(){
                this.$dispatch("submit", this.cardPrice>0, this.wxPrice>0);
            }
        },
        events: {
            select: function(){
                this.calculate();
            }
        }
    });

    module.exports = payment;
});