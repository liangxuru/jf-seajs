define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        cssCompare = require("compire-css"),
        classService = require('../../../service/class'),
        message = require('../../../lib/message');

    var options = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["customers"],
        data: function(){
        	return {
                covershow: false,
                name: '',
                sex: 1,
                phone: '',
                idno: ''
        	}
        },
        methods: {
        	closeCover: function(){
        		this.covershow = false;
        	},
            addEmploy: function(){
                this.covershow = true;
            },
            submit: function(){
                if(this.name.length==0){
                    message.error("姓名不能为空");
                    return;
                }
                if(!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(this.idno)){
                    message.error("身份证格式有误");
                    return;
                }

                var self = this;
                classService.AddEmployee({name: this.name, sex: this.sex, phone: this.phone, idno: this.idno, memid: getCurrentData().userData.memID,bid: getCurrentData().businessID,spid: __spid}).then(function(data){
                    self.covershow = false;
                    message.success(data.message);
                    self.$dispatch("render");
                });
            },
            select: function(customer){
                customer.AStatus = 3- customer.AStatus;
                this.$dispatch("choose");
            },
            delCustomer: function(customer){
                classService.DeleteEmployee({ id: customer.AId }).then(function(data){
                    message.success(data.message);
                    this.$dispatch("render");
                }.bind(this));
            }
        },
        filters: {
            idformat: function(value){
                if(value){
                    return value.replace(/^(\d{3})(.*)(\d{4})$/, '$1***$3');
                }else{
                    return '';
                }
            },
            ageformat: function(value){
                if(value){
                    var now = new Date();
                    var ym = value.match(/^\d{6}(\d{4})(\d{2})/);
                    return now.getFullYear()-ym[1] - 0 - (now.getMonth()- ym[2]>-1?1:0);
                }else{
                    return '';
                }
            }
        }
    });

    module.exports = options;
});