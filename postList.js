var current = 0;
var page = 0;
var openid = 0;
var acname = 0;
var shopid = 0;
var an = 0;
var images = {
    localId: [],
    serverId: []
}, imgss = "";

// localhost:18130/mobile/forum/postList.html?accountName=010A403A707346518A86811F72C3B2B4&m=613044

$(function () {
    checkAuth(function () {
        $("#mloading").fadeOut();
        current = getCurrentData();
        page = 0;
        openid = current.openID;
        acname = getArgs("accountName");
        shopid = getLocalData("shopID");
        an = getLocalData("currentAN");

        initSub();

        loadPage();
        initEvent();
        initData();

        $("#img-headImg").attr("src", current.userData.headImg);

        $("img").lazyload({
            effect: "fadeIn"
        });

        //初始化表情
        var _facehtml = "";
        for (var i = 0; i <= 39; i++) {
            _facehtml += "<span style='background-position-y:-" + i * 30 + "px'></span>";
        }
        $(".faceList").html(_facehtml);
    });

})

function initSub() {
    loading(true);
    $.ajax({
        url: getServerURL() + 'api/Forum/getTopics',
        data: { bid: current.businessID },
        success: function (_result) {
            var result = JSON.parse(_result);
            if (result.status == 1) {
                $(".info").html(template('info', result.data));
            } else {
                showTip(result.message);
            }
            //loadPage(false);
        }
    });
}

function loadPage() {
    $.ajax({
        type: 'Get',
        url: getServerURL() + 'api/Forum/Get',
        data: { openid: openid, page: page, acname: acname },
        success: function (data) {
            var result = $.parseJSON(data);
            if (result.status == 1) {
                if (result.data != null && result.data.length > 0) {
                    template.config("escape", false);
                    var html = template('forumlist_temp', { items: result.data });
                    //$('.postList .nos').replaceface(html);//替换表情
                    $(".postList .nos").append(replaceface(html));//替换表情和连接
                    page++;
                }
                else {
                    showMsg("没有更多帖子...");
                }
            }
            else {
                showMsg(result.data);
            }
        }
    });
}

function initData() {

    //加载类型数据
    $.ajax({
        type: 'Get',
        url: getServerURL() + 'api/Forum/GetType',
        data: { tname: "" },
        success: function (data) {
            var jdata = JSON.parse(data);
            if (jdata.status == 1) {
                var html = '';
                $.each(jdata.data, function (ldir, item) {
                    html = html + '<div class="ch-type">' + item.typename + '</div>';
                });
                $(".select-type").html(html);
            }
        }
    });

    //注册微信接口
    $.ajax({
        type: 'get',
        url: abPath + "/api/Order/GetJSTicket?openID=" + openid + "&accountName=" + an + "&url=" + encodeURIComponent(location.href),
        success: function (data) {
            var result = $.parseJSON(data);
            if (result.Result) {
                var wxResult = result.Data.wxResult;
                wx.config({
                    debug: false,
                    appId: wxResult.appid,
                    timestamp: wxResult.timestamp,
                    nonceStr: wxResult.noncestr,
                    signature: wxResult.signature,
                    jsApiList: [
                      'getLocation',
                      'chooseImage',
                      'previewImage',
                      'uploadImage'
                    ]
                });
                wx.ready(function () {
                });
                wx.error(function (res) {
                    showMsg(res.Message);
                });
            }
            else {
                showTip("获取微信JSTicket失败：" + result.Message);
            }
        },
        error: function () {
            loading(false);
            showTip("获取微信JSTicket异常！");
        }
    });
}

//点赞功能
function support() {

    var self = this;
    $(this).toggleClass("sCount_fill");

    $.ajax({
        url: getServerURL() + 'api/forum/doSupport',
        data: { opid: openid, fid: $(self).parents("li").attr("fid") },
        success: function (_value) {
            $(self).text(JSON.parse(_value).data.praisecount);
        }
    });
}

function initEvent() {

    $(document).on("click", ".post-func-area > li", function () {
        if (!$(this).children().hasClass("active")) {
            $(this).children().addClass("active");
            $(this).siblings().children().removeClass("active");
            var index = $(this).index();
            if (!$(".tab").children().eq(index).hasClass("show")) {
                $(".tab").children().removeClass("show");
                $(".tab").children().eq(index).addClass("show");
            }
        }
    });

    //帖子类型事件监听
    $(document).on("click", ".select-type > .ch-type", function () {
        $(this).addClass("type-selected");
        $(this).siblings(".ch-type").removeClass("type-selected");
        $("#type").addClass("hasValue").text($(this).html());
    });

    //字数监听事件
    $(document).on("input", "#content", function () {
        var len = 140 - $(this).val().length;
        $("#textcount").html(len);
        if (len < 0) {
            $("#textcount").css("color", "red");
        }
        else {
            $("#textcount").css("color", "black");
        }
    });

    //点击预览图片
    $(document).on("click", ".upimglist .upimg", function (e) {

        var _displayimg = new Array();

        $.each($(this).parent().children(".upimg"), function (index, value) {
            _displayimg.push(window.location.protocol + '//' + window.location.host + $(this).attr("src"));
        });

        wx.previewImage({
            current: window.location.protocol + '//' + window.location.host + $(this).attr("src"), // 当前显示图片的http链接
            urls: _displayimg // 需要预览的图片http链接列表
        });
        return false;
    })

    $(document).on("click", ".postList > .nos > li", function (e) {
        window.location.href = "post.html?fid=" + $(this).attr("fid") + "&v=" + new Date().getTime();
    })


    $(document).on("click", "#showSendMsg", function (e) {
        $("html,body").css("overflow", "hidden");
        $(".abs-layer-cmt").css("display", "block");

        //显示表单
        $("#publishPage").addClass("show");
        $("#postListPage").css("display", "none");
        $(".postList").addClass("show");

        $(".postList").css("height", $(window).height());
    });

    $("a.phiz-btn").smohanfacebox({
        Event: "click",	//触发事件	
        divid: "select-face", //外层DIV ID
        textid: "content" //文本框 ID
    });

    //取消发帖
    $(document).on("click", "#cancel", function (e) {
        showConfirm("确认取消吗？", function () {
            $("html,body").css("overflow", "auto");
            $("body").css("height", "auto");
            $("#publishPage").removeClass("show");
            $(".postList").removeClass("show");
            $(".postList").css("height", "auto");
            $("#postListPage").css("display", "block");

            $(".topic-btn-item").addClass("active");
            $(".topic-btn-item").parent().siblings().children("a").removeClass("active");

            $(".tab").children().removeClass("show");
            $(".tab div:first-child").addClass("show");

            $(".phiz-btn").removeClass("in");


            $("#type").removeClass("hasValue");
            $("#type").html("选择帖子类型");
            $("#textcount").html("140");
            $("#textcount").css("color", "#ccc");

            $("#title").val("");
            $("#content").val("");

            images.localId.length = 0;//清空images数组
            images.serverId.length = 0;
        }, function () {
        });
    })

    //调用微信上传图片接口
    $(document).on("click", ".up-entry", function (e) {
        var that = $(this);
        // images.localId = [];
        wx.chooseImage({
            success: function (res) {
                images.localId = res.localIds;
                if (images.localId.length == 0) {
                    showMsg('请先使用 chooseImage 接口选择图片');
                    return;
                }
                if (images.localId.length > 6) {
                    showMsg('目前仅支持6张图片上传,请重新上传');
                    images.localId = [];
                    return;
                }
                var i = 0, length = images.localId.length;
                // images.serverId = [];
                //$('#viewimg').html("");
                function upload() {
                    wx.uploadImage({
                        localId: images.localId[i],
                        success: function (res) {
                            images.serverId.push(res.serverId);
                            $("#viewimg").html('<div class="control-upimg"><img style="height: 7.5rem; width: 7.5rem; border-radius: 0.2rem;" src="' + images.localId[i] + '" alt="" attr-sid="' + images.serverId[i] + '" class="upimg wximg" /><img src="../shop/common/img/ico_cancel.png" alt="" class="delimg" /></div>' + $("#viewimg").html());
                            i++;
                            if (i < length) {
                                upload();
                            }
                        },
                        fail: function (res) {
                            showMsg(JSON.stringify(res));
                        }
                    });
                }
                upload();
            },
            fail: function (res) {
                showMsg(JSON.stringify(res));
            }
        });
    })


    //提交帖子表单
    $(document).on("click", "#publish", function (e) {

        var title = $("#title").val().trim();
        var type = $("#type").html().trim() == "选择帖子类型" ? "" : $("#type").html().trim();
        var content = $("#content").val().trim();

        if (title.length <= 0) {
            showMsg('标题还未填写哦');
            return;
        }
        else if (title.length > 18) {
            showMsg('标题长度超过18，请减少字数！');
            return;
        }

        if (type.length <= 0) {
            showMsg('请选择帖子类型');
            $(".post-func-area > li").eq(0).click();
            return;
        }

        if (content.length <= 0) {
            showMsg('请填写帖子内容');
            return;
        }
        else if (content.length > 140) {
            showMsg('帖子内容超过140，请减少字数！');
            return;
        }

        //获取要上传的图片的serviceid
        var imgsrcs = "";
        $.each($(".wximg"), function (index, value) {
            if (index == 0) {
                imgsrcs = $(this).attr("attr-sid");
            }
            else {
                imgsrcs = imgsrcs + "," + $(this).attr("attr-sid");
            }
        });

        $.ajax({
            type: 'GET',
            url: getServerURL() + 'api/forum/Add',
            data: { openid: openid, acname: acname, title: title, type: type, content: content, imgss: imgsrcs },
            success: function (result) {
                var resultJSON = $.parseJSON(result);
                if (resultJSON.status == 1) {
                    showMsg(resultJSON.data);
                    $("#publishPage").removeClass("show");
                    window.location.reload();
                }
                else {
                    showMsg(resultJSON.data);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (textStatus == "timeout") {
                    showmsg("加载超时，请重试");
                } else {
                    showmsg("发布失败：" + err, ",请重试！");
                }
            }
        });
        //images.length = 0;//清空images数组
        images.localId.length = 0;//清空images数组
        images.serverId.length = 0;
    })

    $(document).on("click", ".expression", function (e) {
        e.stopPropagation();
        if ($(".faceList:visible").length > 0) {
            $(".faceList").hide();
            $(".up-entry").show();
            $("#viewimg").show();
        }
        else {
            $(".faceList").show();
            $(".up-entry").hide();
            $("#viewimg").hide();
        }
    })

    $(document).on("click", ".faceList > span", function (e) {
        placeCaretAtEnd($("#content").get(0));
        var index = 1 + $(this).index();
        index = index < 10 ? "0" + index : index;
        $("#content").append("<img style='width:30px;height:30px;' src='http://tb2.bdstatic.com/tb/editor/images/face/i_f" + index + ".png'/>");
        $(".up-entry").show();
        $("#viewimg").show();
        placeCaretAtEnd($("#content").get(0));
    })

    $(document).on("focus", "#content", function (e) {
        if (!$(this).hasClass("hasValue")) {
            $(this).addClass("hasValue").empty();
        }
    });

    $(document).on("click", ".faceList", function (e) {
        $(this).hide();
    });

    $(document).on("click", ".delimg", function (event) {
        $(this).parent().remove();
    });

    //点赞
    $(document).on("click", ".sCount", function (e) {
        support.call(this);
        e.stopPropagation();
    })

    $(document).on("click", ".topic", function () {
        window.location.href = $(this).find("a").attr("href");
    });

    $(window).scroll(function () {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(document).height();
        var windowHeight = $(this).height();
        if (scrollTop + windowHeight == scrollHeight) {
            //此处是滚动条到底部时候触发的事件，在这里写要加载的数据，或者是拉动滚动条的操作
            loadPage();
        }
    });
}



function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

String.prototype.formatDate2 = function (now_threshold) {
    var tempDate = new Date(this.replace(/-/g, "/"));//Safari不支持"2012-12-12"格式，支持"2012/12/12"格式

    //var delta = new Date() - tempDate;
    var delta = new Date('2016-8-12 09:24:11.000') - new Date('2016-8-12 09:24:10.500');

    now_threshold = parseInt(now_threshold, 10);

    if (isNaN(now_threshold)) {
        now_threshold = 0;
    }

    if (delta <= now_threshold) {
        return '刚刚';
    }

    var units = null;
    var conversions = {
        '毫秒前': 1, // ms    -> ms
        '秒前': 1000,   // ms    -> sec
        '分钟前': 60,     // sec   -> min
        '小时前': 60,     // min   -> hour
        '天前': 24,     // hour  -> day
        '月前': 30,     // day   -> month (roughly)
        '年前': 12      // month -> year
    };

    for (var key in conversions) {
        if (delta < conversions[key]) {
            break;
        } else {
            units = key; // keeps track of the selected key over the iteration
            delta = delta / conversions[key];
        }
    }

    // pluralize a unit when the difference is greater than 1.
    delta = Math.floor(delta);
    return [delta, units].join("");
    //return [delta, units].join(" ");
};


String.prototype.isURL = function () {
    var reg = /(http|https|ftp|Http)\:\/\/[\.\-\_\/a-zA-Z0-9\~\?\%\#\=\@\:\&\;\*\+\!\(\)\{\}]+\b[\?\#\/\*\=]*/g;
    return this.replace(reg, '<a href="$&">网页链接</a>');
};

String.prototype.replaceUrl = function () {
    return this.replace(/#(.*?)#/g, "<a href='topic.html?title=$1'>#$1#</a>");
}