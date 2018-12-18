const WEB = chrome.webRequest
var bot_active, bot_interval, bot_response

chrome.storage.sync.get('botTime', (data) => { bot_interval = data.botTime; })
chrome.storage.sync.get('botInit', (data) => { bot_active = data.botInit; })

WEB.onBeforeRequest.addListener((res) => { console.log("[" + res.method + "]: ", res) },
    { urls: ["https://web.whatsapp.com/*"] }, ['requestBody']);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let data = { bot_act: bot_active, bot_int: bot_interval };
    chrome.storage.sync.get('botInit', (data) => { bot_active = data.botInit; })
    sendResponse(data);
});