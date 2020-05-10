// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let linkBtn = document.getElementById('link');
let playBtn = document.getElementById('play');
let pauseBtn = document.getElementById('pause');
let time = document.getElementById('time');
//let timer = document.getElementById('timer');
let iframes;
let tabid = null;
let seconds = document.getElementById('seconds');
seconds.value = localStorage['sync-time'] ? localStorage['sync-time'] : 0;
const pauseScript =
  `
  if(document.querySelector("iframe")) document.querySelector("iframe").contentWindow.postMessage({name:"pause"}, "*");
  if(document.querySelector("video")) document.querySelector("video").pause();
`;

const playScript =
  `
  if(document.querySelector("iframe")) document.querySelector("iframe").contentWindow.postMessage({name:"play"}, "*");
  if(document.querySelector("video")) document.querySelector("video").play();
`;

const socket = io('https://socket-watch-express.herokuapp.com');

socket.on('seek cmd', function (msg) {
  updateTime(msg);
});

socket.on('vlc cmd', function (msg) {
  //console.log(msg);
  switch (msg) {
    case 'play':
      play();
      break;
    case 'pause':
      pause();
      break;
    default:
      break;
  }
});

function play() {
  chrome.windows.getAll({ populate: true }, (windows) => {
    windows.forEach((window) => {
      window.tabs.forEach((tab) => {
        chrome.tabs.executeScript(
          tab.id,
          { code: playScript });
      });
    });
  });
}

function pause() {
  chrome.windows.getAll({ populate: true }, (windows) => {
    windows.forEach((window) => {
      window.tabs.forEach((tab) => {
        chrome.tabs.executeScript(
          tab.id,
          { code: pauseScript });
      });
    });
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  tabid = tabs[0].id;
  localStorage[tabid] = 1;
  console.log(localStorage[tabid]);
  chrome.tabs.executeScript(
    tabs[0].id,
    {
      "file": "inject.js"
    });
});



linkBtn.onclick = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    tabid = tabs[0].id;
    localStorage[tabid] = 1;
    console.log(localStorage[tabid]);
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        "file": "inject.js",
        "allFrames": true
      });
  });
  link.style.color = 'green';
}

seconds.onchange = () => localStorage['sync-time'] = seconds.value;

pauseBtn.onclick = function () {
  socket.emit('vlc cmd', 'pause');
}

playBtn.onclick = function () {
  socket.emit('vlc cmd', 'play');
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.name === 'time') {
      time.value = request.value;
      time.max = request.max;
      //timer.innerText = request.value;
    }
  }
);



time.oninput = function () {
  console.log(this.value);
  socket.emit('seek cmd', this.value);
}


function updateTime(time) {
  console.log(time);
  pauseBtn.click();
//   let updateTime =
//     `
// if(document.querySelector("iframe") && window.location.href.includes('crunchyroll')) document.querySelector("iframe").contentWindow.postMessage({name: "time", value: ${this.value - seconds.value}}, "*");
// if(document.querySelector("video") && window.location.href.includes('youtube')) document.querySelector("video").currentTime = ${this.value};
// else if (document.querySelector("video")) document.querySelector("video").currentTime = ${this.value - seconds.value};
// `;

  let seekCode = `if (document.querySelector("video")) document.querySelector("video").currentTime = ${time};`;
  chrome.windows.getAll({ populate: true }, (windows) => {
    windows.forEach((window) => {
      window.tabs.forEach((tab) => {
        chrome.tabs.executeScript(
          tab.id,
          { code: seekCode });
      });
    });
  });
}


