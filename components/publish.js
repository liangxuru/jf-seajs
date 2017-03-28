var publish = (function () {
    var self = "#publishPage",
        images = {
            localId: [],
            serverId: []
        };
    //加载类型数据
    function getTypeData() {
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
                    $(self + " .select-type").html(html);
                }
            }
        });
    }

    //注册微信接口
    function registWeixin(abPath, openid, an) {
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
                        alert(res.Message);
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

    function creatFaceList() {
        //初始化表情
        var _facehtml = "";
        for (var i = 0; i <= 39; i++) {
            _facehtml += "<span style='background-position-y:-" + i * 30 + "px'></span>";
        }
        $(self + " .faceList").html(_facehtml);
    }

    //设置默认值
    function setDefalt(value) {
        if (value.length) {
            $(self + " #content").val(value).addClass("hasValue");
        }
    }

    return {
        //初始化数据
        init: function (abPath, openid, an, path) {
            creatFaceList();
            getTypeData();
            registWeixin(abPath, openid, an);
            
            this.bindEvent(path);
        },
        bindData: function (title) {
            setDefalt(title);
        },
        //绑定事件
        bindEvent: function () {
            
            //点击菜单项
            $(self).on("click", ".post-func-area > li", function () {
                if (!$(this).children().hasClass("active")) {
                    $(this).children().addClass("active");
                    $(this).siblings().children().removeClass("active");
                    var index = $(this).index();
                    if (!$(self + " .tab").children().eq(index).hasClass("show")) {
                        $(self + " .tab").children().removeClass("show");
                        $(self + " .tab").children().eq(index).addClass("show");
                    }
                }
            });

            //帖子类型事件监听
            $(self).on("click", ".select-type > .ch-type", function () {
                $(this).addClass("type-selected");
                $(this).siblings(".ch-type").removeClass("type-selected");
                $(self + " #type").addClass("hasValue").text($(this).html());
            });

            //字数监听事件
            $(self).on("input", "#content", function () {
                var len = 140 - $(this).val().length;
                $(self + " #textcount").html(len);
                if (len < 0) {
                    $(self + " #textcount").css("color", "red");
                }
                else {
                    $(self + " #textcount").css("color", "black");
                }
            });

            //点击预览图片
            $(self).on("click", ".upimglist .upimg", function (e) {

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

            //点击笑脸
            $(self + " a.phiz-btn").smohanfacebox({
                Event: "click",	//触发事件	
                divid: "select-face", //外层DIV ID
                textid: "content" //文本框 ID
            });

            //取消发帖
            $(self).on("click", "#cancel", function (e) {
                showConfirm("确认取消吗？", function () {
                    $("html,body").css("overflow", "auto");
                    $("body").css("height", "auto");
                    $("#publishPage").removeClass("show");
                    $(".postList").removeClass("show");
                    $(".postList").css("height", "auto");
                    $("#postListPage").css("display", "block");

                    $(self + " .topic-btn-item").addClass("active").parent().siblings().children("a").removeClass("active");

                    $(self + " .tab").children().removeClass("show");
                    $(self + " .tab div:first-child").addClass("show");

                    $(self + " .phiz-btn").removeClass("in");


                    $(self + " #type").removeClass("hasValue");
                    $(self + " #type").html("选择帖子类型");
                    $(self + " #textcount").html("140").css("color", "#ccc");

                    $(self + " #title").val("");
                    $(self + " #content").val("");

                    images.localId.length = 0;//清空images数组
                    images.serverId.length = 0;
                }, function () {
                    //alert("你点击了取消");
                });
            })

            //调用微信上传图片接口
            $(self).on("click", ".up-entry", function (e) {
                var that = $(this);
                // images.localId = [];
                wx.chooseImage({
                    success: function (res) {
                        images.localId = res.localIds;
                        if (images.localId.length == 0) {
                            alert('请先使用 chooseImage 接口选择图片');
                            return;
                        }
                        if (images.localId.length > 6) {
                            alert('目前仅支持6张图片上传,请重新上传');
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
                                    $(self + " #viewimg").html('<div class="control-upimg"><img style="height: 7.5rem; width: 7.5rem; border-radius: 0.2rem;" src="' + images.localId[i] + '" alt="" attr-sid="' + images.serverId[i] + '" class="upimg wximg" /><img src="../shop/common/img/ico_cancel.png" alt="" class="delimg" /></div>' + $("#viewimg").html());
                                    i++;
                                    if (i < length) {
                                        upload();
                                    }
                                },
                                fail: function (res) {
                                    alert(JSON.stringify(res));
                                }
                            });
                        }
                        upload();
                    },
                    fail: function (res) {
                        alert(JSON.stringify(res));
                    }
                });
            })


            //提交帖子表单
            $(self).on("click", "#publish", function (e) {

                var title = $(self + " #title").val().trim();
                var type = $(self + " #type").html().trim() == "选择帖子类型" ? "" : $(self + " #type").html().trim();
                var content = $(self + " #content").val().trim();

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
                    $(self + " .post-func-area > li").eq(0).click();
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
                $.each($(self + " .wximg"), function (index, value) {
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
                            alert(resultJSON.data);
                            $("#publishPage").removeClass("show");
                            window.location.reload();
                        }
                        else {
                            alert(resultJSON.data);
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


            $(self).on("click", ".expression", function (e) {
                e.stopPropagation();
                if ($(self + " .faceList:visible").length > 0) {
                    $(self + " .faceList").hide();
                    $(self + " .up-entry").show();
                    $(self + " #viewimg").show();
                }
                else {
                    $(self + " .faceList").show();
                    $(self + " .up-entry").hide();
                    $(self + " #viewimg").hide();
                }
            })

            //笑脸项
            $(self).on("click", ".faceList > span", function (e) {
                placeCaretAtEnd($(self + " #content").get(0));
                var index = 1 + $(this).index();
                index = index < 10 ? "0" + index : index;
                $(self + " #content").append("<img style='width:30px;height:30px;' src='http://tb2.bdstatic.com/tb/editor/images/face/i_f" + index + ".png'/>");
                $(self + " .up-entry").show();
                $(self + " #viewimg").show();
                placeCaretAtEnd($(self + " #content").get(0));
            })

            //textarea获得焦点
            $(self).on("focus", "#content", function (e) {
                if (!$(this).hasClass("hasValue")) {
                    $(this).addClass("hasValue").empty();
                }
            });

            //点击笑脸菜单项
            $(self).on("click", ".faceList", function (e) {
                $(this).hide();
            });

            //删除图片
            $(self).on("click", ".delimg", function (event) {
                $(this).parent().remove();
            });
        }
    };
})();