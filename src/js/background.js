import '../img/icon-128.png';
import '../img/icon-34.png';

import {convertHand} from '@mr-feek/global-poker-hand-history-converter/src/Converter';
import GlobalPokerHand from '@mr-feek/global-poker-hand-history-converter/src/GlobalPokerHand';
import {getParams} from './utils';
import bugsnagClient from './bugsnagClient';

let latestHandStartTime; // Time of last hand that was played. Used for fetching the first batch of hand histories
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
            determineLatestHandStartTime().then(() => {
                updateStatus(`last played hand: ${latestHandStartTime}`);

                fetchAndConvertHands(
                    request.options.handsToFetch,
                    data => {
                        sendResponse({success: true, data});
                    },
                    data => {
                        sendResponse({success: false, data});
                    }
                );
            });
        });
    }

    return true;
});

// Sets the global latestHandStartTime to be used in the first request for fetching hand histories from the API
function determineLatestHandStartTime() {
    updateStatus('Fetching last played hand');

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `https://play.globalpoker.com/player-api/rest/player/handhistory/XSD?count=0&startTime=0&descending=true&session=${session}&playerId=${playerId}&r=${Math.random()}`;
        xhr.open('GET', url, true);

        xhr.onload = function () {
            const data = JSON.parse(xhr.response);

            if (!data || !data.latestHandStartTime) {
                return reject();
            }

            latestHandStartTime = data.latestHandStartTime;
            return resolve();
        };

        xhr.send(null);
    });
}

function fetchAndConvertHands(numberOfHandsToFetch, success, failure) {
    const successCallback = success;
    const failureCallback = failure;

    getHands(session, playerId, [], numberOfHandsToFetch, hands => {
        updateStatus('Finished fetching hands. Now converting to poker stars format for download.');

        let count = 1;
        const converted = hands.map(handHistoryBlob => {
            let convertedHand = convertHand(new GlobalPokerHand(handHistoryBlob));
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

function getHands(session, playerId, hands, numberOfHandsToFetch, done) {
    if (hands.length >= numberOfHandsToFetch) {
        return done(hands);
    }

    const count = 50;
    const lastHand = hands[hands.length - 1];

    const startTime = lastHand ? lastHand.startTime - 1 : latestHandStartTime;

    const xhr = new XMLHttpRequest();
    const url = `https://play.globalpoker.com/player-api/rest/player/handhistory/XSD?count=${count}&startTime=${startTime}&descending=true&session=${session}&playerId=${playerId}&r=${Math.random()}`;

    xhr.open('GET', url, true);

    xhr.onload = function () {
        const data = JSON.parse(xhr.response);

        if (!data || !data.hands || data.hands.length === 0) {
            return done(hands);
        }

        hands.push(...data.hands);

        updateStatus(`Fetched ${hands.length} hands.`);

        return getHands(session, playerId, hands, numberOfHandsToFetch, done);
    };

    xhr.send(null);
}

function updateStatus(message) {
    port.postMessage({
        action: 'hc.updateStatus',
        message
    });
}

function initializePort() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (!tabs.length) {
                return reject();
            }
            port = window.chrome.tabs.connect(tabs[0].id);
            return resolve(port);
        });
    });
}
