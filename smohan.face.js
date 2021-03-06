/*
 @ 文本框插入表情插件
 @ 作者：水墨寒 Smohan.net
 @ 日期：2013年1月28日
*/
$(function () {
    $.fn.smohanfacebox = function (options) {
        var defaults = {
            Event: "click", //响应事件		
            divid: "Smohan_FaceBox", //表单ID（textarea外层ID）
            textid: "TextArea" //文本框ID
        };
        var options = $.extend(defaults, options);//extend，将后面的覆盖前面的
        var $btn = $(this);//取得触发事件的ID


        //创建表情框
        var faceimg = '';
        for (i = 0; i < 60; i++) {  //通过循环创建60个表情，可扩展
            faceimg += '<li><a href="javascript:void(0)"><img src="assets/image/face/' + (i + 1) + '.gif" face="[' + (i + 1) + ']"/></a></li>';
        };
        $("#" + options.divid).html("<div id='SmohanFaceBox'><div class='Content'><div class='clear;both;'></div><ul>" + faceimg + "</ul></div></div>");
        $("#" + options.divid + ' #SmohanFaceBox').css("display", 'none');//创建完成后先将其隐藏
        //创建表情框结束

        var $facepic = $("#" + options.divid + " #SmohanFaceBox li img");
        //BTN触发事件，显示或隐藏表情层
        $btn.on(options.Event, function (e) {
            if ($('#' + options.divid + ' #SmohanFaceBox').is(":hidden")) {
                $('#' + options.divid + ' #SmohanFaceBox').show(360);
                $btn.addClass('in');
            }
            else {
                $('#' + options.divid + ' #SmohanFaceBox').hide(360);
                $btn.removeClass('in');
            }
        });
        //插入表情
        $facepic.off().click(function () {
            //$('#SmohanFaceBox').hide(360);
            //$("#"+options.textid).focus();
            //$("#"+options.textid).val($("#"+options.textid).val()+$(this).attr("face"));
            $("#" + options.textid).off().insertContent($(this).attr("face"));
            $btn.removeClass('in');
        });
        //关闭表情层
        //$('#SmohanFaceBox h3 a.close').click(function () {
        //    $('#SmohanFaceBox').hide(360);
        //    $btn.removeClass('in');
        //});
        ////当鼠标移开时，隐藏表情层，如果不需要，可注释掉
        //$('#SmohanFaceBox').mouseleave(function () {
        //    $('#SmohanFaceBox').hide(560);
        //    $btn.removeClass('in');
        //});
    };

    // 【漫画】 光标定位插件
    $.fn.extend({
        insertContent: function (myValue, t) {
            var $t = $(this)[0];
            if (document.selection) {
                this.focus();
                var sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
                sel.moveStart('character', -l);
                var wee = sel.text.length;
                if (arguments.length == 2) {
                    var l = $t.value.length;
                    sel.moveEnd("character", wee + t);
                    t <= 0 ? sel.moveStart("character", wee - 2 * t - myValue.length) : sel.moveStart("character", wee - t - myValue.length);
                    sel.select();
                }
            } else if ($t.selectionStart || $t.selectionStart == '0') {
                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                var scrollTop = $t.scrollTop;
                $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
                this.focus();
                $t.selectionStart = startPos + myValue.length;
                $t.selectionEnd = startPos + myValue.length;
                $t.scrollTop = scrollTop;
                if (arguments.length == 2) {
                    $t.setSelectionRange(startPos - t, $t.selectionEnd + t);
                    this.focus();
                }
            } else {
                this.value += myValue;
                this.focus();
            }
        }
    });

    //表情解析
    $.fn.extend({
        replaceface: function (faces) {
            for (i = 0; i < 60; i++) {
                faces = faces.replace('[' + (i + 1) + ']', '<img style="width:25px;height:25px;" src="assets/image/face/' + (i + 1) + '.gif">');
            }
            $(this).html(faces);
        }
    });

});

function replaceface(html) {
    for (i = 0; i < 60; i++) {
        var r = new RegExp('\\[' + (i + 1) + '\\]', 'g');
        html = html.replace(r, '<img style="width:25px;height:25px;" src="assets/image/face/' + (i + 1) + '.gif">');
    }
    return html;
}

