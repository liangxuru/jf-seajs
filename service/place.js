//placeinfo.js
define(function (require,exports,module) {
    var service = require('../lib/service');

    module.exports = {
    	GetWeekdays: service({
    	    url: 'Ground/GetWeekdays'
    	}),
        GetProductsBySportType: service({
            url: 'Ground/GetProductsBySportType'
        }),
    	GetPrductById: service({
    		url: 'Ground/GetProductById'
    	}),
    	GetResourcePrice: service({
    		url: 'Ground/GetResourcePrice'
    	}),
    	GetMemberCardInfo: service({
    		url: 'Ground/GetMemberCardInfo'
    	})
    };
});