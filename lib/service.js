// page.js基础页
define(function (require,exports,module) {
    var VueResource = require('./vue-resource.min.js');
    var MyPromise = require('./promise');
    var message = require('./message');

    module.exports = function(config){
    	return function(params, data, nocache){

    		loading = true;
    		var mypromise = new MyPromise();
    		var promise = Vue.http({
    			url: getServerURL() + 'api/' + config.url,
    			params: params,
    			method: config.type || 'get',
                data: data
    		});

    		promise.then(function(response){
    			//成功
                var response = JSON.parse(response.data);
                if(response.status == 1){
                    mypromise.resolve(response.data);
                }else{
                    message.error(response.massage);
                }
    			
    		}, function(response){
    			//失败
                message.error(response.statusText);
    		});
    		promise.catch(function(response){
    			message.error(response.statusText);
    		});
    		promise.finally(function(){
    			loading = false;
    		});

    		return mypromise;
    	}
    };
});