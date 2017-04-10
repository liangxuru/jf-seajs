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
        watch: {
            items: function(){
                this.calculate();
            }
        },
        methods: {
            selectCard: function(){
                if(this.cardPrice){
                    this.cardPrice = 0;
                }else{
                    if(this.amount - this.discount>5000 && this.ABalance<5000){
                        //卡里钱不足抵扣
                        this.cardPrice = 0;
                    }else{
                        this.cardPrice = Math.min(this.ABalance, this.amount-this.discount);
                    }
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
            selectXX: function(){
                if(this.wxPrice){
                    if(this.ABalance > this.amount - this.discount >5000){
                        this.cardPrice = this.amount-this.discount;
                        this.wxPrice = 0;
                    }else{
                        this.wxPrice = this.amount - this.discount;
                        this.cardPrice = 0;
                    }
                }
            },
            calculate: function(){
                this.amount = 0;
                this.discount = 0;
                this.items.length && this.items.map(function(item){
                    if(item.AStatus == 2){
                        this.discount += this.product.Price * (1- item.LevelZheKou);
                        this.amount += this.product.Price;
                    }
                }.bind(this));
                if(this.amount - this.discount >=5000){
                    if(this.ABalance>= this.amount - this.discount){
                        //卡里钱够用
                        this.cardPrice= this.amount- this.discount;
                        this.wxPrice = 0;
                    }else{
                        this.wxPrice = this.amount - this.discount;
                        this.cardPrice = 0;
                    }
                }else{
                    this.cardPrice = Math.min(this.amount - this.discount, this.ABalance);
                    this.wxPrice = (this.amount - this.discount - this.cardPrice).toFixed(2) - 0;
                }
            },
            submit: function(){
                this.$dispatch("submit", this.cardPrice>0, this.wxPrice>0 && this.wxPrice<5000);
            }
        },
        events: {
            select: function(){
                this.$nextTick(function () {
                    this.calculate();
                });
            }
        }
    });

    module.exports = payment;
});