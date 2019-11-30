/* in-content.js
 *
 * This file has an example on how to communicate with other parts of the extension through a long lived connection (port) and also through short lived connections (chrome.runtime.sendMessage).
 *
 * Note that in this scenario the port is open from the popup, but other extensions may open it from the background page or not even have either background.js or popup.js.
 * */

// Extension port to communicate with the popup, also helps detecting when it closes

import * as $ from './jquery.js';

let port = null;

// Send messages to the open port (Popup)
const sendPortMessage = data => port.postMessage(data);

// Handle incoming popup messages
const popupMessageHandler = message => console.log('in-content.js - message from popup:', message);

// Start scripts after setting up the connection to popup
chrome.extension.onConnect.addListener(popupPort => {
    // Listen for popup messages
    popupPort.onMessage.addListener(popupMessageHandler);
    // Set listener for disconnection (aka. popup closed)
    popupPort.onDisconnect.addListener(() => {
        console.log('in-content.js - disconnected from popup');
    });
    // Make popup port accessible to other methods
    port = popupPort;
    // Perform any logic or set listeners
    sendPortMessage('message from in-content.js');
});

// Response handler for short lived messages
const handleBackgroundResponse = response =>
    console.log('in-content.js - Received response:', response);

// Send a message to background.js
chrome.runtime.sendMessage('Message from in-content.js!', handleBackgroundResponse);

let chatbotHtmlString = `
<!--
Inspired by https://dribbble.com/supahfunk
-->
<section class="avenue-messenger">
  <div class="menu">
   <div class="items"><span>
     <a href="#" title="Minimize">&mdash;</a><br>
<!--     
     <a href="">enter email</a><br>
     <a href="">email transcript</a><br>-->
     <a href="#" title="End Chat">&#10005;</a>
     
     </span></div>
    <div class="button">...</div>
  </div>
  <div class="agent-face">
    <div class="half">
     <img class="agent circle" src="https://cdn3.iconfinder.com/data/icons/chat-bot-emoji-blue-filled-color/300/14134081Untitled-3-512.png" alt="Chatbot"></div>
  </div>
<div class="chat">
  <div class="chat-title">
    <h1>Chatbot</h1>
  <!--  <figure class="avatar">
      <img src="https://cdn3.iconfinder.com/data/icons/chat-bot-emoji-blue-filled-color/300/14134081Untitled-3-512.png" /></figure>-->
  </div>
  <div class="messages">
    <div class="messages-content"></div>
  </div>
  <div class="message-box">
    <textarea type="text" class="message-input" placeholder="Type message..."></textarea>
    <button type="submit" class="message-submit">Send</button>
  </div>
</div>
  </div>
<!--<div class="bg"></div>-->
`;

var chatBot = document.createElement('div');
chatBot.innerHTML = chatbotHtmlString;

document.body.appendChild(chatBot);

var $messages = $('.messages-content'),
    d,
    h,
    m,
    i = 0;

$(window).load(function() {
    $messages.mCustomScrollbar();
    setTimeout(function() {
        fakeMessage();
    }, 100);
});

function updateScrollbar() {
    $messages.mCustomScrollbar('update').mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
    });
}

function setDate() {
    d = new Date();
    if (m != d.getMinutes()) {
        m = d.getMinutes();
        $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo(
            $('.message:last')
        );
        $('<div class="checkmark-sent-delivered">&check;</div>').appendTo($('.message:last'));
        $('<div class="checkmark-read">&check;</div>').appendTo($('.message:last'));
    }
}

function insertMessage() {
    msg = $('.message-input').val();
    if ($.trim(msg) == '') {
        return false;
    }
    $('<div class="message message-personal">' + msg + '</div>')
        .appendTo($('.mCSB_container'))
        .addClass('new');
    setDate();
    $('.message-input').val(null);
    updateScrollbar();
    setTimeout(function() {
        fakeMessage();
    }, 1000 + Math.random() * 20 * 100);
}

$('.message-submit').click(function() {
    insertMessage();
});

$(window).on('keydown', function(e) {
    if (e.which == 13) {
        insertMessage();
        return false;
    }
});

var Fake = [
    
];

function fakeMessage() {
    if ($('.message-input').val() != '') {
        return false;
    }
    $(
        '<div class="message loading new"><figure class="avatar"><img src="http://askavenue.com/img/17.jpg" /></figure><span></span></div>'
    ).appendTo($('.mCSB_container'));
    updateScrollbar();

    setTimeout(function() {
        $('.message.loading').remove();
        $(
            '<div class="message new"><figure class="avatar"><img src="http://askavenue.com/img/17.jpg" /></figure>' +
                Fake[i] +
                '</div>'
        )
            .appendTo($('.mCSB_container'))
            .addClass('new');
        setDate();
        updateScrollbar();
        i++;
    }, 1000 + Math.random() * 20 * 100);
}

$('.button').click(function() {
    $('.menu .items span').toggleClass('active');
    $('.menu .button').toggleClass('active');
});
