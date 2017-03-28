// 余额
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
    	cssCompare = require("compire-css");

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        data: function(){
        	return {

        	}
        },
        ready: function(){
            this.getData();
            this.bindEvent();
        },
        methods: {
        	getData: function(pageNo) {
		    if ($(".mLoading:visible").length == 1) {
		        return;
		    }
		    var amount = getArgs("amount");
		    var name = getArgs("name");
		    $(".name").html(name + "余额");
		    $(".amount>i").html((amount-0).toFixed(2));
		    var fundType = getArgs("fundType");
		    var fid = getArgs("fid");
		    var current = getCurrentData();
		    currentPage = pageNo ? pageNo : currentPage + 1;
		    currentType = $(".menu.active").data("type");
		    var url = abPath + "/api/User/GetTradeRecord?pageNo=" + currentPage + "&pageSize=" + __pageSize + "&memID=" + current.userData.memID + "&fid=" + fid + "&type=" + currentType + "&fundType=" + fundType;
		    __log.addEvent("发起获取资金明细请求,Url:" + url);
		    loading(true);
		    $.ajax({
		        type: "get",
		        url: url,
		        success: function (data, textStatus, jqXHR) {
		            loading(false);
		            var result = $.parseJSON(data);
		            if (result.Result) {
		                __log.addEvent("获取资金明细请求成功");
		                template.config("escape", false);
		                var html = template('item' + currentType, result.Data.List);
		                if (currentPage == 1) {
		                    $(".mDiv>ul").html(html);
		                    $(".mDiv").scrollTop(0);
		                }
		                else {
		                    $(".mDiv>ul").append(html);
		                }
		                if (result.Data.List.length < __pageSize) {
		                    hasMoreData = false;
		                    $(".mDiv>ul").append("<div class='noData'>没有更多数据</div>");
		                }
		                else {
		                    hasMoreData = true;
		                }
		            }
		            else {
		                __log.addEvent("发起获取资金明细请求失败：" + result.Message);
		                showTip("获取记录失败：" + result.Message);
		            }
		        },
		        error: function () {
		            loading(false);
		            __log.addEvent("发起获取资金明细请求异常");
		            showTip("获取记录异常！");
		        }
		    });
		},
		bindEvent: function() {
		    $(".mDiv ul").bind("scroll touchmove", debounce(function (e) {
		        if ($(this).scrollTop() + $(this)[0].offsetHeight > $(this)[0].scrollHeight - 250 && hasMoreData) {
		            __log.addEvent("滚动加载资金明细列表");
		            getData();
		        }
		    }, 10));
		    $(".menu").bind("click", function (e) {
		        __log.addEvent("点击了"+$(this).text());
		        $(".menu").removeClass("active");
		        $(this).addClass("active");
		        getData(1)
		    });
		    var fundType = getArgs("fundType");
		    var current = getCurrentData();
		    if (fundType == 0 && current.aType != "self") {
		        $(".btn").show();
		        $(".btn").bind("click", function (e) {
		            var current = getCurrentData();
		            var url="https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + current.payAppID + "&redirect_uri=" + getServerURL() + "Mobile/shop/common/recharge.html?accountName=" + getLocalData("currentAN") + "&showwxpaytitle=1&response_type=code&scope=snsapi_base&state=1#wechat_redirect";
		            __log.addEvent("点击了充值,跳转Url:"+url);
		            window.location = url;
		        })
		    }
		}
        }
    });

    module.exports = VueComponent;
});