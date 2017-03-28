//placeinfo.js
define(function (require,exports,module) {
    var service = require('../lib/service');

    module.exports = {
    	GetCoachList: service({
    	    url: 'Coach/GetCoachList'
    	}),
    	GetCoachPlace: service({
    	    url: 'Coach/GetCoachPlace'
    	}),
    	GetCoachInfo: service({
    		url: 'Coach/GetCoachInfo'
    	})
    };
});