// Bot Settings
var botActive, botSniffInterval, botReplyDelay, botTalkRate;

// Popup DOM Variables
var botSwitch = document.getElementById('botInitButton');
var list = document.getElementById('zn-w3x9-console-log');
var botTimeInt = document.getElementById('b1');
var botRespInt = document.getElementById('b2');
var botTalkInt = document.getElementById('b3');

const logger = function (log) {
    var entry = document.createElement('li');
    var a = new Date(), b = a.getHours().toLocaleString('en-US'), c = a.getMinutes().toLocaleString('en-US'), d = b + ":" + c
    entry.appendChild(document.createTextNode(`[ULPO-BOT] ${log}`));
    list.appendChild(entry);
    chrome.runtime.sendMessage({ logger: list })
}

function setBotInit() {
    botActive = !botActive;
    chrome.storage.sync.set({ botInit: botActive }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { botInit: botActive });
        });
    });

    if (botActive == true) { logger('Status: ACTIVE'); }
    else if (botActive == false) { logger('Status: INACTIVE'); }
}

function setBotTime() {
    // Sets Bot Sniffing Interval
    let _a = botTimeInt.value;
    chrome.storage.sync.set({ botTime: _a }, () => { botSniffInterval = _a });
}
function setBotReplyDelay() {
    // Sets Delay for Bot replies
    let _a = botRespInt.value;
    chrome.storage.sync.set({ botReply: _a }, () => { botReplyDelay = _a });
}
function setBotTalkRate() {
    // Sets Time for Bot Random Talk
    let _a = botTalkInt.value;
    chrome.storage.sync.set({ botTalk: _a }, () => { botTalkRate = _a });

}
window.onload = () => {
    chrome.storage.sync.get('botTime', (data) => {
        botSniffInterval = data.botTime;
        botTimeInt.value = botSniffInterval || 3000;
    })
    chrome.storage.sync.get('botReply', (data) => {
        botReplyDelay = data.botReply;
        botRespInt.value = botReplyDelay || 3000;
    })
    chrome.storage.sync.get('botTalk', (data) => {
        botSniffInterval = data.botTalk;
        botTalkInt.value = botSniffInterval || 10;
    })

    chrome.storage.sync.get('botInit', (data) => {
        botActive = data.botInit;
        if (botActive) { botSwitch.setAttribute("checked", "checked"); logger('Status: ACTIVE'); }
        else { botSwitch.removeAttribute("checked", "checked"); logger('Status: INACTIVE'); }
    })

    botSwitch.addEventListener('change', setBotInit);
    botTimeInt.addEventListener('change', setBotTime);
    botRespInt.addEventListener('change', setBotReplyDelay);
    botTalkInt.addEventListener('change', setBotTalkRate);

    var tabs = document.querySelectorAll('.tabs')
    var collapsible = document.querySelectorAll('.collapsible');
    for (var i = 0; i < collapsible.length; i++) { M.Collapsible.init(collapsible[i]); }
    for (var i = 0; i < tabs.length; i++) { M.Tabs.init(tabs[i]); }
}

