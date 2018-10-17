# global-poker-hand-history-converter-chrome-extension
This chrome extension enables you to download your Global Poker hand histories in the same format that Poker Stars uses for its hands for importing into Poker Tracker 4.

This repository holds the source code for the chrome extension. The source code for actually converting hand histories to poker stars lives [here](https://github.com/mr-feek/global-poker-hand-history-converter). Therefore, any issues regarding the actual conversion of hand histories should be opened up there.

## Installation
~[Chrome Extension](https://chrome.google.com/webstore/detail/global-poker-hand-history/mfafilnnjcmjfbpcnkjcddcnjcjopopa?hl=en)~
Per the request of Global Poker, this extension has been removed from the web store.

- clone this repository `git clone https://github.com/mr-feek/global-poker-hand-history-converter-chrome-extension.git`
- `cd global-poker-hand-history-converter-chrome-extension`
- Install dependencies: `yarn install`
- Build the extension
    - OS X: `npm run dist`
    - WINDOWS: `SET NODE_ENV=production & npm run build`
  you will now notice that `build/` directory has files. This is where you will load the chrome extension into chrome from.
- open up chrome and navigate to `chrome://extensions`
- in the top left, click on `Load unpacked`
- select the `build` directory of the plugin (it will be inside of wherever you cloned the chrome extension to)


## Usage
Login to global poker and navigate to Profile > Hand History. You will see a new piece of UI inserted on the page which will enable you to download the converted hand histories.

Image coming soon...

## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/mr-feek/global-poker-hand-history-converter-chrome-extension/badge.svg?style=beer-square)](https://beerpay.io/mr-feek/global-poker-hand-history-converter-chrome-extension)  [![Beerpay](https://beerpay.io/mr-feek/global-poker-hand-history-converter-chrome-extension/make-wish.svg?style=flat-square)](https://beerpay.io/mr-feek/global-poker-hand-history-converter-chrome-extension?focus=wish)
