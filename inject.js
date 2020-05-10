window.onmessage = function (e) {
    if (e.data.name === 'play' && document.querySelector('video')) {
        console.log(window.location.href);
        document.querySelector('video').play();
    }
    else if (e.data.name === 'pause' && document.querySelector('video')) {
        document.querySelector('video').pause();
    }
    else if (e.data.name === 'time' && document.querySelector('video')) {
        document.querySelector('video').currentTime = e.data.value;
    }
};

if (document.querySelector('video')) {
    let videoPlayer = document.querySelector('video');
    videoPlayer.ontimeupdate = () => {
        if (window.location.href.includes('youtube')) sendMessage({ name: 'time', value: videoPlayer.currentTime, max: videoPlayer.duration });
    }
}

function sendMessage(msg) {
    chrome.runtime.sendMessage(
        msg,
        function (response) {
            var lastError = chrome.runtime.lastError;
            if (lastError) {
                return;
            }
        }
    );
}
console.log(window.location.href);