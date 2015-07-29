$('#album_container').ready(function () {
    slimboxUsage('#album_container');
});

function slimboxUsage(selector) {
    var slimboxGallery = new SlimboxGallery();
    slimboxGallery.setOptions({
        'containerSelector': selector
    });
    slimboxGallery.handler();

    $(selector).on('generated', function (event, gallery) {
        var html = slimboxGallery.options.html.replace(slimboxGallery.albumUrlRegExp, gallery);
        $(this).html(html);
        $(this).find(' .album a').slimbox({
            'loop': true
        });
    });
}