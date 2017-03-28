//order.js
define(function (require,exports,module) {
    var service = require('../lib/service');

    module.exports = {
    	GetOrderList: service({
    	    url: 'Ground/GetOrderList'
    	}),
    	CreateOrder: service({
    		type: 'POST',
    		url: 'Ground/CreateOrder'
    	}),
        CheckOrder: service({
            url: 'Ground/CheckOrder'
        }),
    	CancelOrder: service({
    		url: 'Ground/CancelOrder'
    	}),
        getOrderInfo: service({
            url: 'Ground/getOrderInfo'
        }),
        GetLockList: service({
            url: 'Ground/GetLockList'
        }),
        GetLockInfo: service({
            url: 'Ground/GetLockInfo'
        })
    };
});