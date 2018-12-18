// Bot Settings
var botTimer, botResTime, botActive;

// Popup DOM Variables
var botSwitch = document.getElementById('botInitButton');
var botTimeInt = document.getElementById('botTimeInterval');
var botResponseInt = document.getElementById('botResponseTime');
var list = document.getElementById('zn-w3x9-console-log');

const logger = function (log) {
    var entry = document.createElement('li');
    var a = new Date(), b = a.getHours().toLocaleString('en-US'), c = a.getMinutes().toLocaleString('en-US'), d = b + ":" + c
    entry.appendChild(document.createTextNode(`[ULPO-BOT] ${log}`));
    list.appendChild(entry);
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
    let newVal = document.getElementById('botTimeInterval').value;
    chrome.storage.sync.set({ botTime: newVal });
    botTimer = newVal
}

window.onload = () => {
    chrome.storage.sync.get('botTime', (data) => { botTimer = data.botTime; botTimeInt.value = botTimer || 3000; })
    chrome.storage.sync.get('botInit', (data) => {
        botActive = data.botInit;
        if (botActive) {
            botSwitch.setAttribute("checked", "checked");
            logger('Status: ACTIVE');
        }
        else {
            botSwitch.removeAttribute("checked", "checked");
            logger('Status: INACTIVE');
        }
    })

    botSwitch.addEventListener('change', setBotInit);
    botTimeInt.addEventListener('change', setBotTime);

    var tabs = document.querySelectorAll('.tabs')
    var collapsible = document.querySelectorAll('.collapsible');
    for (var i = 0; i < collapsible.length; i++) {
        M.Collapsible.init(collapsible[i]);
    }
    for (var i = 0; i < tabs.length; i++) {
        M.Tabs.init(tabs[i]);
    }
}

