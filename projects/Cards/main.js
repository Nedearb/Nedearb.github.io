var canvas;
var context;
var deckImage;
            
var table = {cards:[], conis:[]}
var cursor = {x:0, y:0};
var selection = {x1:0, y1:0, x2:0, y2:0, cards:[], coins:[]};


function gup(name, url) {
    if (!url) url = location.href
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}

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

function redraw(){
    context.lineWidth = 1;
    context.fillStyle = "#0A6C03";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for(var i=0;i<table.cards.length;i++){
        var card = table.cards[i];
        context.save();
        context.translate(card.x+.5, card.y+.5);
        if(card.rot == cardProperties.orientations.landscape){
            context.rotate(Math.PI/2);
        }
        if(card.side == cardProperties.sides.faceUp){
            context.drawImage(deckImage, card.val*cardProperties.width, card.suit*cardProperties.height, 28, 38, -cardProperties.width/2, -cardProperties.halfHeight, cardProperties.width, cardProperties.height);
        }else{
            context.drawImage(deckImage, 0, 4*cardProperties.height, 28, 38, -cardProperties.width/2, -cardProperties.halfHeight, cardProperties.width, cardProperties.height);
        }
        context.restore();
    }
    
    for(var i=0;i<selection.cards.length;i++){
        var card = selection.cards[i];
        context.strokeStyle = "#FF0000";
        if(card.rot == cardProperties.orientations.landscape){
            context.strokeRect(card.x-cardProperties.halfHeight+2, card.y-cardProperties.width/2+2, cardProperties.halfHeight*2-3, cardProperties.width/2*2-3);
        }else{
            context.strokeRect(card.x-cardProperties.width/2+2, card.y-cardProperties.halfHeight+2, cardProperties.width/2*2-3, cardProperties.halfHeight*2-3);
        }
        
    }
    
    context.strokeStyle = "#FFFF00";
    context.strokeRect(selection.x1, selection.y1, selection.x2-selection.x1, selection.y2-selection.y1);
    context.drawImage(deckImage, 2*cardProperties.width, 4*cardProperties.height, 6, 6, cursor.x-3, cursor.y-3, 6, 6);
}

function AABB(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2){
    return  ax1 < bx2 &&
            ax2 > bx1 &&
            ay1 < by2 &&
            ay2 > by1;
}

function sendMessage(data){
    PUBNUB_cards.publish({
        channel: PUBNUB_channel,
        message: data
    });
    console.log("Sent:", data);
}





function removeCardNet(card){
    sendMessage({msg:"removeCard", data:card.uid});
}

function removeCardsNet(cards){
    console.log(cards);
    if(cards.length == 0){
        return;
    }
    var uids = [];
    for(var i=0;i<cards.length;i++){
        uids.push(cards[i].uid);
    }
    sendMessage({msg:"removeCards", data:uids});
}

function addCardNet(card){
    sendMessage({msg:"addCard", data:card});
}

function moveCardToTopNet(card){
    sendMessage({msg:"moveCardToTop", data:card.uid});
}

function moveCardsToTopNet(cards){
    if(cards.length == 0){
        return;
    }
    var uids = [];
    for(var i=0;i<cards.length;i++){
        uids.push(cards[i].uid);
    }
    sendMessage({msg:"moveCardsToTop", data:uids});
}

function changeCardNet(card){
    sendMessage({msg:"changeCard", data:card});
}

function changeCardsNet(cards){
    if(cards.length == 0){
        return;
    }
    sendMessage({msg:"changeCards", data:cards});
}

function moveCardNet(card){
    sendMessage({msg:"moveCard", data:{uid:card.uid, x:card.x, y:card.y}});
}

function moveCardsNet(cards){
    if(cards.length == 0){
        return;
    }
    var uidsPos = [];
    for(var i=0;i<cards.length;i++){
        uidsPos.push({uid:cards[i].uid, x:cards[i].x, y:cards[i].y});
    }
    sendMessage({msg:"moveCards", data:uidsPos});
}



function reciveMessage(data){
    console.log("Recived:", data);
    if(data.msg == "clearCards"){
        table.cards = [];
        selection.cards = [];
    }else if(data.msg == "newDeck"){
        table.cards = table.cards.concat(data.data);
    }else if(data.msg == "removeCard"){
        removeCardLocal(data.data);
    }else if(data.msg == "removeCards"){
        for(var i=0;i<data.data.length;i++){
            removeCardLocal(data.data[i]);
        }
    }else if(data.msg == "addCard"){
        table.cards.push(data.data);
    }else if(data.msg == "changeCard"){
        changeCardLocal(data.data);
    }else if(data.msg == "changeCards"){
        for(var i=0;i<data.data.length;i++){
            changeCardLocal(data.data[i]);
        }
    }else if(data.msg == "moveCard"){
        changeCardLocal(data.data);
    }else if(data.msg == "moveCards"){
        for(var i=0;i<data.data.length;i++){
            changeCardLocal(data.data[i]);
        }
    }else if(data.msg == "moveCardToTop"){
        moveCardToTopLocal(data.data);
    }else if(data.msg == "moveCardsToTop"){
        for(var i=data.data.length-1;i>=0;i--){
            moveCardToTopLocal(data.data[i]);
        }
    }else if(data.msg == "requestCards"){
        changeCardsNet(table.cards);
    }
    redraw();
}




function buttonNewDeck(){
    var deck = makeDeckLocal(cardProperties.sides.faceDown, cardProperties.orientations.portrait, cursor.x, cursor.y);
    shuffle(deck);
    sendMessage({msg:"newDeck", data:deck});
}

function buttonClearCards(){
    sendMessage({msg:"clearCards"});
}

function buttonMakeCard(){
    var selectVal = document.getElementById("makeCardVal").value;
    var selectSuit = document.getElementById("makeCardSuit").value;
    var selectSide = document.getElementById("makeCardSide").value;
    var selectRot = document.getElementById("makeCardRot").value;
    sendMessage({msg:"changeCard", data:makeCardLocal(selectVal, selectSuit, selectSide, selectRot, cursor.x, cursor.y)})
}



var PUBNUB_cards = PUBNUB.init({
    publish_key: 'pub-c-114809be-70d6-45ef-a004-54cd12c6905b',
    subscribe_key: 'sub-c-5de35468-6a1f-11e5-945f-02ee2ddab7fe'
});

var PUBNUB_channel = "cards";

function setCursor(e){
    cursor.x = Math.round(e.clientX - canvas.getBoundingClientRect().left);
    cursor.y = Math.round(e.clientY - canvas.getBoundingClientRect().top);
}

function deleteSelection(){
    if(selection.cards.length == 0){
        var card = getCardAtPosition(cursor, table.cards);
        if(card){
            selection.cards.push(card);
        }
    }
    removeCardsNet(selection.cards);
    selection.cards = [];
}


window.onload = function(){
    
    canvas = document.getElementById("mainCanvas");
    cursor.x = canvas.width;
    cursor.y = canvas.height;
    context = canvas.getContext("2d");
    context.translate(.5, .5);
    
    deckImage = document.getElementById("deckImage");
    
    redraw();
    
    canvas.oncontextmenu = function(e){
        flipSelection();
        e.preventDefault();
    }
    
    canvas.onmousedown = function(e){
        setCursor(e);
        if(!e.shiftKey){
            if(selection.cards.length > 0){
                if(!getCardAtPosition(cursor, selection.cards)){
                    selection.cards = [];
                }
            }
        }
        if(e.which == 1){
            if(e.shiftKey){
                selection.x1 = cursor.x;
                selection.x2 = cursor.x;
                selection.y1 = cursor.y;
                selection.y2 = cursor.y;
                selection.cards = [];
            }else{
                if(selection.cards.length == 0){
                    var card = getCardAtPosition(cursor, table.cards);
                    if(card){
                        selection.cards.push(card);
                    }
                }
                for(var i=0;i<selection.cards.length;i++){
                    selection.cards[i].cursorOffsetX = selection.cards[i].x - cursor.x;
                    selection.cards[i].cursorOffsetY = selection.cards[i].y - cursor.y;
                }
                moveCardsToTopNet(selection.cards);
            }
        }else if(e.which == 2){
            rotSelection();
        }
        redraw();
    }
    
    canvas.onmousemove = function(e){
        //tick++;
        if(e.which == 1){
            setCursor(e);
            if(e.shiftKey){
                selection.x2 = cursor.x;
                selection.y2 = cursor.y;
            }else{
                for(var i=0;i<selection.cards.length;i++){
                    selection.x1 = cursor.x;
                    selection.x2 = cursor.x;
                    selection.y1 = cursor.y;
                    selection.y2 = cursor.y;
                    selection.cards[i].x = Math.round(cursor.x + selection.cards[i].cursorOffsetX);
                    selection.cards[i].y = Math.round(cursor.y + selection.cards[i].cursorOffsetY);
                }
                //if(tick % 10 == 0){
                    //moveCardsNet(selection.cards);
                //}
            }
        }
        /*
        if(activeCard){
            setCursor(e);
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
        if(selection.x1 > selection.x2){
            var temp = selection.x1;
            selection.x1 = selection.x2;
            selection.x2 = temp;
        }
        if(selection.y1 > selection.y2){
            var temp = selection.y1;
            selection.y1 = selection.y2;
            selection.y2 = temp;
        }
        if(e.shiftKey){
            selection.cards = getCardsInArea(selection.x1, selection.y1, selection.x2, selection.y2, table.cards);
        }
        selection.x1 = cursor.x;
        selection.x2 = cursor.x;
        selection.y1 = cursor.y;
        selection.y2 = cursor.y;
        changeCardsNet(selection.cards);
        
        redraw();
    }
    
    document.onkeydown = function(e){
        if(e.keyCode == 90){//z
            flipSelection();
        }
        if(e.keyCode == 88){//x
            rotSelection();
        }
        if(e.keyCode == 46 || e.keyCode == 8){//delete or backspace
            deleteSelection();
        }        
        redraw();
    }
    
    var inputChannel = document.getElementById("inputChannel");
    
    inputChannel.onchange = function(){
        updatePUBNUBChannel("cards_"+inputChannel.value);
    }
    
    var ch = gup("channel");
    
    if(ch){
        inputChannel.value = ch;
    }else{
        inputChannel.value = Math.round(Math.random()*10000);
    }
    inputChannel.onchange();
    
    var inputFileLoad = document.getElementById("inputFileLoad");
    inputFileLoad.addEventListener("change", loadTable, false);
    
}

function saveTable(){
    window.location = "data:application/octet-stream,"+(JSON.stringify(table));
    console.log("Saved Table");
}

function loadTable(e){
    var f = e.target.files[0];

    if(f){
        var r = new FileReader();
        r.onload = function(e){
            try{
                var contents = e.target.result;
                
                var loadedTable = JSON.parse(contents);
                
                table.cards = table.cards.concat(loadedTable.cards);
                
                console.log("Loaded Table");
                
            }catch(e){
                alert("Failed to load file");
                console.error(e);
            }
        }
        r.readAsText(f);
    }
}

function subscribeToPUBNUBChannel(channel){
    PUBNUB_channel = channel;
    PUBNUB_cards.subscribe({
        channel: PUBNUB_channel,
        message: reciveMessage,
        connect: function(){
            sendMessage({msg:"requestCards"});
        }
    });
}

function updatePUBNUBChannel(newChannel){
    PUBNUB_cards.unsubscribe({
        channel: PUBNUB_channel
    });
    
    subscribeToPUBNUBChannel(newChannel);
}



