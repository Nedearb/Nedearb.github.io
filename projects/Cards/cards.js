var canvas;
var context;
var deckImage;
            
var table = {cards:[]}
var cursor = {x:0, y:0};
var cursorOffset = {x:0, y:0};
var activeCard = null;

var valAce = 0;
var valTwo = 1;
var valThree = 2;
var valFour = 3;
var valFive = 4;
var valSix = 5;
var valSeven = 6;
var valEight = 7;
var valNine = 8;
var valTen = 9;
var valJack = 10;
var valQueen = 11;
var valKing = 12;

var values = [valAce, valTwo, valThree, valFour, valFive, valSix, valSeven, valEight, valNine, valTen, valJack, valQueen, valKing];
var valCount = values.length;


var suitClubs = 0;
var suitSpades = 1;
var suitDiamonds = 2;
var suitHearts = 3;

var suits = [suitSpades, suitHearts, suitDiamonds, suitClubs]
var suitCount = suits.length;

var sideFaceDown = 0;
var sideFaceUp = 1;

var rotPortrait = 0;
var rotLandscape = 1;

var cardWidth = 28;
var cardHeight = 38;
var cardHalfWidth = cardWidth/2;
var cardHalfHeight = cardHeight/2;

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function createGuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function makeCardLocal(val, suit, side, rot, x, y){
    return {val:val, suit:suit, side:side, rot:rot, x:x, y:y, uid:createGuid()}
}

function makeDeckLocal(side, rot, x, y){
    var deck = [];
    for(var i=0;i<suitCount;i++){
        for(var j=0;j<valCount;j++){
            deck.push(makeCardLocal(values[j], suits[i], side, rot, x+(i*j/10), y+(i*j/10)));
        }
    }
    return deck;
}

/*function drawSuit(suit, x, y){
    if(suit == suitSpades){
        context.fillStyle = "#000000";
        context.beginPath();
        context.moveTo(x, y-4);
        context.lineTo(x-3, y+1);
        context.lineTo(x-3, y+2);
        context.lineTo(x-1, y+2);
        context.lineTo(x-2, y+4);
        context.lineTo(x+2, y+4);
        context.lineTo(x+1, y+2);
        context.lineTo(x+3, y+2);
        context.lineTo(x+3, y+1);
        context.lineTo(x, y-4);
        context.closePath();
        context.fill();
    }else if(suit == suitHearts){
        context.fillStyle = "#FF0000";
        context.beginPath();
        context.moveTo(x, y-3);
        context.lineTo(x-2, y-4);
        context.lineTo(x-3, y-3);
        context.lineTo(x-3, y-2);
        context.lineTo(x, y+3);
        context.lineTo(x+3, y-2);
        context.lineTo(x+3, y-3);
        context.lineTo(x+2, y-4);
        context.lineTo(x, y-3);
        context.closePath();
        context.fill();
    }else if(suit == suitDiamonds){
        context.fillStyle = "#FF0000";
        context.beginPath();
        context.moveTo(x, y-4);
        context.lineTo(x-3, y);
        context.lineTo(x, y+4);
        context.lineTo(x+3, y);
        context.lineTo(x, y-4);
        context.closePath();
        context.fill();
    }else if(suit == suitClubs){
        context.fillStyle = "#000000";
        context.beginPath();
        context.moveTo(x-1, y-4);
        context.lineTo(x-2, y-3);
        context.lineTo(x-1, y-1);
        context.lineTo(x-3, y-2);
        context.lineTo(x-4, y-1);
        context.lineTo(x-4, y+1);
        context.lineTo(x-2, y+2);
        context.lineTo(x, y+1);
        context.lineTo(x-2, y+4);
        context.lineTo(x+2, y+4);
        context.lineTo(x, y+1);
        context.lineTo(x+2, y+2);
        context.lineTo(x+4, y+1);
        context.lineTo(x+4, y-1);
        context.lineTo(x+3, y-2);
        context.lineTo(x+1, y-1);
        context.lineTo(x+2, y-3);
        context.lineTo(x+1, y-4);
        context.closePath();
        context.fill();
    }
}*/

function redraw(){
    context.lineWidth = 1;
    context.fillStyle = "#0A6C03";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for(var i=0;i<table.cards.length;i++){
        var card = table.cards[i];
        /*if(card.side == sideFaceUp){
            context.strokeStyle = "#000000";
            context.fillStyle = "#FFFFFF";
        }else{
            context.strokeStyle = "#000000";
            var grd = context.createLinearGradient(card.x, card.y, card.x+cardHalfWidth, card.y+cardHalfHeight);
            grd.addColorStop(0, "#FFFFFF");
            grd.addColorStop(1, "#FF00FF");
            context.fillStyle = grd;
        }
        if(card.rot == rotLandscape){
            context.fillRect(card.x-cardHalfHeight, card.y-cardHalfWidth, cardHalfHeight*2, cardHalfWidth*2);
            context.strokeRect(card.x-cardHalfHeight, card.y-cardHalfWidth, cardHalfHeight*2, cardHalfWidth*2);
        }else{
            context.fillRect(card.x-cardHalfWidth, card.y-cardHalfHeight, cardHalfWidth*2, cardHalfHeight*2);
            context.strokeRect(card.x-cardHalfWidth, card.y-cardHalfHeight, cardHalfWidth*2, cardHalfHeight*2);
        }
        context.fill();
        context.stroke();
        if(card.side == sideFaceUp){
            drawSuit(card.suit, card.x, card.y);
        }*/
        context.save();
        context.translate(card.x, card.y);
        if(card.rot == rotLandscape){
            context.rotate(Math.PI/2);
        }
        if(card.side == sideFaceUp){
            context.drawImage(deckImage, card.val*cardWidth, card.suit*cardHeight, 28, 38, -cardHalfWidth, -cardHalfHeight, cardWidth, cardHeight);
        }else{
            context.drawImage(deckImage, 0, 4*cardHeight, 28, 38, -cardHalfWidth, -cardHalfHeight, cardWidth, cardHeight);
        }
        context.restore();
        
    }
    context.drawImage(deckImage, 2*cardWidth, 4*cardHeight, 6, 6, cursor.x-3, cursor.y, 6, 6)
}

function getCardAtPosition(pos){
    for(var i=table.cards.length-1;i>=0;i--){
        var card = table.cards[i];
        if(card.rot == rotLandscape){
            if(card.x-cardHalfHeight < cursor.x && card.x+cardHalfHeight > cursor.x && card.y-cardHalfWidth < cursor.y && card.y+cardHalfWidth > cursor.y){
                return card;
            }
        }else{
            if(card.x-cardHalfWidth < cursor.x && card.x+cardHalfWidth > cursor.x && card.y-cardHalfHeight < cursor.y && card.y+cardHalfHeight > cursor.y){
                return card;
            }
        }
    }
    return null;
}

function removeCardNet(card){
    sendMessage({msg:"removeCard", data:card.uid})
}

function addCardNet(card){
    sendMessage({msg:"addCard", data:card})
}

function moveCardToTopNet(card){
    sendMessage({msg:"moveCardToTop", data:card.uid})
}

function changeCardNet(card){
    sendMessage({msg:"changeCard", data:card})
}

function moveCardNet(card){
    sendMessage({msg:"moveCard", data:{uid:card.uid, x:card.x, y:card.y}});
}

function moveCardLocal(uid, x, y){
    for(var i=0;i<table.cards.length;i++){
        var card = table.cards[i];
        if(card.uid == uid){
            card.x = x;
            card.y = y;
            return card;
        }
    }
}

function removeCardLocal(uid){
    for(var i=0;i<table.cards.length;i++){
        var card = table.cards[i];
        if(card.uid == uid){
            table.cards.splice(i, 1);
            return card;
        }
    }
}

function changeCardLocal(changedCard){
    for(var i=0;i<table.cards.length;i++){
        var card = table.cards[i];
        if(card.uid == changedCard.uid){
            table.cards[i] = changedCard;
            return;
        }
    }
    table.cards.push(changedCard);
}

function sendMessage(data){
    PUBNUB_cards.publish({
        channel: PUBNUB_channel,
        message: data
    });
}

function reciveMessage(data){
    console.log("Recived:", data);
    if(data.msg == "clearCards"){
        table.cards = [];
    }
    if(data.msg == "newDeck"){
        table.cards = table.cards.concat(data.data);
    }
    if(data.msg == "removeCard"){
        removeCardLocal(data.data);
    }
    if(data.msg == "addCard"){
        table.cards.push(data.data);
    }
    if(data.msg == "changeCard"){
        changeCardLocal(data.data);
    }
    if(data.msg == "moveCard"){
        changeCardLocal(data.data);
    }
    if(data.msg == "moveCardToTop"){
        table.cards.push(removeCardLocal(data.data));
    }
    if(data.msg == "requestCards"){
        for(var i=0;i<table.cards.length;i++){
            changeCardNet(table.cards[i]);
        }
    }
    redraw();
}

function buttonNewDeck(){
    var deck = makeDeckLocal(sideFaceDown, rotPortrait, cursor.x, cursor.y);
    shuffle(deck);
    sendMessage({msg:"newDeck", data:deck});
}

function clearTable(){
    sendMessage({msg:"clearCards"});
}



var PUBNUB_cards = PUBNUB.init({
    publish_key: 'pub-c-114809be-70d6-45ef-a004-54cd12c6905b',
    subscribe_key: 'sub-c-5de35468-6a1f-11e5-945f-02ee2ddab7fe'
});

var PUBNUB_channel = "cards";

function setCursor(e){
    cursor.x = e.clientX - canvas.offsetLeft;
    cursor.y = e.clientY - canvas.offsetTop;
}


window.onload = function(){
    
    canvas = document.getElementById("mainCanvas");
    context = canvas.getContext("2d");
    
    deckImage = document.getElementById("deckImage");
    
    redraw();
    
    canvas.onmousedown = function(e){
        setCursor(e);
        if(e.which == 1){
            selection.x1 = cursor.x;
            selection.x2 = cursor.x;
            selection.y1 = cursor.y;
            selection.y2 = cursor.y;
            selection.cards = [];
        }
        /*setCursor(e);
        activeCard = getCardAtPosition(cursor);
        if(e.which == 1){
            if(activeCard){
                moveCardToTopNet(activeCard);
                cursorOffset.x = activeCard.x - cursor.x;
                cursorOffset.y = activeCard.y - cursor.y;
                console.log(activeCard);
            }
        }else if(e.which == 2){
            if(activeCard){
                if(activeCard.side == sideFaceDown){
                    activeCard.side = sideFaceUp;
                }else{
                    activeCard.side = sideFaceDown;
                }
                changeCardNet(activeCard);
                moveCardToTopNet(activeCard);
            }
        }*/
        redraw();
    }
    
    canvas.ondblclick = function(e){
        /*setCursor(e);
        activeCard = getCardAtPosition(cursor);
        if(e.which == 1){
            if(activeCard){
                if(activeCard.rot == rotPortrait){
                    activeCard.rot = rotLandscape;
                }else{
                    activeCard.rot = rotPortrait;
                }
                changeCardNet(activeCard);
                moveCardToTopNet(activeCard);
            }
        }*/
        redraw();
    }
    
    canvas.onmousemove = function(e){
        if(e.which == 1){
            selection.y1 = cursor.y;
            selection.y2 = cursor.y;
        }
        /*
        if(activeCard){
            setCursor(e);
            activeCard.x = Math.round(cursor.x + cursorOffset.x);
            activeCard.y = Math.round(cursor.y + cursorOffset.y);
            //moveCardNet(activeCard);
        }*/
        redraw();
    }
    
    canvas.onmouseup = function(e){
        /*setCursor(e);
        if(e.which == 1){
            if(activeCard){
                activeCard.x = Math.round(cursor.x + cursorOffset.x);
                activeCard.y = Math.round(cursor.y + cursorOffset.y);
                changeCardNet(activeCard);
            }
        }
        activeCard = null;*/
        selection.cards = getCardsInArea(selection.x1, selection.y1, selection.x2, selection.y2);
        redraw();
    }
    
    PUBNUB_cards.subscribe({
        channel: PUBNUB_channel,
        message: reciveMessage
    });
    
    sendMessage({msg:"requestCards"})
    
}




