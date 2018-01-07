import $ from 'zepto';

(() => {
    const template = '\
<div class="row converter-plugin-area" style="text-align:center">\
    <h3>HAND CONVERTER PLUGIN AREA</h3>\
    <label>Hands to download, starting with the most recent first (multiples of 50)</label>\
    <input type="number" class="form-control js-hc-hands" value="100" />\
    <a class="button js-hc-convert">DOWNLOAD IN POKER STARS FORMAT</a>\
    <div class="js-hc-spinning" style="display:none"><img src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif" /></div>\
</div>';

    let $historyDateContainer;

    setInterval(() => {
        if ($('.converter-plugin-area').length > 0) {
            // We have already initialized
            return;
        }

        $historyDateContainer = $('.history-date-container');
        if ($historyDateContainer.length > 0) {
            initialize();
        }
    }, 1000);

    function initialize() {
        $historyDateContainer.append(template);

        $('.js-hc-convert').click(onClickDownload);
    }

    function onClickDownload() {
        $('.js-hc-spinning').show();
        const handsToFetch = $('.js-hc-hands').val() || 100;

        chrome.runtime.sendMessage({action: 'hc.convertHands', options: {handsToFetch}}, response => {
            $('.js-hc-spinning').hide();

            if (!response.success) {
                alert('Something went wrong. Please open an issue at https://github.com/mr-feek/global-poker-hand-history-converter/issues.');
            }
        });
    }
})();

