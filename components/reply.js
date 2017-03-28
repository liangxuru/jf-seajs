var reply = (function () {
    
    var self = "#replyPage";

    function initFace() {
        var html = "";
        for (var i = 0; i <= 39; i++) {
            html += "<span style='background-position-y:-" + i * 30 + "px'></span>";
        }
        $(self + " .faceList").html(html);
    }

    return {
        //初始化数据
        init: function () {
            initFace();

            this.bindEvent();
        },
        //绑定事件
        bindEvent: function () {
            //字数监听事件
            $(self).on("input", "#reply_content", function () {
                var len = 140 - $(this).val().length;
                $(self + " #textcount").html(len);
                if (len < 0) {
                    $(self + " #textcount").css("color", "red");
                }
                else {
                    $(self + " #textcount").css("color", "black");
                }
            });


            $(self).on("click", ".expression", function (e) {
                e.stopPropagation();
                if ($(self + " .faceList:visible").length > 0) {
                    $(self + " .faceList").hide();
                }
                else {
                    $(self + " .faceList").show();
                }
            })

            //点击预览图片
            $(self).on("click", ".fContent .upimg", function (e) {

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


            $(self).on("click", ".faceList > span", function (e) {
                var index = 1 + $(this).index();
                index = index < 10 ? "0" + index : index;
                $(self + " #reply_content").append("<img style='width:30px;height:30px;' src='http://tb2.bdstatic.com/tb/editor/images/face/i_f" + index + ".png'/>")
                placeCaretAtEnd($(self + " #conten").get(0));
            })
            
            //初始化表情插件
            $(self + " a.face").smohanfacebox({
                Event: "click",	//触发事件	
                divid: "reply_select-face", //外层DIV ID
                textid: "reply_content" //文本框 ID
            });

            $(self).on("click", "#cancel", function (e) {
                $(self + " #reply_content").val("");
                $("#replyPage").removeClass("show");

                $(self + " #textcount").html("140");
                $(self + " #textcount").css("color", "#ccc");
            })

            //发表新回复
            $(self).on("click", "#publish", function (e) {
                reply();
            })

            function reply() {
                var content = $(self + " #reply_content").val().trim();

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


            $(self).on("click", ".faceList > span", function (e) {
                var index = 1 + $(this).index();
                index = index < 10 ? "0" + index : index;
                $(self + " #reply_content").append("<img src='http://tb2.bdstatic.com/tb/editor/images/face/i_f" + index + ".png'/>")
                placeCaretAtEnd($(self + " #reply_content").get(0));
            })

            $(self).on("focus", "#reply_content", function (e) {
                if (!$(this).hasClass("hasValue")) {
                    $(this).addClass("hasValue").empty();
                }
            })

            $(self).on("click", function (e) {
                $(self + ".faceList").hide();
            })
        }
    };
})();