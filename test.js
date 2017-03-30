// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

goog.require('proto.videoconf.gvc.hotrodapi.CommandId');
goog.require('proto.videoconf.gvc.hotrodapi.VideoConfMessageProto');
goog.require('proto.videoconf.gvc.hotrodapi.VideoConfResponseProto');
goog.require('proto.videoconf.gvc.hotrodapi.VideoConfResponseProto.CPUTemperatureResponse');

function updateTemperatureField(fieldName, temps) {
  var output = '';
  for (var i = 0; i < temps.length; i++)
    output += (temps[i] / 1000).toFixed(3) + '\n';
  document.getElementById(fieldName).innerText = output;
}

var fieldName = 'result';
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
  var responseProto =
      proto.videoconf.gvc.hotrodapi.VideoConfResponseProto.
          deserializeBinary(responseData);
  var tempList = responseProto.getCpuTemperature().getTemperatureList();
  console.log(status, tempList);
  updateTemperatureField(fieldName, tempList);
}

var alarmName = 'update';
chrome.alarms.onAlarm.addListener(function(alarm) {
  console.log(alarm.name);
  if (alarm.name == alarmName) {
    var sendProto = new proto.videoconf.gvc.hotrodapi.VideoConfMessageProto();
    sendProto.setCommand(
        proto.videoconf.gvc.hotrodapi.CommandId.GET_CPU_TEMPERATURE);
    chrome.serviceCommsPrivate.sendData(
        sendProto.serializeBinary().buffer,
        sendDataResponseHandler);
  }
});

chrome.alarms.create(alarmName, {delayInMinutes: 0.02, periodInMinutes: 0.02});
