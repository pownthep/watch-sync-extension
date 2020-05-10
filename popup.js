// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let link = document.getElementById('link');
let play = document.getElementById('play');
let pause = document.getElementById('pause');
let time = document.getElementById('time');
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

link.onclick = function () {
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

pause.onclick = function () {
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

play.onclick = function () {
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

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.name === 'time') {
      time.value = request.value;
      time.max = request.max;
    }
  }
);

time.oninput = function updateTime() {
  pause.click();
  let updateTime =
`
if(document.querySelector("iframe") && window.location.href.includes('crunchyroll')) document.querySelector("iframe").contentWindow.postMessage({name: "time", value: ${this.value-seconds.value}}, "*");
if(document.querySelector("video") && window.location.href.includes('youtube')) document.querySelector("video").currentTime = ${this.value};
else if (document.querySelector("video")) document.querySelector("video").currentTime = ${this.value-seconds.value};
`;
  chrome.windows.getAll({ populate: true }, (windows) => {
    windows.forEach((window) => {
      window.tabs.forEach((tab) => {
        chrome.tabs.executeScript(
          tab.id,
          { code: updateTime });
      });
    });
  });
}


