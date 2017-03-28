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
        		current: getCurrentData()
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
	                
	            }.bind(this));
        	},
            bindEvent: function(){
            	var self = this;
            	$(".tab>li").click(function () {
			        if ($(this).hasClass("active")) {
			            return;
			        }
			        $(".tab>li").removeClass("active");
			        $(this).addClass("active");
			        var index = $(this).index();
			        $("#oaLogin>div>div>ul").hide();
			        $("#oaLogin>div>div>ul:eq(" + index + ")").show();
			        if (index == 0) {
			            $("#doLogin").show();
			            $("#doSave").hide();
			        }
			        else {
			            $("#doLogin").hide();
			            $("#doSave").show();
			            if ($("#doSave").data("poa")) {
			                $("#doSave").data("poa","").data("pn", "");
			                $("#outer [name='pCom']").val("");
			                $("#outer [name='pDep']").val("");
			                $("#outer [name='pUnit']").val("");
			                $("#outer [name='pCenter']").val("");
			                $("#outer [name='pName']").val("");
			                $("#outer [name='pCode']").val("");
			                $("#outer [name='pStatus']").val("").removeClass("hasValue");
			            }
			        }
			    });

			    $("#outer [name='pStatus']").change(function () {
			        if ($(this).val()) {
			            $(this).addClass("hasValue");
			        }
			    });

			    $("#upCom").click(function () {
			        getMemExInfo();
			    });

			    $("#closeOA").click(function () {
			        $("#oaLogin>.wrap").removeClass("active");
			        setTimeout(function () {
			            $("#oaLogin").removeClass("active");
			        }, 310);
			    });

			    $(window).bind("hashchange", function (e) {
			        if (this.location.hash != "#update" && $("#editMobile").is(":visible")) {
			            __log.addEvent("修改电话返回我的信息");
			            $("#editMobile>.wrap").removeClass("active");
			            setTimeout(function () {
			                $("#editMobile").removeClass("active");
			                $("#infoPage").show();
			            }, 300);
			        }
			    });

			    $("#infoPage li[data-ref]").bind("click", function (e) {
			        var text=$(this).text();
			        __log.addEvent("点击了" + text);
			        self.$router.go({path:'/'+ $(this).data("ref"),name: $(this).data("ref"), query: {accountName: getLocalData("currentAN")}});
		        });

			    $(document).bind("keyup", "#registerPage input", function (e) {
			        var el = $(e.target);
			        if (el.val()) {
			            el.addClass("hasValue");
			        }
			        else {
			            el.removeClass("hasValue");
			        }
			    });

			    $(".code").bind("click", function () {
			        __log.addEvent("点击了" + $(this).text());
			        $(this).prop("disabled", true);
			        var value = $("#mobileNew").val();
			        if (!$(this).hasClass("disabled")) {
			            if (!value || isNaN(value) || value.length != 11) {
			                showMsg("请输入手机号!");
			                $(this).prop("disabled", false);
			                return;
			            }
			            timer(this);
			            var ob = { Mobile: value, AccountName: getLocalData("currentAN") };//getLocalData("accountName")
			            var url = abPath + "/api/User/SendCodeMsg";
			            __log.addEvent("发起获取验证码请求,Url:" + url);
			            $.ajax({
			                type: 'post',
			                url: url,
			                dataType: "json",
			                data: { "": JSON.stringify(ob) },
			                success: function (result) {
			                    result = JSON.parse(result);
			                    if (result.Result) {
			                        __log.addEvent("获取验证码请求成功");
			                    }
			                    else {
			                        __log.addEvent("获取验证码请求失败:" + result.Message);
			                        showMsg("获取验证码失败!," + result.Message);
			                        time = 0;
			                    }
			                },
			                error: function () {
			                    __log.addEvent("获取验证码请求异常");
			                    showMsg("获取验证码异常!");
			                    time = 0;
			                }
			            });
			        }
			    });

			    $("#doUpdate").bind("click", function () {
			        $(this).prop("disabled", true);
			        var mobile = $("#mobileNew").val();
			        if (!mobile) {
			            showMsg("请输入您的新手机号!");
			            $(this).prop("disabled", false);
			            return;
			        }
			        var code = $("#code").val();
			        if (!code) {
			            showMsg("请输入验证码!");
			            $(this).prop("disabled", false);
			            return;
			        }
			        var url = abPath + "/api/User/UpdateMobile";
			        __log.addEvent("发起更新电话号码请求,Url:" + url);
			        loading(true);
			        $.ajax({
			            type: 'get',
			            url: url,
			            dataType: "json",
			            data: { accountName: getLocalData("currentAN"), memID: getCurrentData().userData.memID, mobile: mobile,code:code},
			            success: function (result) {
			                loading(false);
			                result = JSON.parse(result);
			                if (result.Result) {
			                    __log.addEvent("更新电话号码请求成功");
			                    var jpUrl = getServerURL() + "Mobile/jf/pages/index.html#!/my/:accountName/?accountName=" + getLocalData("currentAN");
                           		location.href = jpUrl;
                           		location.reload();
			                }
			                else {
			                    $("#doUpdate").prop("disabled", false);
			                    __log.addEvent("更新电话号码请求失败" + result.Message);
			                    showMsg("修改失败!," + result.Message);
			                }
			            },
			            error: function () {
			                loading(false);
			                $("#doUpdate").prop("disabled", false);
			                __log.addEvent("更新电话号码请求异常");
			                showMsg("修改发生异常!");
			            }
			        });
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

			    function changeShop(memID) {
				    var url = abPath + "/api/User/ChangeAccount";
				    __log.addEvent("发起切换店铺请求,Url:" + url);
				    loading(true);
				    $.ajax({
				        type: 'get',
				        url: url,
				        dataType: "json",
				        data: { mobile: $.trim($("#mobile").text()), accountName: getLocalData("currentAN"), tmemID: memID, openID: getCurrentData().openID },
				        success: function (result) {
				            loading(false);
				            result = JSON.parse(result);
				            if (result.Result) {
				                __log.addEvent("切换店铺请求成功");
				                var jpUrl = getServerURL() + "Mobile/jf/pages/index.html#!/my/:accountName/?accountName=" + getLocalData("currentAN");
                           		location.href = jpUrl;
                           		location.reload();
				            }
				            else {
				                __log.addEvent("切换店铺请求请求失败" + result.Message);
				                showMsg("切换店铺请求失败!," + result.Message);
				            }
				        },
				        error: function () {
				            loading(false);
				            __log.addEvent("切换店铺请求异常");
				            showMsg("切换店铺请求异常!");
				        }
				    });
				}

				function getMemExInfo() {
				    var url = abPath + "/api/User/GetMemberEx?memID="+getCurrentData().userData.memID;
				    __log.addEvent("发起获取用户额外信息请求,Url:" + url);
				    loading(true);
				    $.ajax({
				        type: 'get',
				        url: url,
				        dataType: "json",
				        success: function (result) {
				            loading(false);
				            result = JSON.parse(result);
				            if (result.Result) {
				                __log.addEvent("获取用户额外信息请求成功");
				                if (result.Data) {
				                    var exData = result.Data;
				                    $(".tab").parent().hide();
				                    $("#inner").hide();
				                    $("#doLogin").hide();
				                    $("#outer [name='pCom']").val(exData.ACompany);
				                    $("#outer [name='pDep']").val(exData.ADepartment);
				                    $("#outer [name='pUnit']").val(exData.ABusinessUnit);
				                    $("#outer [name='pCenter']").val(exData.ACenter);
				                    $("#outer [name='pName']").val(exData.AProjectName);
				                    $("#outer [name='pCode']").val(exData.AProjectCode);
				                    $("#outer [name='pStatus']").val(exData.AProjectStatus).addClass("hasValue");
				                    $("#outer").show();
				                    $("#doSave").data("poa", getCurrentData().userData.AOa).show();
				                }
				                $("#oaLogin").addClass("active");
				                setTimeout(function () {
				                    $("#oaLogin>.wrap").addClass("active");
				                }, 10);
				            }
				            else {
				                __log.addEvent("获取用户额外信息请求失败" + result.Message);
				                showMsg("获取用户额外信息失败!," + result.Message);
				            }
				        },
				        error: function () {
				            loading(false);
				            __log.addEvent("获取用户额外信息请求异常");
				            showMsg("获取用户额外信息异常!");
				        }
				    });
				}

				function makeOuterData() {
				    var target = $("#outer:visible");
				    var obj = {
				        status: false,
				        data: {

				        }
				    };
				    if (target.length == 1) {
				        var pCom = $.trim(target.find("[name='pCom']").val());
				        if (!pCom) {
				            showMsg("请输入公司名称", "", function () {
				                target.find("[name='pCom']").focus();
				            });
				            return obj;
				        }
				        else {
				            obj.data.ACompany = pCom;
				        }
				        var pDep = $.trim(target.find("[name='pDep']").val());
				        if (!pDep) {
				            showMsg("请输入所在部门", "", function () {
				                target.find("[name='pDep']").focus();
				            });
				            return obj;
				        }
				        else {
				            obj.data.ADepartment = pDep;
				        }
				        var pUnit = $.trim(target.find("[name='pUnit']").val());
				        if (!pUnit) {
				            showMsg("请输入业务单元", "", function () {
				                target.find("[name='pUnit']").focus();
				            });
				            return obj;
				        }
				        else {
				            obj.data.ABusinessUnit = pUnit;
				        }

				        var pCenter = $.trim(target.find("[name='pCenter']").val());
				        if (!pCenter) {
				            showMsg("请输入所在中心", "", function () {
				                target.find("[name='pCenter']").focus();
				            });
				            return obj;
				        }
				        else {
				            obj.data.ACenter = pCenter;
				        }
				        var pName = $.trim(target.find("[name='pName']").val());
				        if (!pName) {
				            showMsg("请输入项目名称", "", function () {
				                target.find("[name='pName']").focus();
				            });
				            return obj;
				        }
				        else {
				            obj.data.AProjectName = pName;
				        }

				        var pCode = $.trim(target.find("[name='pCode']").val());
				        if (!pCode) {
				            showMsg("请输入项目编号", "", function () {
				                target.find("[name='pCode']").focus();
				            });
				            return obj;
				        }
				        else {
				            obj.data.AProjectCode = pCode;
				        }

				        var pStatus = $.trim(target.find("[name='pStatus']").val());
				        if (!pStatus) {
				            showMsg("请选择项目状态", "", function () {
				                target.find("[name='pStatus']").focus();
				            });
				            return obj;
				        }
				        else {
				            obj.data.AProjectStatus = pStatus;
				        }
				        obj.status = true;
				        return obj;
				    }
				    return obj;
				}

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

				$("#oaID").bind("input", function () {
				    upOA = false;
				    $("#selectInvoice").hide();
				});

				$("#doLogin").bind("click", function () {
				    $(this).prop("disabled", true);
				    var target = $("#inner:visible");
				    var oaID = $.trim(target.find("#oaID").val());
				    if (!oaID) {
				        showMsg("请输入OA号", "", function () {
				            target.find("[name='oaID']").focus();
				        });
				        return obj;
				    }
				    
				    var oaPwd = $.trim(target.find("#oaPwd").val());
				    if (!oaPwd) {
				        showMsg("请输入OA密码", "", function () {
				            target.find("[name='oaPwd']").focus();
				        });
				        return obj;
				    }
				    oaPwd = encodeURIComponent(oaPwd);
				    __log.addEvent("点击了OA登陆");
				    var url = abPath + "/api/User/OALogin?oa=" + oaID + "&pwd=" + oaPwd + "&an=" + getLocalData("currentAN");
				    __log.addEvent("发起OA登陆请求,Url:" + url);
				    loading(true);
				    $.ajax({
				        type: 'get',
				        url: url,
				        dataType: "json",
				        success: function (resultStr) {
				            loading(false);
				            $("#doLogin").prop("disabled", false);
				            var result = JSON.parse(resultStr);
				            if (result.Result) {
				                __log.addEvent("发起OA登陆请求成功");
				                var exData = JSON.parse(result.Data).Data.AExtendInfo;
				                $("#doLogin").hide();
				                $("#inner").hide();
				                $("#outer [name='pCom']").val(exData.bukrs);
				                $("#outer [name='pDep']").val(exData.dept);
				                $("#outer [name='pUnit']").val(exData.busin);
				                $("#outer [name='pCenter']").val(exData.center);
				                $("#outer [name='pName']").val("");
				                $("#outer [name='pCode']").val("");
				                $("#outer [name='pStatus']").val("").removeClass("hasValue");

				                $("#outer").show();
				                $("#doSave").data("poa", exData.pernr.trimStart("0")).data("pn", exData.nachn).show();
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

				$("#doSave").bind("click", function () {
				    $(this).prop("disabled", true);
				    var result = makeOuterData();
				    if (!result.status) {
				        $(this).prop("disabled", false);
				        return;
				    }
				    result.data.an = getLocalData("currentAN");
				    result.data.AMemberId = getCurrentData().userData.memID;
				    result.data.AOAcode = "";
				    result.data.AMemberType = 3702;
				    if($("#doSave").data("poa")){
				        result.data.AOAcode = $("#doSave").data("poa");
				        result.data.AMemberType = 3701;
				    }
				    
				    var url = abPath + "/api/User/ServiceRegister";
				    __log.addEvent("发起直通车注册请求,Url:" + url);
				    loading(true);
				    $.ajax({
				        type: 'post',
				        url: url,
				        dataType: "json",
				        data: { "": JSON.stringify(result.data) },
				        success: function (resultStr) {
				            loading(false);
				            $("#doSave").prop("disabled", false);
				            var result = JSON.parse(resultStr);
				            if (result.Result) {
				                __log.addEvent("发起直通车注册请求成功");
				                var jpUrl = getServerURL() + "Mobile/jf/pages/index.html#!/my/:accountName/?accountName=" + getLocalData("currentAN");
                           		location.href = jpUrl;
                           		location.reload();
				            }
				            else {
				                __log.addEvent("发起直通车注册请求失败:" + url);
				                showMsg("保存失败!," + result.Message);
				            }
				        },
				        error: function () {
				            loading(false);
				            $("#doSave").prop("disabled", false);
				            __log.addEvent("发起直通车注册请求异常");
				            showMsg("保存异常!");
				        }
				    });
				});
            }
        },
        ready: function(){
        	this.$emit("render");
        }
    });
	
    module.exports = VueComponent;
});