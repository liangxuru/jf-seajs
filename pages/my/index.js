// 我的信息
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
    	cssCompare = require("compire-css"),
    	placeService = require("../../service/place");

	var time = 60,
		upOA = false;
    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        data: function(){
        	return {
        		current: getCurrentData(),
        		company: {},
        		oaBindshow: false
        	};
        },
        events: {
        	render: function(){
        		this.current = getCurrentData();
        		this.init();
        		this.bindEvent();
        	}
        },
        methods: {
        	init: function(){
        		//获取会员卡信息
	            placeService.GetMemberCardInfo({
	                memberId: this.current.userData.memID
	            }).then(function(data){
	            	var balence = data && data.ABalance || 0;
	            	$("#mpList>.wrap").html("<div class='item' data-czk='true' data-fid='0' data-amount='0' data-name='会员卡'>会员卡<span style='color:#00bcf7;font-size:1.3rem;margin-left:1rem;'>￥"+ balence.toFixed(2)+"</span></div>");
	                if(data.companyInfo && data.companyInfo.length){
	                	this.company = data.companyInfo[0];
	                }
	            }.bind(this));
        	},
            bindEvent: function(){
            	var self = this;
            	
			    $("#closeOA").click(function () {
			        $("#oaLogin>.wrap").removeClass("active");
			        setTimeout(function () {
			            $("#oaLogin").removeClass("active");
			        }, 310);
			    });

			    $("#infoPage li[data-ref]").bind("click", function (e) {
			        var text=$(this).text();
			        __log.addEvent("点击了" + text);
			        self.$router.go({path:'/'+ $(this).data("ref"),name: $(this).data("ref"), query: {accountName: getLocalData("currentAN")}});
		        });

			    $("li.mp").bind("click", function (e) {
			        __log.addEvent("点击了" + $(this).text());
			        $("#mpList").addClass("active");
			        setTimeout(function () {
			            $("#mpList>.wrap").addClass("active");
			        }, 10);
			    });

			    $("#mpList").bind("click", function (e) {
			        $("#mpList>.wrap").removeClass("active");
			        setTimeout(function () {
			            $("#mpList").removeClass("active");
			        }, 300);
			    });

			    $("#mpList .item").bind("click", function (e) {
			        e.stopPropagation();
			        var current = getCurrentData();
			        var fid = $(this).data("fid");
			        var fundType = $(this).data("czk") ? 0 : 2;
			        var amount = $(this).data("amount");
			        var name = $(this).data("name");
			        __log.addEvent("点击了" + name);
			        self.$router.go({path:'/amount',name: 'amount', query: {accountName: getLocalData("currentAN"), fundType: fundType, fid: fid, name: name, amount: amount}});
			    });

			    $("#exit").bind("click", function (e) {
			        __log.addEvent("点击了" + $(this).text());
			        showConfirm("确认退出当前账户吗？", function () {
			            var url = abPath + "/api/User/Exit";
			            __log.addEvent("发起退出登录请求,Url:" + url);
			            loading(true);
			            $.ajax({
			                type: 'get',
			                url: url,
			                dataType: "json",
			                data: { openID: getCurrentData().openID },
			                success: function (result) {
			                    loading(false);
			                    result = JSON.parse(result);
			                    if (result.Result && result.Data) {
			                        __log.addEvent("退出登录请求成功");
			                        updateUserData();
			                    }
			                    else {
			                        __log.addEvent("退出登录请求失败:" + result.Message);
			                        showMsg("退出失败：" + result.Message);
			                    }
			                },
			                error: function () {
			                    loading(false);
			                    __log.addEvent("退出登录请求异常");
			                    showMsg("退出发生异常!");
			                }
			            });
			        })
			    });

				function loading(status) {
				    if ($(".mLoading").length == 0) {
				        $("body").append('<div class="mLoading"><span class="anchor"></span><div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div>');
				    }
				    if (status) {
				        $(".mLoading").show();
				    }
				    else {
				        $(".mLoading").hide();
				    }
				}

				$("#doLogin").bind("click", function () {
				    $(this).prop("disabled", true);
				    var target = $("#inner:visible");
				    var oaID = $.trim(target.find("#oaID").val());
				    if (!oaID) {
				        showMsg("请输入OA号", "", function () {
				            target.find("[name='oaID']").focus();
				        });
				        return;
				    }
				    
				    var oaPwd = $.trim(target.find("#oaPwd").val());
				    if (!oaPwd) {
				        showMsg("请输入OA密码", "", function () {
				            target.find("[name='oaPwd']").focus();
				        });
				        return;
				    }
				    oaPwd = encodeURIComponent(oaPwd);
				    __log.addEvent("点击了OA登陆");
				    var url = abPath + "/api/User/OALogin_JF?oa=" + oaID + "&pwd=" + oaPwd + "&an=" + getLocalData("currentAN")+"&memberId="+ getCurrentData().userData.memID;
				    __log.addEvent("发起OA登陆请求,Url:" + url);
				    loading(true);
				    $.ajax({
				        type: 'get',
				        url: url,
				        dataType: "json",
				        success: function (resultStr) {
				            loading(false);
				            var result = JSON.parse(resultStr);
				            if (result.Result) {
				            	var _data = JSON.parse(result.Data);
				            	if(_data.Status!=200){
				            		showMsg("OA登陆失败!," + _data.Message);
				            	}else{
				            		var jpUrl = getServerURL() + "Mobile/jf/pages/index.html#!/my/:accountName/?accountName=" + getLocalData("currentAN");
                                
				            		location.href = jpUrl;
				            		location.reload();
				            	}
				                __log.addEvent("发起OA登陆请求成功");
				            }
				            else {
				                __log.addEvent("发起OA登陆请求失败:" + url);
				                showMsg("OA登陆失败!," + result.Message);
				            }
				        },
				        error: function () {
				            loading(false);
				            $("#doLogin").prop("disabled", false);
				            __log.addEvent("发起OA登陆请求异常");
				            showMsg("OA登陆异常!");
				        }
				    });
				});

				
            },
            bindOA: function(){
            	this.oaBindshow = true;
            }
        },
        ready: function(){
        	this.$emit("render");
        }
    });
	
    module.exports = VueComponent;
});