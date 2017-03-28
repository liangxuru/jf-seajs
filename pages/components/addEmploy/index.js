define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        cssCompare = require("compire-css"),
        classService = require('../../../service/class');

    var options = Vue.extend({
        template: cssCompare(css) + sTpl,
        data: function(){
        	return {
                covershow: false,
                customers: []
        	}
        },
        methods: {
        	closeCover: function(){
        		this.covershow = false;
        	},
            addEmploy: function(){
                this.covershow = true;
            },
            select: function(customer){
                customer.AStatus = 3- customer.AStatus;
                this.$dispatch("choose");
            }
        },
        ready: function(){
            classService.GetCustomersByUser({
                memberId: getCurrentData().userData.memID
            }).then(function(data){
                data.map(function(item){
                    item.AStatus = 2;
                });
                this.customers = data;
                this.$dispatch("employInit", this.customers);
            }.bind(this));
        },
        filters: {
            idformat: function(value){
                return value.replace(/^(\d{3})(.*)(\d{4})$/, '$1***$3');
            }
        }
    });

    module.exports = options;
});