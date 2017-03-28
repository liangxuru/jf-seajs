/**
 * Created by zackey on 2016/5/28.
 */
define(function (require,exports,module) {
    // require("components/menu.js"); //导航

    // 路由器需要一个根组件。
    var App = Vue.extend({});

    // 创建一个路由器实例
    var router = new VueRouter();

    // 定义路由规则
    router.map({
        '/home': {
            docTitle: '主页',
            component: function (resolve) {
                require.async(['./home/index.js'],resolve);
            }
        },
        '/my/:accountName': {
            name: "my",
            docTitle: '我的信息',
            component: function (resolve) {
                require.async(['./my/index.js'],resolve);
            }
        },
        '/amount/:fundType/:fid/:name/:amount': {
            docTitle: '余额信息',
            component: function(resolve){
                require.async(['./amount/index.js'],resolve);
            }
        },
        '/place': {
            name: "place",
            docTitle: '场地类型',
            component: function (resolve) {
                require.async(['./place/index.js'],resolve);
            }
        },
        '/placelist/:SportsType/:accountName': {
            name: "placelist",
            docTitle: '场地列表',
            component:function (resolve) {
                require.async(['./placelist/index.js'],resolve);
            }
        },
        // '/placeinfo/:productId/:accountName': {
        //     name: "placeinfo",
        //     docTitle: '场地详情',
        //     component: function (resolve) {
        //         require.async(['./placeinfo/index.js'],resolve);
        //     }
        // },
        '/placeinfo/:SportsType/:accountName': {
            name: "placeinfo",
            docTitle: '场地详情',
            component: function (resolve) {
                require.async(['./placeinfo/index.js'],resolve);
            }
        },
        '/placebook/:productId/:date/:accountName': {
            name: "placebook",
            docTitle: '场地预订',
            component: function (resolve) {
                require.async(['./placebook/index.js'],resolve);
            }
        },
        '/placeorder/:accountName': {
            name: "placeorder",
            docTitle: '场地下单',
            component: function (resolve) {
                require.async(['./placeorder/index.js'],resolve);
            }
        },
        '/orderlist/:accountName': {
            name: "orderlist",
            docTitle: '订单列表',
            component: function (resolve) {
                require.async(['./orderlist/index.js'],resolve);
            }
        },
        '/success/:orderCode/:accountName': {
            name: "success",
            docTitle: '成功页',
            component: function (resolve) {
                require.async(['./success/index.js'],resolve);
            }
        },
        '/orderinfo/:orderCode/:accountName': {
            name: "orderinfo",
            docTitle: '订单详情',
            component: function(resolve){
                require.async(['./orderinfo/index.js'], resolve);
            }
        },
        '/classlist/:accountName': {
            name: "classlist",
            docTitle: '课程列表',
            component:function (resolve) {
                require.async(['./classlist/index.js'],resolve);
            }
        },
        '/classinfo/:Id/:accountName': {
            name: "classinfo",
            docTitle: '课程详情',
            component: function (resolve) {
                require.async(['./classinfo/index.js'],resolve);
            }
        },
        '/classbook/:Id/:accountName': {
            name: "classbook",
            docTitle: '确认订单',
            component: function (resolve) {
                require.async(['./classbook/index.js'],resolve);
            }
        },
        '/coachlist/:accountName': {
            name: 'coachlist',
            docTitle: '教练列表',
            component:function (resolve) {
                require.async(['./coachlist/index.js'],resolve);
            }
        },
        '/coachinfo/:Id/:sportType/:accountName': {
            name: "coachinfo",
            docTitle: '教练详情',
            component: function (resolve) {
                require.async(['./coachinfo/index.js'],resolve);
            }
        },
        '/locklist/:accountName': {
            name: "locklist",
            docTitle: '包场列表',
            component: function (resolve) {
                require.async(['./locklist/index.js'],resolve);
            }
        },
        '/lockinfo/:Id/:accountName': {
            name: "lockinfo",
            docTitle: '包场详情',
            component: function(resolve){
                require.async(['./lockinfo/index.js'], resolve);
            }
        },
    });

    router.redirect({
        '/': '/place'
    });

    router.afterEach(function(transition){
        document.title = transition.to.docTitle;
    });

    // 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上。
    router.start(App, '#app');
});