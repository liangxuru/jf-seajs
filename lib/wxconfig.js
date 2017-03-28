define(["jquery", "common", "jweixin", "module"], function ($, com, wx, module) {
    var wxConfig = function () {
        var acname = com.getLocalData("accountName");
        var _url = com.getRootUrl() + 'Mobile/DataHandler/JsSdkHandler.ashx';
        $.ajax({
            type: 'get',
            url: _url,
            async: false,
            dataType: 'json',
            data: { accountname: acname, url: window.location.href },
            success: function (result) {
                if (result.status) {
                    wx.config({
                        debug: true,
                        appId: result.appid,
                        timestamp: result.timestamp,
                        nonceStr: result.noncestr,
                        signature: result.signature,
                        jsApiList: [
                          'checkJsApi',
                          'onMenuShareTimeline',
                          'onMenuShareAppMessage',
                          'onMenuShareQQ',
                          'onMenuShareWeibo',
                          'hideMenuItems',
                          'showMenuItems',
                          'hideAllNonBaseMenuItem',
                          'showAllNonBaseMenuItem',
                          'translateVoice',
                          'startRecord',
                          'stopRecord',
                          'onRecordEnd',
                          'playVoice',
                          'pauseVoice',
                          'stopVoice',
                          'uploadVoice',
                          'downloadVoice',
                          'chooseImage',
                          'previewImage',
                          'uploadImage',
                          'downloadImage',
                          'getNetworkType',
                          'openLocation',
                          'getLocation',
                          'hideOptionMenu',
                          'showOptionMenu',
                          'closeWindow',
                          'scanQRCode',
                          'chooseWXPay',
                          'openProductSpecificView',
                          'addCard',
                          'chooseCard',
                          'openCard'
                        ]
                    });
                    wx.ready(function () {
                    });
                    wx.error(function (res) {
                    });
                }
                else {
                    com.showMsg(rejson.message);
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                com.showMsg(errorThrown);
            }
        });
    }

    var getImage = function () {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                return localIds;
            }
        });
    }

    return {
        wxConfig: wxConfig,
        getImage: getImage
    };
});