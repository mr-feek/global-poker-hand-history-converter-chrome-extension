import $ from 'zepto';
import bugsnagClient from './bugsnagClient';

(() => {
    const template = '\
<div class="row converter-plugin-area" style="text-align:center">\
    <h3>HAND CONVERTER PLUGIN AREA</h3>\
    <label>Hands to download, starting with the most recent first (multiples of 50)</label>\
    <input type="number" class="form-control js-hc-hands" value="100" />\
    <a class="button js-hc-convert" style="margin:1rem">DOWNLOAD IN POKER STARS FORMAT</a>\
    <p>Status: <span class="js-hc-status"></span></p>\
    <div class="js-hc-spinning" style="display:none"><img src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif" /></div>\
    <textarea class="js-hc-log" style="width:100%;height:120px;color: #fff;background-color: #333;border: 1px solid #666;"></textarea>\
</div>';

    let $historyDateContainer;
    let $statusContainer;
    let $logContainer;

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
        $statusContainer = $('.js-hc-status');
        $logContainer = $('.js-hc-log');
    }

    function onClickDownload() {
        $('.js-hc-spinning').show();
        const handsToFetch = $('.js-hc-hands').val() || 100;

        window.chrome.runtime.sendMessage({action: 'hc.convertHands', options: {handsToFetch}}, response => {
            $('.js-hc-spinning').hide();

            if (response && response.success) {
                $statusContainer.html('Finished');
            } else {
                $statusContainer.html('Failure');
                alert('Something went wrong. Please open an issue at https://github.com/mr-feek/global-poker-hand-history-converter/issues.');
            }
        });
    }

    window.chrome.runtime.onConnect.addListener(port => {
        port.onMessage.addListener(data => {
            if (data.action === 'hc.updateStatus') {
                $statusContainer.html(data.message);
                $logContainer.append(`${data.message}\n`);
            }
        });
    });
})();

