// Bot Settings
var botTimer = 1000;
var botActive = false;

// DOM Variables
var botSwitch = document.getElementById('botInitButton');
var botTimeInt = document.getElementById('botTimeInterval');
var list = document.getElementById('zn-w3x9-console-log');

const logger = function (log) {
    var entry = document.createElement('li');
    var time = new Date(Date.now()).toLocaleString('en-US');
    entry.appendChild(document.createTextNode(time + ": [ULPO-BOT] " + log));
    list.appendChild(entry);
}


// Functions for BOT
function setBotInit() {
    botActive = !botActive
    chrome.storage.sync.set({ botInit: botActive });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "hello" }, function (response) {
            console.log(response.farewell);
        });
    });
    if (botActive == true) { logger('STATUS: Active'); }
    else if (botActive == false) { logger('STATUS: Inactive'); }

}

function setBotTime() {
    let newVal = document.getElementById('botTimeInterval').value;
    chrome.storage.sync.set({ botTime: newVal });
    botTimer = newVal
}

window.onload = () => {
    chrome.storage.sync.get('botTime', (data) => {
        botTimer = data.botTime;
        document.getElementById("botTimeInterval").value = data.botTime;
    })
    chrome.storage.sync.get('botInit', (data) => {
        let status = data.botInit;
        if (status) {
            botActive = status
            botSwitch.setAttribute("checked", "checked");
            logger('STATUS: Active');
        }
        else {
            botActive = status
            botSwitch.removeAttribute("checked", "checked");
            logger('STATUS: Inactive');
        }
    })
    botSwitch.addEventListener('change', setBotInit);
    botTimeInt.addEventListener('change', setBotTime);
}

$(document).ready(function () {
    $('ul.tabs').tabs();
    $('ul.tabs').tabs('select_tab', 'tab_id');
}); 