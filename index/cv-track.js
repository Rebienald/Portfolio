var _lastCvSend = 0;

var _cvClickTimes = [];

function sendCvAlert() {
    try {
        var now = Date.now();
        if (now - _lastCvSend < 1500) return;
        _cvClickTimes = _cvClickTimes.filter(function (t) {
            return now - t < 6e4;
        });
        if (_cvClickTimes.length >= 5) return;
        _cvClickTimes.push(now);
        _lastCvSend = now;
        var endpoint =
            window.location.protocol.indexOf("http") === 0 &&
            window.location.hostname !== "localhost" &&
            window.location.hostname !== "127.0.0.1"
                ? "/api/cv-download"
                : "https://rebkhei.vercel.app/api/cv-download";
        var payload = JSON.stringify({
            timestamp: new Date().toISOString(),
            page: window.location.href,
            screen: window.screen ? window.screen.width + "x" + window.screen.height : "unknown",
            ua: navigator.userAgent || "unknown",
        });
        if (navigator.sendBeacon) {
            try {
                navigator.sendBeacon(endpoint, payload);
            } catch (e) {}
        }
        try {
            fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: payload,
                keepalive: true,
                mode: "cors",
            }).catch(function () {});
        } catch (e) {}
        try {
            var img = new Image();
            img.src = endpoint + "?t=" + now;
            window._cvAlertImg = img;
        } catch (e) {}
    } catch (err) {}
}
