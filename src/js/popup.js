// Bot Settings
var botActive, botSniffInterval, botReplyDelay, botTalkRate;
var task_toggle_dt, task_toggle_motd, task_toggle_rrq;
var rive_script_toggle;

// Popup DOM Variables
var botSwitch = document.getElementById('botInitButton');
var list = document.getElementById('zn-w3x9-console-log');
var botTimeInt = document.getElementById('b1');
var botRespInt = document.getElementById('b2');
var botTalkInt = document.getElementById('b3');
var pt_dt = document.getElementById('task-dt');
var pt_rrq = document.getElementById('task-rrq');
var pt_motd = document.getElementById('task-motd');
var rive_tg = document.getElementById('toggle-rive')

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

    if (botActive == true) {
        logger('Status: ACTIVE');
        chrome.browserAction.setBadgeText({ text: "ON" });
        chrome.browserAction.setBadgeBackgroundColor({ color: "#20e287" });
    }
    else if (botActive == false) {
        logger('Status: INACTIVE');
        chrome.browserAction.setBadgeText({ text: "OFF" });
        chrome.browserAction.setBadgeBackgroundColor({ color: "#c7373760" });
    }
}
// Needs to send message when value has changed so bot.js can read it
// Follow example of init, to send message to tab(bot.js)
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
function setTaskDT() {
    task_toggle_dt = !task_toggle_dt
    chrome.storage.sync.set({ task_dt: task_toggle_dt });
}
function setTaskMotd() {
    // Sets Time for Bot Random Talk
    task_toggle_motd = !task_toggle_motd
    chrome.storage.sync.set({ task_motd: task_toggle_motd });
}
function setTaskRrq() {
    // Sets Time for Bot Random Talk
    task_toggle_rrq = !task_toggle_rrq
    chrome.storage.sync.set({ task_rrq: task_toggle_rrq });
}
function setToggleRive() {
    // Sets Time for Bot Random Talk
    rive_tg = !rive_tg
    chrome.storage.sync.set({ toggle_riveScript: rive_tg });
}
window.onload = () => {
    chrome.storage.sync.get('botTime', (data) => { botSniffInterval = data.botTime; botTimeInt.value = botSniffInterval || 3000; })
    chrome.storage.sync.get('botReply', (data) => { botReplyDelay = data.botReply; botRespInt.value = botReplyDelay || 3000; })
    chrome.storage.sync.get('botTalk', (data) => { botSniffInterval = data.botTalk; botTalkInt.value = botSniffInterval || 10; })

    chrome.storage.sync.get('task_dt', (data) => {
        task_toggle_dt = data.task_dt;
        if (task_toggle_dt) { pt_dt.setAttribute("checked", "checked"); }
        else { pt_dt.removeAttribute("checked", "checked"); }
    })
    chrome.storage.sync.get('task_motd', (data) => {
        task_toggle_motd = data.task_motd;
        if (task_toggle_motd) { pt_motd.setAttribute("checked", "checked"); }
        else { pt_motd.removeAttribute("checked", "checked"); }
    })
    chrome.storage.sync.get('task_rrq', (data) => {
        task_toggle_rrq = data.task_rrq;
        if (task_toggle_rrq) { pt_rrq.setAttribute("checked", "checked"); }
        else { pt_rrq.removeAttribute("checked", "checked"); }
    })
    chrome.storage.sync.get('toggle_riveScript', (data) => {
        console.log(data)
        rive_script_toggle = data.toggle_riveScript;
        if (rive_script_toggle) { rive_tg.setAttribute("checked", "checked"); }
        else { rive_tg.removeAttribute("checked", "checked"); }
    })

    chrome.storage.sync.get('botInit', (data) => {
        console.log(data)
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
    botRespInt.addEventListener('change', setBotReplyDelay);
    botTalkInt.addEventListener('change', setBotTalkRate);
    pt_dt.addEventListener('change', setTaskDT);
    pt_rrq.addEventListener('change', setTaskRrq);
    pt_motd.addEventListener('change', setTaskMotd);
    rive_tg.addEventListener('change', setToggleRive);

    var tabs = document.querySelectorAll('.tabs')
    var collapsible = document.querySelectorAll('.collapsible');
    for (var i = 0; i < collapsible.length; i++) { M.Collapsible.init(collapsible[i]); }
    for (var i = 0; i < tabs.length; i++) { M.Tabs.init(tabs[i]); }
}

