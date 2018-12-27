const WEB = chrome.webRequest
var bot_active, bot_interval, bot_response, bot_delay, console_list;
var pt_dt, pt_rrq, pt_motd;
var toggle_rive;

//WEB.onBeforeRequest.addListener((res) => { console.log("[" + res.method + "]: ", res) }, { urls: ["https://web.whatsapp.com/*"] }, ['requestBody']);

chrome.storage.sync.get('botTime', (data) => { bot_interval = data.botTime; })
chrome.storage.sync.get('botInit', (data) => { bot_active = data.botInit; })
chrome.storage.sync.get('botReply', (data) => { bot_delay = data.botReply; })
chrome.storage.sync.get('task_dt', (data) => { pt_dt = data.task_dt; })
chrome.storage.sync.get('task_motd', (data) => { pt_motd = data.task_motd; })
chrome.storage.sync.get('task_rrq', (data) => { pt_rrq = data.task_rrq; })
chrome.storage.sync.get('toggle_riveScript', (data) => { toggle_rive = data.toggle_riveScript; })

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let data = {
        bot_act: bot_active,
        bot_int: bot_interval,
        bot_reply: bot_delay,
        task_dt: pt_dt,
        task_motd: pt_motd,
        task_rrq: pt_rrq,
        toggle_riveScript: toggle_rive,
        logger: console_list
    };

    chrome.storage.sync.get('botInit', (data) => {
        bot_active = data.botInit;

        if (bot_active == true) {
            chrome.browserAction.setBadgeText({ text: "ON" });
            chrome.browserAction.setBadgeBackgroundColor({ color: "#20e287" });
        }
        else if (bot_active == false) {
            chrome.browserAction.setBadgeText({ text: "OFF" });
            chrome.browserAction.setBadgeBackgroundColor({ color: "#c7373760" });
        }
    })
    sendResponse(data);
}); 