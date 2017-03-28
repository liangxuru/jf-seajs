var current = openid = shopid = acname = replyto = fid = page = 1,
    pagesize = 10,
    title = "";

$(function () {
    $("#mloading").fadeOut();
    current = getCurrentData();

    title = getArgs("title");

    openid = current.openID;
    shopid = getLocalData("shopID");
    acname = getLocalData("currentAN");
    replyto = null;

    //openid = "oCZI6wBvqYkGmfb7yFrMUb8Iu_iA";

    initEvent();
    GetRelease();
    wxConfig();

    //注册发布模块
    RegistTpl("assets/script/components/tpl_publish.html", $('body'), function () {
        publish.init(abPath, openid, acname, location.href);
    });
    //注册回复模块
    //RegistTpl("assets/script/components/tpl_reply.tpl", $('body'), function () {
    //    reply.init();
    //});
});

function RegistTpl(path, target, callback) {
    $.get(path, function (response) {
        target.append(response);
        callback();
    });
}

//浏览量
function TopicBrowse() {
    $.post(getServerURL() + 'api/forum/doTopicBrowse?title=' + title, function (_result) {
        var result = JSON.parse(_result);
        if (result.status == 1) {
            $("#readCount").text(parseInt($("#readCount").text() || 0) + 1)
        }
    });
}

function GetRelease() {

    //获取话题详情
    $.ajax({
        url: getServerURL() + 'api/forum/getTopicInfo',
        data: { title: title },
        success: function (_result) {
            var result = JSON.parse(_result),
                data = { title: title || "" };
            if (result.status == 1) {
                if (result.data.logo) {
                    result.data.logo = __imgServer + result.data.logo;
                }
                data = result.data;
            }
            $(".info").html(template('head', data));
            TopicBrowse();
        }
    });

    loadTopicList();

}

function loadTopicList() {
    $.ajax({
        url: getServerURL() + 'api/forum/getTopicList',
        data: { openid: openid, ttitle: title, page: page, pagesize: pagesize },
        success: function (_result) {
            var result = JSON.parse(_result);
            if (result.status == 1) {
                if (result.data.length > 0) {
                    template.config("escape", false);//设置为html显示
                    $(".postList .nos").append(replaceface(template("forumlist_temp", { items: result.data })));
                    page++;
                }
            } else if (result.status == 0) {
                $(".moredata").html(result.data);
            }
        }
    });
}

function initEvent() {
    $(document).on("click", "a[name='fdel'],a[name='rdel']", function (e) {
        e.stopPropagation();//阻止事件冒泡到上层
        var name = this.name;
        var th = this;
        showConfirm("确认删除？", function () {
            if (name == "fdel") {
                $.ajax({
                    type: 'get',
                    url: getServerURL() + 'api/forum/DelForum',
                    data: { openid: openid, fid: $(th).attr("fid") },
                    success: function (result) {
                        var resultJSON = $.parseJSON(result);
                        if (resultJSON.status == 1) {
                            showMsg("删除成功！", function () { window.location.href = document.referrer; });
                        }
                        else {
                            showMsg("删除失败！");
                        }
                    },
                    error: function (err) {
                        alert(err);
                    }
                });
            }
            else if (name == "rdel") {
                $.ajax({
                    type: 'get',
                    url: getServerURL() + 'api/forum/DelReply',
                    data: { openid: openid, rid: $(th).attr("rid") },
                    success: function (result) {
                        var resultJSON = $.parseJSON(result);
                        if (resultJSON.status == 1) {
                            showMsg("删除成功！");
                            $(th).parents(".replyli").remove();
                        }
                        else {
                            showMsg("删除失败！");
                        }
                    },
                    error: function (err) {
                        alert(err);
                    }
                });

            }
        });
    });

    //点击发帖子
    $(document).on("click", "#showSendMsg", function (e) {
        $("html,body").css("overflow", "hidden");
        $(".abs-layer-cmt").css("display", "block");

        publish.bindData("#{0}#".replace('{0}', title));
        //显示表单
        $("#publishPage").addClass("show");
        $("#postListPage").css("display", "none");
        $(".postList").addClass("show");

        $(".postList").css("height", $(window).height());
    });

    //点击回复
    //$(document).on("click", ".reply", function (e) {
    //    //$("#content").attr("placeholder", "输入您的内容(不超过140个字)");

    //    $("#replyPage").addClass("show");
    //});

    //点击LI
    $(document).on("click", ".postList > .nos > li", function (e) {
        window.location.href = "post.html?fid=" + $(this).attr("fid") + "&v=" + new Date().getTime();
    })

    //点赞
    $(document).on("click", ".sCount", function (e) {
        support.call(this);
        e.stopPropagation();
    });

    $(window).scroll(function () {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(document).height();
        var windowHeight = $(this).height();
        if (scrollTop + windowHeight == scrollHeight) {
            //此处是滚动条到底部时候触发的事件，在这里写要加载的数据，或者是拉动滚动条的操作
            loadTopicList();
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

function initFace() {
    var html = "";
    for (var i = 0; i <= 39; i++) {
        html += "<span style='background-position-y:-" + i * 30 + "px'></span>";
    }
    $(".faceList").html(html);
}

function placeCaretAtEnd(e) {
    e.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(e);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(e);
        textRange.collapse(false);
        textRange.select();
    }
}


String.prototype.formatDate2 = function (now_threshold) {
    var tempDate = new Date(this.replace(/-/g, "/"));//Safari不支持"2012-12-12"格式，支持"2012/12/12"格式

    var delta = new Date() - tempDate;

    now_threshold = parseInt(now_threshold, 10);

    if (isNaN(now_threshold)) {
        now_threshold = 0;
    }

    if (delta <= now_threshold) {
        return '刚刚';
    }

    var units = null;
    var conversions = {
        '毫秒': 1, // ms    -> ms
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


function wxConfig() {
    //注册微信接口
    $.ajax({
        type: 'get',
        url: abPath + "/api/Order/GetJSTicket?openID=" + getCurrentData().openID + "&accountName=" + getLocalData("currentAN") + "&url=" + encodeURIComponent(location.href),
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
                      'uploadImage',
                      'hideMenuItems',
                      "onMenuShareTimeline",
                      "onMenuShareAppMessage",
                      "onMenuShareQQ"
                    ]
                });
                wx.ready(function () {
                    wx.hideMenuItems({
                        menuList: [
                            'menuItem:favorite',
                            'menuItem:openWithQQBrowser',
                            'menuItem:openWithSafari',
                            'menuItem:share:qq',
                            'menuItem:share:QZone',
                            'menuItem:copyUrl'
                        ]
                    });
                    wx.onMenuShareTimeline({
                        title: '分享金风智慧园区，一起参与我们的热聊吧，发话题有惊喜！',
                        link: getServerURL() + '/Mobile/forum/topic.html?title=' + getArgs("title") + '&m=' + parseInt(Math.random() * 100000), // 分享链接
                        imgUrl: getServerURL() + 'Mobile/forum/assets/image/logo.png', // 分享图标
                        success: function () {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function () {
                            // 用户取消分享后执行的回调函数
                        }
                    });
                    wx.onMenuShareAppMessage({
                        title: '分享金风智慧园区，一起参与我们的热聊吧，发话题有惊喜！', // 分享标题
                        desc: '', // 分享描述
                        link: getServerURL() + '/Mobile/forum/topic.html?title=' + getArgs("title") + '&m=' + parseInt(Math.random() * 100000), // 分享链接
                        imgUrl: getServerURL() + 'Mobile/forum/assets/image/logo.png', // 分享图标
                        type: '', // 分享类型,music、video或link，不填默认为link
                        dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                        success: function () {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function () {
                            // 用户取消分享后执行的回调函数
                        }
                    });
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