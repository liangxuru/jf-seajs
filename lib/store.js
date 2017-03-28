// 本地存储
define(function (require,exports,module) {
	var store,
		win = window,
		localStorageName = 'localStorage',
		storage;
	
	if (localStorageName in win && win[localStorageName]) {
		storage = win[localStorageName];
		store = {
			get: function (key) {
				var config = storage.getItem(key);
				if(config && (config = JSON.parse(config))){
					return config;
				}else{
					return {};
				}
			},
			set: function (key, val) {
				try{
					storage.setItem(key, JSON.stringify(val));
				}catch(e){}
			},
			remove: function (key) {
				storage.removeItem(key);
			}
		};
	}

	module.exports = store;
});