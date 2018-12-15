const WEB = chrome.webRequest

console.log("Active")

WEB.onBeforeRequest.addListener(
    (res) => { console.log("[" + res.method + "]: ", res) },
    { urls: ["https://web.whatsapp.com/*"] }, ['requestBody']);