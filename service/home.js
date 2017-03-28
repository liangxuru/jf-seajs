// home.js
define(function (require,exports,module) {
    var service = require('../lib/service');

    module.exports = {
    	getBannerList: service({
    		url: ''
    	});
    };
});