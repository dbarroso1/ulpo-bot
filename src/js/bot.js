
var isBotActive, botInterval;
var intervalId;
var mssg_in = [];
var chat_name = "Test";
var lastMessageOnChat = false;
var ignoreLastMsg = {};
var elementConfig = {
    "chats": [1, 0, 5, 2, 0, 3, 0, 0, 0],
    "chat_icons": [0, 0, 1, 1, 1, 0],
    "chat_title": [0, 0, 1, 0, 0, 0, 0],
    "chat_lastmsg": [0, 0, 1, 1, 0, 0],
    "chat_active": [0, 0],
    "selected_title": [1, 0, 5, 3, 0, 1, 1, 0, 0, 0, 0]
};
const jokeList = [
    `Husband and Wife had a Fight.
    *Wife* : - calls mom - He fought with me again, I am coming to you.
    *Mom* : No daughter, he must pay for his mistake, I am comming to stay with U!`,
    `*Husband*: Darling, years ago u had a figure like Coke bottle.
    *Wife*: Yes darling I still do, only difference is earlier it was 300ml now it's 1.5 ltr.`,

    `God created the earth, 
    God created the woods, 
    God created you too, 
    But then, even God makes mistakes sometimes!`,

    `What is a difference between a Kiss, a Car and a Monkey? 
    A kiss is so dear, a car is too dear and a monkey is _you_, dear.`,

    `Here's a joke... \n \n \n \n \n \n  ... *Goku* ...    `,
    `Anybody Seen a Shelby GT anywhere? \n it was parked outside last night...`,
]

console.log("On WhatsApp Web")
// Get random value between a range
function rand(high, low = 0) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function getElement(id, parent) {
    if (!elementConfig[id]) {
        return false;
    }
    var elem = !parent ? document.body : parent;
    var elementArr = elementConfig[id];
    elementArr.forEach(function (pos) {
        if (!elem.childNodes[pos]) {
            return false;
        }
        elem = elem.childNodes[pos];
    });
    return elem;
}

function getLastMsg() {
    var messages = document.querySelectorAll('.msg');
    var pos = messages.length - 1;

    while (messages[pos] && (messages[pos].classList.contains('msg-system') || messages[pos].querySelector('.message-out'))) {
        pos--;
        if (pos <= -1) {
            return false;
        }
    }
    if (messages[pos] && messages[pos].querySelector('.selectable-text')) {
        return messages[pos].querySelector('.selectable-text').innerText.trim();
    } else {
        return false;
    }
}

function getUnreadChats() {
    var unreadchats = [];
    var chats = getElement("chats");
    if (chats) {
        chats = chats.childNodes;
        for (var i in chats) {
            if (!(chats[i] instanceof Element)) {
                continue;
            }
            var icons = getElement("chat_icons", chats[i]).childNodes;
            if (!icons) {
                continue;
            }
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
    if (messages.length <= 0) {
        return false;
    }
    var pos = messages.length - 1;

    while (messages[pos] && messages[pos].classList.contains('msg-system')) {
        pos--;
        if (pos <= -1) {
            return -1;
        }
    }
    if (messages[pos].querySelector('.message-in')) {
        return true;
    }
    return false;
}
const goAgain = (fn, sec) => {
    // const chat = document.querySelector('div.chat:not(.unread)')
    // selectChat(chat)
    if (isBotActive) {
        setTimeout(fn, sec * 1000)
    }
    else { return null }
}

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
            if (titleMain !== undefined && titleMain != title) {
                console.log('not yet');
                return loopFewTimes();
            }
            return cb();
        }, 300);
    }

    loopFewTimes();
}

// Send a message
const sendMessage = (chat, message, cb) => {
    //avoid duplicate sending
    var title;

    if (chat) {
        title = getElement("chat_title", chat).title;
    } else {
        title = getElement("selected_title").title;
    }
    ignoreLastMsg[title] = message;

    messageBox = document.querySelectorAll("[contenteditable='true']")[0];

    //add text into input field
    messageBox.innerHTML = message.replace(/  /gm, '');

    //Force refresh
    event = document.createEvent("UIEvents");
    event.initUIEvent("input", true, true, window, 1);
    messageBox.dispatchEvent(event);

    //Click at Send Button
    eventFire(document.querySelector('span[data-icon="send"]'), 'click');

    cb();
}

//
// MAIN LOGIC
//
const start = (_chats, cnt = 0) => {
    // get next unread chat
    const chats = _chats || getUnreadChats();
    const chat = chats[cnt];

    var processLastMsgOnChat = false;
    var lastMsg;

    if (!lastMessageOnChat) {
        if (false === (lastMessageOnChat = getLastMsg())) {
            lastMessageOnChat = true; //to prevent the first "if" to go true everytime
        } else {
            lastMsg = lastMessageOnChat;
        }
    } else if (lastMessageOnChat != getLastMsg() && getLastMsg() !== false && !didYouSendLastMsg()) {
        lastMessageOnChat = lastMsg = getLastMsg();
        processLastMsgOnChat = true;
    }

    if (!processLastMsgOnChat && (chats.length == 0 || !chat)) {
        console.log(new Date(), 'nothing to do now... (1)', chats.length, chat);
        return goAgain(start, 3);
    }

    // get infos
    var title;
    if (!processLastMsgOnChat) {
        title = getElement("chat_title", chat).title + '';
        lastMsg = (getElement("chat_lastmsg", chat) || { innerText: '' }).innerText.trim(); //.last-msg returns null when some user is typing a message to me
    } else {
        title = getElement("selected_title").title;
    }
    // avoid sending duplicate messaegs
    if (ignoreLastMsg[title] && (ignoreLastMsg[title]) == lastMsg) {
        console.log(new Date(), 'nothing to do now... (2)', title, lastMsg);
        return goAgain(() => { start(chats, cnt + 1) }, 0.1);
    }

    // what to answer back?
    let sendText
    if (lastMsg.toUpperCase().indexOf('@G') > -1) {
        let _a = lastMsg.split(" "), _b = _a.shift(), _c = _a.shift();
        let = newMsg = _a.toString().replace(/,|\s/g, "+");
        sendText = `Let Me Google that For you... \nhttps://lmgtfy.com/?q=${newMsg}`
    }

    if (lastMsg.toUpperCase().indexOf('@ROLL') > -1) {
        let _a = lastMsg.toString().split(" "), _b = _a.pop
        let num = Math.floor(Math.random() * 100);
        console.log(_b);
        sendText = `Dice Roll gives... \n \n *${num}*`;
    }
    if (lastMsg.toUpperCase().indexOf('@HELP') > -1) {
        sendText = `Cool ${title}! Some commands that you can send me:
            - *$G*
            - *@ROLL*
            - *@TIME*
            - *@JOKE*`
    }

    if (lastMsg.toUpperCase().indexOf('@TIME') > -1) {
        sendText = `Don't you have a clock, dude? \n *${new Date()}*`
    }

    if (lastMsg.toUpperCase().indexOf('@JOKE') > -1) {
        sendText = jokeList[rand(jokeList.length - 1)];
    }

    // that's sad, there's not to send back...
    if (!sendText) {
        ignoreLastMsg[title] = lastMsg;
        console.log(new Date(), 'new message ignored -> ', title, lastMsg);
        return goAgain(() => { start(chats, cnt + 1) }, 0.1);
    }

    console.log(new Date(), 'new message to process, uhull -> ', title, lastMsg);

    // select chat and send message
    if (!processLastMsgOnChat) {
        selectChat(chat, () => {
            sendMessage(chat, sendText.trim(), () => {
                goAgain(() => { start(chats, cnt + 1) }, 1);
            });
        })
    } else {
        sendMessage(null, sendText.trim(), () => {
            goAgain(() => { start(chats, cnt + 1) }, 1);
        });
    }
}

function initBotSniffing(bool) {
    var _x = bool;
    if (isBotActive == true) { start(); }
}


chrome.runtime.sendMessage({ init: true }, function (res) {
    isBotActive = res.bot_act;
    botInterval = res.bot_int;
    initBotSniffing(isBotActive);
});

chrome.runtime.onMessage.addListener((req) => {
    isBotActive = req.botInit;
    initBotSniffing(isBotActive);
});



/**
 
function botResponder() {
    var phrase = mssg_in[0].replace("$g", '').replace(/\s/g, '+')
    // WORKS $('button._35EW6').click() 
    console.log("https://www.google.com/search?q=" + phrase)
}
function initBot() {
    setTimeout(() => {
        $("div._2wP_Y").each(function () {
            let _a = $(this).find($('span._1wjpf'))
            console.log('Clicking...')
            _a.click()
            console.log(_a.attr('title'))
        })

    }, 3000)
}
function getConvo() {
    console.log("Checking...")


    var txt = $('footer').find($('div.copyable-text.selectable-text'))
    txt.click()


    $('div.message-in').each(function () {
        let _a = $(this).find($('span.selectable-text'))
        let _b = $(this).find($('div.copyable-text')).attr('data-pre-plain-text').split(']').pop()

        let text = _a.text()
        let user = _b.toString().replace(/\s|:/g, "")

        if (text.includes("$g")) {
            if (!mssg_in.includes(text)) {
                mssg_in.push(text)
                botResponder()
            }
        }
    })

    console.log(mssg_in)

}


OLD *
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