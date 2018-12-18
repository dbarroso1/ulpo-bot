var isBotActive = false;

console.log("Whatsapp Activated")
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "hello")
            sendResponse({ farewell: "goodbye" });
    });

/**
 * 
var botCheck = 3000;
var mssg_in = [];
var isActive = false;
var list = document.getElementById('zn-w3x9-console-log');
var actvBttn = document.getElementById('on_off_switch');

function logger(log) {
    var entry = document.createElement('li');
    var time = new Date(Date.now()).toLocaleString('en-US');
    entry.appendChild(document.createTextNode(time + ": [ULPO-BOT] " + log));
    list.appendChild(entry);
    console.log(log)
}

function initBot() {
    isActive = !isActive;
    chrome.storage.sync.set({ isBotActive: isActive });

    if (isActive == true) { getConvo(); logger('STATUS: Active'); }
    else { logger('STATUS: Inactive'); }
}

function setBotCheck() {
    let newVal = document.getElementById("botSnifInt").value
    chrome.storage.sync.set({ sniffInt: newVal });
    botCheck = newVal
}
window.onload = function () {
    logger(`Bot Listening...`)
    console.log("Fired?")
    chrome.storage.sync.get('sniffInt', function (data) {
        document.getElementById("botSnifInt").value = data.sniffInt;
    })
    chrome.storage.sync.get('isBotActive', function (data) {
        let status = data.isBotActive
        if (status) {
            isActive = status
            actvBttn.setAttribute("checked", "checked");
            logger('STATUS: Active');
        }
        else {
            isActive = status
            actvBttn.removeAttribute("checked", "checked");
            logger('STATUS: Inactive');
        }
    });

    $('ul.tabs').tabs();
    $('ul.tabs').tabs('select_tab', 'tab_id');
    document.getElementById('on_off_switch').addEventListener('change', initBot);
    document.getElementById('botSnifInt').addEventListener('change', setBotCheck);
}



function getConvo() {
    alert("GET CONVO")
    setInterval(() => {
        //$('div.message-in').each(function () { mssg_in.indexOf($(this).text()) === -1 ? mssg_in.push($(this).text()) : null })
    }, botCheck)
}



// https://stackoverflow.com/questions/28277312/chrome-extensions-saving-settings
 */