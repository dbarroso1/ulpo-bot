
/**
 * TODO: Working ON clicking to send
 */

// Settings Variables
var isActive = false
var botCheck = 3000;

var mssg_in = []
// var mssg_out = []
var comTag = '$G'
function activateBot() {
    isActive = !isActive;
    if(isActive==true){console.log("Active")}
    if(isActive==false){console.log("IN-Active")}
}

function getConvo() {
    $('div.message-in').each(function () { mssg_in.indexOf($(this).text()) === -1 ? mssg_in.push($(this).text()) : null })
    // $('div.message-out').each(function () { mssg_out.indexOf($(this).text()) === -1 ? mssg_out.push($(this).html()) : null })
    findTagInConvo();
}
function cleanPhrase(phrase) {
    let a = phrase.replace(".", " ").split(" ").splice(1)
    let b = a.pop(), c = a.pop()
    sendCom(comTag, a)
}
function findTagInConvo() {
    let arrLength = mssg_in.length
    for (var i = 0; i < arrLength; i++) {
        if (mssg_in[i].includes(comTag)) {
            cleanPhrase(mssg_in[i])
        }
    }
}
function sendClick() {
    var simulateClick = jQuery.Event("keypress")
    simulateClick.which = 13;
    simulateClick.code = "Enter";
    $("._35EW6").trigger(simulateClick)
    console.log("Clicked!")
}
function sendCom(tag, command) {
    if (tag === '$G') {
        let a = command.toString()
        let b = a.replace(/,/g, "+")
        console.log(b)
        $('g').html("Let me Google that for you!\nhttps://www.google.com/search?q=" + b)
        setTimeout(() => { sendClick() }, 1000)

    }

}
window.onload = function () {
    console.log("Listening to WhatsAPP")
    console.log("Conversations: ", $('._2wP_Y').length)
    if (isActive == true) {
        setInterval(() => { getConvo(); }, botCheck);
    }
}

