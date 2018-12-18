const WEB = chrome.webRequest

console.log("ULPO-BOT is Listening...")

WEB.onBeforeRequest.addListener(
    (res) => { console.log("[" + res.method + "]: ", res) },
    { urls: ["https://web.whatsapp.com/*"] }, ['requestBody']);

