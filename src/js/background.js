import '../img/icon-128.png';
import '../img/icon-34.png';

import {convertHand} from '@mr-feek/global-poker-hand-history-converter/src/Converter';
import GlobalPokerHand from '@mr-feek/global-poker-hand-history-converter/src/GlobalPokerHand';
import {getParams} from './utils';
import bugsnagClient from './bugsnagClient';

let session;
let playerId;
let port;

chrome.webRequest.onBeforeSendHeaders.addListener(details => {
    // Save these so that we can reuse them when issuing our own XHR
    const params = getParams(details.url);
    session = params.session;
    playerId = params.playerId;
}, {urls: ['https://public.globalpoker.com/player-api/rest/player/handhistory/*']});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'hc.convertHands') {
        initializePort().then(() => {
            updateStatus('port initialized.');
            fetchAndConvertHands(
                request.options.startTime,
                data => {
                    sendResponse({success: true, data});
                },
                data => {
                    sendResponse({success: false, data});
                }
            );
        }, error => {
            sendResponse({success: false, message: error});
        });
    }

    return true;
});

function fetchAndConvertHands(startTime, success, failure) {
    const successCallback = success;
    const failureCallback = failure;

    updateStatus('beginning fetching hands');

    getHands(session, playerId, [], startTime, hands => {
        updateStatus('Finished fetching hands. Now converting to poker stars format for download.');

        let count = 1;
        const converted = hands.map(handHistoryBlob => {
            const convertedHand = convertHand(new GlobalPokerHand(handHistoryBlob));
            updateStatus(`Converted hand ${count} of ${hands.length}`);
            count++;
            return convertedHand;
        });

        const blob = new Blob([converted.join('\n\n\n')], {type: 'text/plain'});
        const dataUrl = URL.createObjectURL(blob);
        chrome.downloads.download({url: dataUrl});
        successCallback();
    });
}

function getHands(session, playerId, hands, startTime, done) {
    const count = 20;
    const lastHand = hands[hands.length - 1];

    startTime = lastHand ? lastHand.startTime + 1 : startTime;

    const xhr = new XMLHttpRequest();
    const url = `https://play.globalpoker.com/player-api/rest/player/handhistory/XSD?count=${count}&startTime=${startTime}&descending=false&session=${session}&playerId=${playerId}&r=${Math.random()}`;

    xhr.open('GET', url, true);

    xhr.onload = function () {
        const data = JSON.parse(xhr.response);

        if (!data || !data.hands || data.hands.length === 0) {
            return done(hands);
        }

        hands.push(...data.hands);

        updateStatus(`Fetched ${hands.length} hands.`);

        return getHands(session, playerId, hands, null, done);
    };

    xhr.send(null);
}

function updateStatus(message) {
    try {
        port.postMessage({
            action: 'hc.updateStatus',
            message,
        });
    } catch (err) {
        console.log('could not communicate with port');
        console.log(JSON.stringify(err));
    }
}

function initializePort() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            if (!tabs.length) {
                return reject();
            }
            port = window.chrome.tabs.connect(tabs[0].id);

            port.onDisconnect.addListener(disconnectedPort => {
                console.log('port disconnected. ' + JSON.stringify(disconnectedPort));
                initializePort();
            });

            return resolve(port);
        });
    });
}
