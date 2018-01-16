import bugsnag from 'bugsnag-js';

export default bugsnag({
    apiKey: 'b461a63b9d64eb4be4ea1829bd00457e',
    beforeSend(report) {
        report.stacktrace = report.stacktrace.map(frame => {
            frame.file = frame.file.replace(/chrome-extension:/g, 'chrome_extension:');
            return frame;
        });
    },
});
