var isBotActive, botInterval;
var intervalId;
var mssg_in = [];
var lastMessageOnChat = false;
var ignoreLastMsg = {};
var bot = {};
var bot_foucused = false; // If the bot is foucused 
var date = new Date;
var d_hour = date.getDate();
var d_min = date.getMonth();
var elementConfig = { "chats": [1, 0, 5, 2, 0, 3, 0, 0, 0], "chat_icons": [0, 0, 1, 1, 1, 0], "chat_title": [0, 0, 1, 0, 0, 0, 0], "chat_lastmsg": [0, 0, 1, 1, 0, 0], "chat_active": [0, 0], "selected_title": [1, 0, 5, 3, 0, 1, 1, 0, 0, 0, 0] };
var daily_text, daily_text_body;
var task_dt_toggle, task_motd_toggle, task_rrq_toggle;

var pfl = []; // list of friends and their scores
var bot_random_talk_rate = 42; // the Number that needs to match in order for the Bot to speak.
var replyDelay;
const url = chrome.runtime.getURL('src/data/responses.json');

var sendDelay = false;


var today = new Date(), dd = today.getDate(), mm = today.getMonth() + 1, yyyy = today.getFullYear();
if (dd < 10) { dd = '0' + dd } if (mm < 10) { mm = '0' + mm }
$.ajax({ url: "https://wol.jw.org/en/wol/dt/r1/lp-e/" + yyyy + '/' + mm + '/' + dd, type: 'GET', dataType: 'html', success: function (res) { daily_text = $(res).find('p.themeScrp').text(); daily_text_body = $(res).find('p.sb').text(); }, })
fetch(url).then((response) => response.json()).then((json) => { bot = json; console.log("[ULPO-BOT] Responses Loaded...") });
console.log("[ULPO-BOT] Pablo, is initializing...")

// Get random value between a range
function rand(high, low = 0) { return Math.floor(Math.random() * (high - low + 1) + low); }
function botFocused() {
    bot_foucused = !bot_foucused;
    if (bot_foucused) { console.log("Bot Busy?", bot_foucused) }
    else { console.log("Bot Busy?", bot_foucused); start() }
}
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function getElement(id, parent) {
    if (!elementConfig[id]) { return false; }
    var elem = !parent ? document.body : parent;
    var elementArr = elementConfig[id];
    elementArr.forEach(function (pos) { if (!elem.childNodes[pos]) { return false; } elem = elem.childNodes[pos]; });
    return elem;
}

function getLastMsg() {
    var messages = document.querySelectorAll('.msg');
    var pos = messages.length - 1;
    while (messages[pos] && (messages[pos].classList.contains('msg-system') || messages[pos].querySelector('.message-out'))) { pos--; if (pos <= -1) { return false; } }
    if (messages[pos] && messages[pos].querySelector('.selectable-text')) { return messages[pos].querySelector('.selectable-text').innerText.trim(); }
    else { return false; }
}

function getUnreadChats() {
    var unreadchats = [];
    var chats = getElement("chats");
    if (chats) {
        chats = chats.childNodes;
        for (var i in chats) {
            if (!(chats[i] instanceof Element)) { continue; }
            var icons = getElement("chat_icons", chats[i]).childNodes;
            if (!icons) { continue; }
            for (var j in icons) {
                if (icons[j] instanceof Element) {
                    if (!(icons[j].childNodes[0].getAttribute('data-icon') == 'muted' || icons[j].childNodes[0].getAttribute('data-icon') == 'pinned')) {
                        unreadchats.push(chats[i]);
                        break;
                    }
                }
            }
        }
    }
    return unreadchats;
}

function didYouSendLastMsg() {
    var messages = document.querySelectorAll('.msg');
    if (messages.length <= 0) { return false; }
    var pos = messages.length - 1;

    while (messages[pos] && messages[pos].classList.contains('msg-system')) { pos--; if (pos <= -1) { return -1; } }
    if (messages[pos].querySelector('.message-in')) { return true; }
    return false;
}

const goAgain = (fn, sec) => { if (isBotActive) { setTimeout(fn, sec * 1000) } else { return null } }

// Dispath an event (of click, por instance)
const eventFire = (el, etype) => {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(etype, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    el.dispatchEvent(evt);
}

// Select a chat to show the main box
const selectChat = (chat, cb) => {
    const title = getElement("chat_title", chat).title;
    eventFire(chat.firstChild.firstChild, 'mousedown');
    if (!cb) return;
    const loopFewTimes = () => {
        setTimeout(() => {
            const titleMain = getElement("selected_title").title;
            if (titleMain !== undefined && titleMain != title) { console.log('not yet'); return loopFewTimes(); }
            return cb();
        }, 300);
    }; loopFewTimes();
}

function friendshipLogger(mssg) {
    var _un = (_un = mssg.split(":").shift())
    var user_name = _un.replace(/\s/g, "")
    var exampleUser = [
        { name: "Michael", score: 0 },
        { name: "Carlos", score: 0 },
        { name: "Damian", score: 0 },
        { name: "Geniel", score: 0 },
        { name: "Lemuel", score: 0 },
        { name: "Nardiel", score: 0 },
        { name: "Obi", score: 0 },
        { name: "Ricky", score: 0 },
        { name: "Yoel", score: 0 },
        { name: "Dilean", score: 0 }
    ]
    chrome.storage.sync.set({ fl: exampleUser },
        (data) => { console.log(data) })

}
// Send a message
const sendMessage = (chat, message, cb) => {
    //avoid duplicate sending
    setTimeout(() => {
        var title;

        if (chat) { title = getElement("chat_title", chat).title; }
        else { title = getElement("selected_title").title; }

        ignoreLastMsg[title] = message;
        messageBox = document.querySelectorAll("[contenteditable='true']")[0];

        //add text into input field
        messageBox.innerHTML = message.replace(/  /gm, '');

        //Force refresh
        event = document.createEvent("UIEvents");
        event.initUIEvent("input", true, true, window, 1);
        messageBox.dispatchEvent(event);

        //Click at Send Button
        if (!sendDelay) {
            eventFire(document.querySelector('span[data-icon="send"]'), 'click');
            cb();
        } else {
            setTimeout(() => {
                sendDelay = false
                eventFire(document.querySelector('span[data-icon="send"]'), 'click');
                cb();
            }, 5000)
        }
    }, replyDelay)
}

/* BOT LOGIC */
const start = (_chats, cnt = 0) => {
    if (!bot_foucused) {
        const chats = _chats || getUnreadChats();
        const chat = chats[cnt];
        var processLastMsgOnChat = false;
        var lastMsg, title;
        var time = "[" + formatAMPM(new Date()) + "]"
        var random = Math.floor(Math.random() * 5);
        var now = new Date(), millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0) - now;

        if (!lastMessageOnChat) {
            //to prevent the first "if" to go true everytime
            if (false === (lastMessageOnChat = getLastMsg())) { lastMessageOnChat = true; }
            else { lastMsg = lastMessageOnChat; }
        }
        else if (lastMessageOnChat != getLastMsg() && getLastMsg() !== false && !didYouSendLastMsg()) {
            lastMessageOnChat = lastMsg = getLastMsg();
            processLastMsgOnChat = true;
        }

        if (!processLastMsgOnChat && (chats.length == 0 || !chat)) {
            if (chats.length >= 1) { console.log(time, 'nothing to do now... (1)', title, chats.length); }
            return goAgain(start, 3);
        }

        // get infos
        if (!processLastMsgOnChat) {
            title = getElement("chat_title", chat).title + '';
            lastMsg = (getElement("chat_lastmsg", chat) || { innerText: '' }).innerText.trim(); //.last-msg returns null when some user is typing a message to me
        }
        else { title = getElement("selected_title").title; }

        // avoid sending duplicate messaegs
        if (ignoreLastMsg[title] && (ignoreLastMsg[title]) == lastMsg) { return goAgain(() => { start(chats, cnt + 1) }, 0.1); }

        // what to answer back?
        let sendText;
        let mssg = lastMsg.toUpperCase();


        // Brain Section (Checks Message for Command Keyword)
       // if (lastMsg.length >= bot_random_talk_rate && task_dt_toggle) { sendText = bot.ronSwan_list[rand(bot.ronSwan_list.length - 1)]; }
        if (mssg.indexOf('OHAYO') > -1) { sendText = bot.greeting_list[rand(bot.greeting_list.length - 1)]; }
        else if (mssg.indexOf('FLANNYS?') > -1) { sendText = bot.flan_list[rand(bot.flan_list.length - 1)]; }
        else if (mssg.indexOf('HELLO THERE') > -1) { sendText = `...General Kenobi` }
        else if (mssg.indexOf('LOVE YOU') > -1) { sendText = bot.love_list[rand(bot.love_list.length - 1)]; }
        else if (mssg.indexOf('LINDA') > -1) { sendText = bot.linda_list[rand(bot.linda_list.length - 1)]; }
        // Pablo Specific Commands
        else if (mssg.indexOf('PABLO TELL ME A JOKE') > -1) { sendText = bot.jokeList[rand(bot.jokeList.length - 1)]; }
        else if (mssg.indexOf('THANK YOU PABLO') > -1) { sendText = bot.emote_gratefull[rand(bot.emote_gratefull.length - 1)]; friendshipLogger(mssg) }
        else if (mssg.indexOf('GOOD JOB PABLO') > -1) { sendText = bot.emote_gratefull[rand(bot.emote_gratefull.length - 1)]; }
        else if (mssg.indexOf('PABLO WHO ARE YOUR FRIENDS?') > -1) {
            let a = pfl.toString();
            console.log(pfl);
            sendText = `test: ${a}`;
        }

        else if (mssg.indexOf('CALLATE') > -1) { sendText = bot.callate_list[rand(bot.callate_list.length - 1)]; }
        else if (mssg.indexOf('SAME') > -1) { sendText = `s a m e....`; }
        else if (mssg.indexOf('KYSLEV') > -1) { sendText = `no, s a m e...`; }
        else if (mssg.indexOf('FASTING') > -1) { sendText = `Fasting is for Homos...`; }
        else if (mssg.indexOf('#DT') > -1) { sendText = `*Todays Text:* \n${daily_text}\n\n${daily_text_body}` }
        else if (mssg.indexOf('#TIME') > -1) { sendText = ` Don't you have a clock, dude? \n🕐:*${new Date()}*`; }
        else if (mssg.indexOf('#8BALL') > -1) {
            sendText = `The Magic 8 Ball Replies... \n...\n...\n\n🎱: ${bot.eight_Ball_list[rand(bot.eight_Ball_list.length - 1)]} `;
            sendDelay = true;
        }
        else if (mssg.indexOf('#LMGTFY') > -1) {
            let _a = lastMsg.split(" "), _b = _a.shift(), _c = _a.shift();
            let newMsg = _a.toString().replace(/,|\s/g, "+");
            sendText = `Let Me Google that For you... \n\n https://lmgtfy.com/?q=${newMsg}`;
        }
        else if (mssg.indexOf('#G') > -1) {
            let _a = lastMsg.split(" "), _b = _a.shift(), _c = _a.shift();
            let newMsg = _a.toString().replace(/,|\s/g, "+");
            sendText = `Here's what I found: \nhttps://www.google.com/search?q=${newMsg}`;
            sendDelay = true;
        }
        else if (mssg.indexOf('#YT') > -1) {
            let _a = lastMsg.split(" "), _b = _a.shift(), _c = _a.shift();
            let newMsg = _a.toString().replace(/,|\s/g, "+");
            sendText = `Here's what I found: \nhttps://www.youtube.com/results?search_query=${newMsg}`;
            sendDelay = true;
        }
        else if (mssg.indexOf('#ROLL') > -1) {
            let _a = lastMsg.toString().split(" "), _b = _a.pop
            let num = Math.floor(Math.random() * 100);
            sendText = ` the 100 sided dice gives... \n\n 🎲: *${num}*`;
        }
        else if (mssg.indexOf('#PP') > -1) {
            var pooper = mssg.split(" ").pop()
            var int_runs = 0;
            sendText = `Every party needs a pooper that's why they invited you 👉${pooper || "everybody"}👈`

            var _interval = setInterval(() => {
                int_runs += 1; sendText = `💩 ...Party Pooper... 💩 `;
                if (int_runs == 4) { clearInterval(_interval); int_runs = 0; }
                else { sendMessage(null, sendText.trim(), () => { return null }); }
            }, 5000)
        }
        else if (mssg.indexOf('#JEOPARDY?') > -1) {
            sendText = ` the 100 sided dice gives... \n\n 🎲: *${num}*`;
        }
        else if (mssg.indexOf('#ROAST') > -1) {
            var endCom = mssg.split(" ").pop()
            if (endCom == "END") { clearInterval(interval); console.log("ROAST OVAA!!!") }
            else {
                let _a = lastMsg.split(" "), _b = _a.pop();
                var victim = bot.gc_user_list[Math.floor(Math.random() * bot.gc_user_list.length)]
                var roast_time = 300000; // 5 mins in milliseconds
                var int_runs = 0;

                botFocused();

                sendText = `
                🔥 *ULPO ROAST CHALLANGE* 🔥
                ---------------- 
                Todays victim:
                *${victim}* 
                ----------------             
                Rules:
                1 - You have *5 Mins* on the clock!
                2 - None. Go wild you filthy animals!`;

                var interval = setInterval(() => {
                    int_runs += 1; int_run_op = (5 - int_runs)
                    sendText = ` So far we have *${int_runs} min(s)*  on the clock! \nOnly *${int_run_op} min(s)* left. \nLets keep this Roast _burning_!🔥🔥🔥`
                    if (int_runs == 5) { clearInterval(interval); int_runs = 0; }
                    else { sendMessage(null, sendText.trim(), () => { return null }); }
                }, 2000)

                setTimeout(() => {
                    console.log("ROAST OVER")
                    sendText = `*ULPO ROAST CHALLENGE IS NOW OVER* \n Thank you all for your participation! \n \n ...or lack of participation... \n either way what do i know.`;
                    sendMessage(null, sendText.trim(), () => { botFocused() });
                }, 10000)
            }
        }
        else if (lastMsg.toUpperCase().indexOf('#HELP') > -1) {
            sendText = `This is ${title}'s, Pablo the Assitant! 
                Here are some commands that you can send me:
                    - *OHAYO*: Say Hello  
                    - *# ROLL*: Roll a 100 sided Dice
                    - *# TIME*: Get The Time
                    - *# JOKE*: Tell a Joke
                    - *# ROAST*: Start a Roast!
                    - *# PP*: Who's a party Pooper?
                    - *# G*: Let me Google that for you...
                    - *# YT*: Search Youtube...
                    
                And always remember! _Never fear, stay a Queer_.`
        }

        // that's sad, there's nothing to send back...
        if (!sendText) {
            ignoreLastMsg[title] = lastMsg;
            // console.log(new Date(), 'new message ignored -> ', title, lastMsg);
            return goAgain(() => { start(chats, cnt + 1) }, 0.1);
        }

        console.log(new Date(), 'new message to process, uhull -> ', title, lastMsg);

        // select chat and send message
        if (!processLastMsgOnChat) { selectChat(chat, () => { sendMessage(chat, sendText.trim(), () => { goAgain(() => { start(chats, cnt + 1) }, 1); }); }) }
        else { sendMessage(null, sendText.trim(), () => { goAgain(() => { start(chats, cnt + 1) }, 1); }); }
    } else { console.log("Bot is Busy...") }
}

function initBotSniffing(bool) { if (isBotActive == true) { console.log("[ULPO-BOT]: Listening..."); start(); } }

chrome.runtime.sendMessage({ init: true }, function (res) {
    isBotActive = res.bot_act;
    botInterval = res.bot_int;
    replyDelay = res.bot_reply;
    task_dt_toggle = res.task_dt;
    task_motd_toggle = res.task_motd;
    task_rrq_toggle = res.task_rrq;
    pfl = res.friend_list;
    initBotSniffing(isBotActive);

});

chrome.runtime.onMessage.addListener((req) => {
    isBotActive = req.botInit;
    botInterval = req.bot_int;
    replyDelay = req.bot_reply;
    task_dt_toggle = req.task_dt;
    task_motd_toggle = req.task_motd;
    task_rrq_toggle = req.task_rrq;
    initBotSniffing(isBotActive);
});

/**
 * 
    if (millisTill10 < 0) { millisTill10 += 86400000; }
    setTimeout(function () {
        sendText = `*Todays Text:* \n ${daily_text} \n \n ${daily_text_body}`
        sendMessage(null, sendText.trim(), () => { return null });
    }, millisTill10);
 */