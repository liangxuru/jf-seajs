//支付
define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        placeService = require('../../../service/place'),
        cssCompare = require("compire-css");
    var payment = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["items"],
        data: function(){
            return {
                customer: {},
                ABalance: 0,
                cardPrice: 0,
                wxPrice: 0,
                amount: 0,
                discount: 0,
                total: [0, 0],
                zhekou: [0, 0]
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
                var self = this;
                self.total = [0, 0];
                this.items.map(function(item){
                    item.resource.map(function(it){
                        if(it.AStatus === 2){
                            if(it.AOccupiedFrom === 2){
                                self.total[1] += it.APrice;
                            }else{
                                self.total[0] += it.APrice;
                            }
                        }
                    });
                });
                this.amount = this.total[0] + this.total[1];
                this.zhekou.$set(0,(this.customer && (this.total[0]*(1-this.customer.levelZheKou)).toFixed(2) || 0 ) - 0);
                this.zhekou.$set(1, (this.customer && (this.total[1]*(1-(this.customer.companyInfo && this.customer.companyInfo[0] && this.customer.companyInfo[0].shopZheKou || 0))).toFixed(2) || 0 ) - 0);
                this.discount = this.zhekou[0] +  this.zhekou[1];
                this.cardPrice = Math.min(this.amount - this.discount, this.ABalance);
                this.wxPrice = (this.amount - this.discount - this.cardPrice).toFixed(2) - 0;
            },
            submit: function(){
                this.$dispatch("submit", this.cardPrice>0, this.wxPrice>0);
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