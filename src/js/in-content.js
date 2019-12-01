/* in-content.js
 *
 * This file has an example on how to communicate with other parts of the extension through a long lived connection (port) and also through short lived connections (chrome.runtime.sendMessage).
 *
 * Note that in this scenario the port is open from the popup, but other extensions may open it from the background page or not even have either background.js or popup.js.
 * */

// Extension port to communicate with the popup, also helps detecting when it closes

const $ = require('jquery');
const Vue = require('vue');
const BotUI = require('botui');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

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

const assistantId = '5fe4c9f1-89c9-4b24-be16-4c4b2c69ac70';
const assistantUrl = 'https://gateway-wdc.watsonplatform.net/assistant/api';
const apiKey = 'gAigBCO4IRFtyri4iSEIOOtFqoboEGP8h4x0Zz8pc8MV';

var options = {
    url: assistantUrl + '/v2/assistants/' + assistantId + '/sessions',
    method: 'POST',
    auth: {
        user: 'apikey',
        pass: apiKey
    }
};
$(document).ready(function() {
    const service = new AssistantV2({
        version: '2019-02-28',
        authenticator: new IamAuthenticator({
            apikey: "gAigBCO4IRFtyri4iSEIOOtFqoboEGP8h4x0Zz8pc8MV"
        }),
        url: "https://gateway-wdc.watsonplatform.net/assistant/api"
    });
    setTimeout(function() {
        console.log(service);
        service
            .createSession({
                assistantId: "5fe4c9f1-89c9-4b24-be16-4c4b2c69ac70"
            })
            .then(res => {
                console.log(JSON.stringify(res, null, 2));
            })
            .catch(err => {
                console.log(err);
            });
    }, 1000);
});
let chatbotHtmlString = `

<div class="botui-app-container">
    <div id="my-botui-app">
        <bot-ui>

        </bot-ui>
    </div>
    <div class="chat-message clearfix">
    <textarea name="message-to-send" id="message-to-send"
        placeholder="Type your message" rows="3"></textarea>

    <i class="fa fa-file-o"></i> &nbsp;&nbsp;&nbsp;
    <i class="fa fa-file-image-o"></i>

    <button id="chatbot-send">Send</button>

    </div>
</div>
`;

var chatBot = document.createElement('div');
chatBot.innerHTML = chatbotHtmlString;

$('body').append(chatBot);

$('#help-chatbot-button').click(function() {
    $(this).hide();
    $('.botui-app-container').show();
});

const botui = BotUI('my-botui-app', {
    vue: Vue // pass the dependency.
});

function getBotResponse(msg) {
    service
        .message({
            assistantId: assistantId,
            sessionId: service.sessionId,
            input: {
                message_type: 'text',
                text: msg
            }
        })
        .then(res => {
            console.log(res);
            return JSON.stringify(res, null, 2);
        })
        .catch(err => {
            return 'Chatbot could not be reached. Please try again later.';
        });
}

function botMessage(text) {
    botui.message.bot({ content: text });
}

function humanMessage(msg) {
    let $hMessage = $('<div>', { class: 'human-message' });
    $hMessage.text(msg);
    $('.botui-messages-container').append($hMessage);
}

function sendMessage(msg) {
    humanMessage(msg);
    getBotResponse(msg);
}

$('#chatbot-send').click(function() {
    let msg = $('#message-to-send').val();
    sendMessage(msg);
    $('#message-to-send').val('');
});

humanMessage("Hello!");