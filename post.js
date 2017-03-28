var current = 0;
var fid = 0;
var openid = 0;
var shopid = 0;
var acname = 0;
var replyto = 0;

$(function () {
    $("#mloading").fadeOut();

    current = getCurrentData();
    fid = getArgs("fid");
    openid = current.openID;
    shopid = getLocalData("shopID");
    acname = getLocalData("currentAN");
    replyto = null;

    //fid = 333;
    //openid = "oCZI6wBvqYkGmfb7yFrMUb8Iu_iA";

    initFace();
    initEvent();
    GetRelease();
})

function GetRelease() {
    //获取回复
    $.ajax({
        type: 'get',
        url: getServerURL() + 'api/forum/GetRelDetails',
        data: { openid: openid, fid: fid },
        datatype: 'json',
        success: function (data) {
            var result = $.parseJSON(data);
            result.data.oldopenid = openid;
            if (result.status == 1) {
                //标题信息
                $(".Title").html('<span>' + result.data.forumTitle + '</span><div><span class="type">' + result.data.typename + '</span><span class="sCount' + (result.data.issupt != 0 ? " sCount_fill" : "") + '">' + result.data.forumPraise + '</span><span class="rCount">' + result.data.replyCount + '</span></div>');
                template.config("escape", false);//设置为html显示
                var _formhtml = template("forumContentTemplate", result.data);
                $("#posts").html(replaceface(_formhtml));
            }
            else if (result.status == 0) {
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


    $(document).on("click", ".expression", function (e) {
        e.stopPropagation();
        if ($(".faceList:visible").length > 0) {
            $(".faceList").hide();
        }
        else {
            $(".faceList").show();
        }
    })

    //点击预览图片
    $(document).on("click", ".fContent .upimg", function (e) {

        var _displayimg = new Array();

        $.each($(this).parent().children(".upimg"), function (index, value) {
            _displayimg.push(window.location.protocol + '//' + window.location.host + $(this).attr("src"));
        });

        wx.previewImage({
            current: window.location.protocol + '//' + window.location.host + $(this).attr("src"), // 当前显示图片的http链接
            urls: _displayimg // 需要预览的图片http链接列表
        });
        //alert(JSON.stringify(_displayimg));
        return false;
    })


    $(document).on("click", ".faceList > span", function (e) {
        var index = 1 + $(this).index();
        index = index < 10 ? "0" + index : index;
        $("#content").append("<img style='width:30px;height:30px;' src='http://tb2.bdstatic.com/tb/editor/images/face/i_f" + index + ".png'/>")
        placeCaretAtEnd($("#conten").get(0));
    })


    $(document).on("click", "#doReply", function (e) {
        $("#content").attr("placeholder", "输入您的内容(不超过140个字)");

        $("#replyPage").addClass("show");
    })

    //初始化表情插件
    $("a.face").smohanfacebox({
        Event: "click",	//触发事件	
        divid: "select-face", //外层DIV ID
        textid: "content" //文本框 ID
    });

    $(document).on("click", "#cancel", function (e) {
        $("#content").val("");
        $("#replyPage").removeClass("show");

        $("#textcount").html("140");
        $("#textcount").css("color", "#ccc");

        //alert($(".face").html());
        //if (!hasClass("in")) {
        //    $(this).click();
        //    alert("test");
        //}

    })

    //发表新回复
    $(document).on("click", "#publish", function (e) {
        reply();
    })

    //点击回复直接发表回复
    $(document).on("click", ".replyli", function () {
        replyto = $(this).attr("rid");
        $("#doReply").click();
        $("#content").empty();
        $("#content").addClass("hasValue");
        $("#content").attr("placeholder", "回复 " + $(this).children(".fInfo").children(".name").children("span").html() + ":");
        ("#content").onfouce();
        //placeCaretAtEnd($("#content").get(0));
    });

    function reply() {
        var content = $("#content").val().trim();

        if (content.length <= 0) {
            showMsg('请填写帖子内容');
            return;
        }
        else if (content.length > 140) {
            showMsg('帖子内容超过140，请减少字数！');
            return;
        }

        $.ajax({
            type: 'get',
            url: getServerURL() + 'api/Forum/addreply',
            data: { openid: openid, shopid: null, fid: fid, replyto: replyto, content: content, imgss: null },
            datatype: 'json',
            success: function (result) {
                var jresult = JSON.parse(result);
                if (jresult.status == 1) {
                    showMsg(jresult.data);
                    window.location.reload();
                    $("#publishPage").removeClass("show");
                }
                else {
                    showMsg(jresult.data + '请稍后重试...');
                }

            },
            error: function (err) {
                showMsg(err);
            }
        });
    }


    $(document).on("click", ".faceList > span", function (e) {
        var index = 1 + $(this).index();
        index = index < 10 ? "0" + index : index;
        $("#content").append("<img src='http://tb2.bdstatic.com/tb/editor/images/face/i_f" + index + ".png'/>")
        placeCaretAtEnd($("#content").get(0));
    })

    $(document).on("focus", "#content", function (e) {
        if (!$(this).hasClass("hasValue")) {
            $(this).addClass("hasValue").empty();
        }
    })

    $(document).on("click", function (e) {
        $(".faceList").hide();
    });

    //点赞
    $(document).on("click", ".sCount", function (e) {
        support.call(this);
        e.stopPropagation();
    })
}

//点赞功能
function support() {

    var self = this;
    $(this).toggleClass("sCount_fill");

    $.ajax({
        url: getServerURL() + 'api/forum/doSupport',
        data: { opid: openid, fid: fid },
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