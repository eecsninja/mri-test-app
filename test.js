// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function sendDataResponseHandler(response) {
  // |response| is an array containing the callback arguments.
  //   response[0]: status
  //   response[1]: data_blob
  if (response.length < 2) {
    console.log('Expected response with 2 elements, but got' + response.length);
    return;
  }
  var status = response[0];
  if (status != 'SUCCESS') {
    console.log('Got status: ' + status);
    return;
  }
  var responseData = response[1];
  var responseStr = ab2str(responseData);

  var fieldName = (responseData.byteLength % 2 == 0) ? 'result1' : 'result2';
  document.getElementById(fieldName).innerText = responseStr;
}

var alarmName = 'update';
chrome.alarms.onAlarm.addListener(function(alarm) {
  console.log(alarm.name);
  if (alarm.name == alarmName) {
    var msg1 = 'hello world!';
    var msg2 = 'hello world!!';
    chrome.serviceCommsPrivate.sendData(str2ab(msg1), sendDataResponseHandler);
    chrome.serviceCommsPrivate.sendData(str2ab(msg2), sendDataResponseHandler);
  }
});

chrome.alarms.create(alarmName, {delayInMinutes: 0.02, periodInMinutes: 0.02});
