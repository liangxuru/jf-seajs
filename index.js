define(["jquery", "common", "swiper"], function ($, com, swiper) {
    $(function () {
        $("#mloading").fadeOut();
        initEvent();
    })

    function initEvent() {
        var mySwiper = new swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            paginationClickable: false,
            autoplay: 4000,
            autoplayDisableOnInteraction: false,
            loop: true
        });
        $(document).off("click", "#groupDiv li").on("click", "#groupDiv li", function (e) {
            window.location.href = "postList.html";
        })
    }
})