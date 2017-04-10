//placeinfo.js
define(function (require,exports,module) {
    var service = require('../lib/service');

    module.exports = {
    	GetClassList: service({
    	    url: 'Class/GetClassList'
    	}),
    	GetClassInfo: service({
    		url: 'Class/GetClassInfo'
    	}),
    	GetCustomersByUser: service({
    		url: 'Class/GetCutomersByUser'
    	}),
        AddEmployee: service({
            url: 'Class/AddEmployee',
            type: 'POST'
        }),
        CreateOrder: service({
            url: 'Class/CreateOrder',
            type: 'POST'
        }),
        DeleteEmployee: service({
            url: 'Class/DelEmployee',
            type: 'POST'
        })
    };
});