var canvas;
var context;
var deckImage;
var diceImage;
var coinImage;
            
var table = {pieces:[]}
var cursor = {x:0, y:0};
//var cursorOffset = {x:0, y:0};
var selection = {x1:0, y1:0, x2:0, y2:0, pieces:[]};

var pieceCard = 0;
var pieceDie = 1;

var backBlue = 0;
var backRed = 1;

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
var dieSize = 14;
var dieHalfSize = 7;
var coinSize = 11;
var coinHalfSize = 5;

//var tick = 0;

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

function makeCardLocal(back, val, suit, side, rot, x, y){
    return {piece:pieceCard, back:back, val:val, suit:suit, side:side, rot:rot, x:x, y:y, uid:createGuid()};
}

function makeDieLocal(maxSides, side, x, y){
  return {piece:pieceDie, maxSides:maxSides, side:side, x:x, y:y, uid:createGuid()};
}

function makeDeckLocal(back, side, rot, x, y){
    var deck = [];
    for(var i=0;i<suitCount;i++){
        for(var j=0;j<valCount;j++){
            deck.push(makeCardLocal(back, values[j], suits[i], side, rot, x+(i*j/10), y+(i*j/10)));
        }
    }
    return deck;
}
function redraw(){
    context.lineWidth = 1;
    context.fillStyle = "#0A6C03";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for(var i=0;i<table.pieces.length;i++){
        var piece = table.pieces[i];
        context.save();
        context.translate(piece.x+.5, piece.y+.5);
        if(piece.piece == pieceCard){
            if(piece.rot == rotLandscape){
                context.rotate(Math.PI/2);
            }
            if(piece.side == sideFaceUp){
                context.drawImage(deckImage, piece.val*cardWidth, piece.suit*cardHeight, cardWidth, cardHeight, -cardHalfWidth, -cardHalfHeight, cardWidth, cardHeight);
            }else{
                context.drawImage(deckImage, piece.back*cardWidth, 4*cardHeight, cardWidth, cardHeight, -cardHalfWidth, -cardHalfHeight, cardWidth, cardHeight);
            }
        }else if(piece.piece == pieceDie){
            if(piece.maxSides == 6){
                context.drawImage(diceImage, piece.side*dieSize, 0, dieSize, dieSize, -dieHalfSize, -dieHalfSize, dieSize, dieSize);
            }else if(piece.maxSides == 2){
                context.drawImage(coinImage, piece.side*coinSize, 0, coinSize, coinSize, -coinHalfSize, -coinHalfSize, coinSize, coinSize);
            }
        }
        context.restore();
    }
    
    for(var i=0;i<selection.pieces.length;i++){
        var piece = selection.pieces[i];
        context.strokeStyle = "#FF0000";
        if(piece.piece == pieceCard){
            if(piece.rot == rotLandscape){
                context.strokeRect(piece.x-cardHalfHeight+2, piece.y-cardHalfWidth+2, cardHalfHeight*2-3, cardHalfWidth*2-3);
            }else{
                context.strokeRect(piece.x-cardHalfWidth+2, piece.y-cardHalfHeight+2, cardWidth-3, cardHeight-3);
            }
        }else if(piece.piece == pieceDie){
            if(piece.maxSides == 6){
                context.strokeRect(piece.x-dieHalfSize+2, piece.y-dieHalfSize+2, dieSize-3, dieSize-3);
            }else if(piece.maxSides == 2){
                context.strokeRect(piece.x-coinHalfSize+2, piece.y-coinHalfSize+2, coinSize-3, coinSize-3);
            }
        }
    }
    
    context.strokeStyle = "#FFFF00";
    context.strokeRect(selection.x1, selection.y1, selection.x2-selection.x1, selection.y2-selection.y1);
    context.drawImage(deckImage, 2*cardWidth, 4*cardHeight, 6, 6, cursor.x-3, cursor.y-3, 6, 6);
}

function getPieceAtPosition(pos, list){
    for(var i=list.length-1;i>=0;i--){
        var piece = list[i];
        if(piece.piece == pieceCard){
            if(piece.rot == rotLandscape){
                if(piece.x-cardHalfHeight < pos.x && piece.x+cardHalfHeight > pos.x && piece.y-cardHalfWidth < pos.y && piece.y+cardHalfWidth > cursor.y){
                    return piece;
                }
            }else{
                if(piece.x-cardHalfWidth < pos.x && piece.x+cardHalfWidth > pos.x && piece.y-cardHalfHeight < pos.y && piece.y+cardHalfHeight > cursor.y){
                    return piece;
                }
            }
        }else if(piece.piece == pieceDie){
            if(piece.x-dieHalfSize < pos.x && piece.x+dieHalfSize > pos.x && piece.y-dieHalfSize < pos.y && piece.y+dieHalfSize > cursor.y){
                return piece;
            }
        }
    }
    return null;
}

function AABB(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2){
    return  ax1 < bx2 &&
            ax2 > bx1 &&
            ay1 < by2 &&
            ay2 > by1;
}

function getPiecesInArea(x1, y1, x2, y2, list){
    var pieces = [];
    for(var i=list.length-1;i>=0;i--){
        var piece = list[i];
        if(piece.piece == pieceCard){
            if(piece.rot == rotLandscape){
                if(AABB(x1, y1, x2, y2, piece.x-cardHalfHeight, piece.y-cardHalfWidth, piece.x+cardHalfHeight, piece.y+cardHalfWidth)){
                    pieces.push(piece);
                }
            }else{
                if(AABB(x1, y1, x2, y2, piece.x-cardHalfWidth, piece.y-cardHalfHeight, piece.x+cardHalfWidth, piece.y+cardHalfHeight)){
                    pieces.push(piece);
                }
            }
        }else if(piece.piece == pieceDie){
            if(AABB(x1, y1, x2, y2, piece.x-dieHalfSize, piece.y-dieHalfSize, piece.x+dieHalfSize, piece.y+dieHalfSize)){
                    pieces.push(piece);
                }
        }
    }
    return pieces;
}

function removePieceNet(piece){
    sendMessage({msg:"removePiece", data:piece.uid});
}

function removePiecesNet(pieces){
    console.log(pieces);
    if(pieces.length == 0){
        return;
    }
    var uids = [];
    for(var i=0;i<pieces.length;i++){
        uids.push(pieces[i].uid);
    }
    sendMessage({msg:"removePieces", data:uids});
}

function addPieceNet(piece){
    sendMessage({msg:"addPiece", data:piece});
}

function movePieceToTopNet(piece){
    sendMessage({msg:"movePieceToTop", data:piece.uid});
}

function movePiecesToTopNet(pieces){
    if(pieces.length == 0){
        return;
    }
    var uids = [];
    for(var i=0;i<pieces.length;i++){
        uids.push(pieces[i].uid);
    }
    sendMessage({msg:"movePiecesToTop", data:uids});
}

function changePieceNet(piece){
    sendMessage({msg:"changePiece", data:piece});
}

function changePiecesNet(pieces){
    if(pieces.length == 0){
        return;
    }
    sendMessage({msg:"changePiece", data:pieces});
}

function movePieceNet(piece){
    sendMessage({msg:"movePiece", data:{uid:piece.uid, x:piece.x, y:piece.y}});
}

function movePiecesNet(pieces){
    if(pieces.length == 0){
        return;
    }
    var uidsPos = [];
    for(var i=0;i<pieces.length;i++){
        uidsPos.push({uid:pieces[i].uid, x:pieces[i].x, y:pieces[i].y});
    }
    sendMessage({msg:"movePieces", data:uidsPos});
}

function movePieceLocal(uid, x, y){
    for(var i=0;i<table.pieces.length;i++){
        var piece = table.pieces[i];
        if(piece.uid == uid){
            piece.x = x;
            piece.y = y;
            return piece;
        }
    }
}

function removePieceLocal(uid){
    for(var i=0;i<table.pieces.length;i++){
        if(table.pieces[i].uid == uid){
            table.pieces.splice(i, 1);
            return table.pieces[i];
        }
    }
    return null;
}

function movePieceToTopLocal(uid){
    for(var i=0;i<table.pieces.length;i++){
        var piece = table.pieces[i];
        if(piece.uid == uid){
            table.pieces.splice(i, 1);
            table.pieces.push(piece);
            return;
        }
    }
}

function changePieceLocal(changedPiece){
    for(var i=0;i<table.pieces.length;i++){
        if(table.pieces[i].uid == changedPiece.uid){
            table.pieces[i].val = changedPiece.val;
            table.pieces[i].suit = changedPiece.suit;
            table.pieces[i].side = changedPiece.side;
            table.pieces[i].rot = changedPiece.rot;
            table.pieces[i].x = changedPiece.x;
            table.pieces[i].y = changedPiece.y;
            return;
        }
    }
    table.pieces.push(changedPiece);
}

function sendMessage(data){
    PUBNUB_cards.publish({
        channel: PUBNUB_channel,
        message: data
    });
    console.log("Sent:", data);
}

function reciveMessage(data){
    console.log("Recived:", data);
    if(data.msg == "clearPieces"){
        table.pieces = [];
        selection.pieces = [];
    }else if(data.msg == "newDeck"){
        table.pieces = table.pieces.concat(data.data);
    }else if(data.msg == "removePiece"){
        removePieceLocal(data.data);
    }else if(data.msg == "removePieces"){
        for(var i=0;i<data.data.length;i++){
            removePieceLocal(data.data[i]);
        }
    }else if(data.msg == "addPiece"){
        table.pieces.push(data.data);
    }else if(data.msg == "changePiece"){
        changePieceLocal(data.data);
    }else if(data.msg == "changePieces"){
        for(var i=0;i<data.data.length;i++){
            changePieceLocal(data.data[i]);
        }
    }else if(data.msg == "movePiece"){
        changePieceLocal(data.data);
    }else if(data.msg == "movePieces"){
        for(var i=0;i<data.data.length;i++){
            changePieceLocal(data.data[i]);
        }
    }else if(data.msg == "movePieceToTop"){
        movePieceToTopLocal(data.data);
    }else if(data.msg == "movePiecesToTop"){
        for(var i=data.data.length-1;i>=0;i--){
            movePieceToTopLocal(data.data[i]);
        }
    }else if(data.msg == "requestPieces"){
        changePiecesNet(table.pieces);
    }
    redraw();
}

function buttonNewDeck(){
    var selectBack = document.getElementById("makeCardBack").value;
    var deck = makeDeckLocal(selectBack, sideFaceDown, rotPortrait, cursor.x, cursor.y);
    shuffle(deck);
    sendMessage({msg:"newDeck", data:deck});
}

function buttonClearPieces(){
    sendMessage({msg:"clearPieces"});
}

function buttonMakeCard(){
    var selectBack = document.getElementById("makeCardBack").value;
    var selectVal = document.getElementById("makeCardVal").value;
    var selectSuit = document.getElementById("makeCardSuit").value;
    var selectSide = document.getElementById("makeCardSide").value;
    var selectRot = document.getElementById("makeCardRot").value;
    sendMessage({msg:"changePiece", data:makeCardLocal(selectBack, selectVal, selectSuit, selectSide, selectRot, cursor.x, cursor.y)})
}

function buttonMakeDie(maxSides){
    var side = Math.floor(Math.random() * maxSides);
    sendMessage({msg:"changePiece", data:makeDieLocal(maxSides, side, cursor.x, cursor.y)});
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


function flipSelection(){
    if(selection.pieces.length == 0){
        var piece = getPieceAtPosition(cursor, table.pieces);
        if(piece){
            selection.pieces.push(piece);
        }
    }
    for(var i=0;i<selection.pieces.length;i++){
        if(selection.pieces[i].piece == pieceCard){
            if(selection.pieces[i].side == sideFaceDown){
                selection.pieces[i].side = sideFaceUp;
            }else{
                selection.pieces[i].side = sideFaceDown;
            }
        }else if(selection.pieces[i].piece == pieceDie){
            selection.pieces[i].side = Math.floor(Math.random() * selection.pieces[i].maxSides);
        }
    }
    changePiecesNet(selection.pieces);
    //moveCardsToTopNet(selection.cards);
    selection.pieces = [];
}

function rotSelection(){
    if(selection.pieces.length == 0){
        var piece = getPieceAtPosition(cursor, table.pieces);
        if(piece){
            selection.pieces.push(piece);
        }
    }
    for(var i=0;i<selection.pieces.length;i++){
        if(selection.pieces[i].rot == rotPortrait){
            selection.pieces[i].rot = rotLandscape;
        }else{
            selection.pieces[i].rot = rotPortrait;
        }
    }
    changePiecesNet(selection.pieces);
    //moveCardsToTopNet(selection.cards);
    selection.pieces = [];
}

function deleteSelection(){
    if(selection.pieces.length == 0){
        var piece = getPieceAtPosition(cursor, table.pieces);
        if(piece){
            selection.pieces.push(card);
        }
    }
    removePiecesNet(selection.pieces);
    selection.pieces = [];
}


window.onload = function(){
    
    canvas = document.getElementById("mainCanvas");
    cursor.x = canvas.width;
    cursor.y = canvas.height;
    context = canvas.getContext("2d");
    context.translate(.5, .5);
    
    deckImage = document.getElementById("deckImage");
    diceImage = document.getElementById("diceImage");
    coinImage = document.getElementById("coinImage");
    
    redraw();
    
    canvas.oncontextmenu = function(e){
        flipSelection();
        e.preventDefault();
    }
    
    canvas.onmousedown = function(e){
        setCursor(e);
        if(!e.shiftKey){
            if(selection.pieces.length > 0){
                if(!getPieceAtPosition(cursor, selection.pieces)){
                    selection.pieces = [];
                }
            }
        }
        if(e.which == 1){
            if(e.shiftKey){
                selection.x1 = cursor.x;
                selection.x2 = cursor.x;
                selection.y1 = cursor.y;
                selection.y2 = cursor.y;
                selection.pieces = [];
            }else{
                if(selection.pieces.length == 0){
                    var piece = getPieceAtPosition(cursor, table.pieces);
                    if(piece){
                        selection.pieces.push(piece);
                    }
                }
                for(var i=0;i<selection.pieces.length;i++){
                    selection.pieces[i].cursorOffsetX = selection.pieces[i].x - cursor.x;
                    selection.pieces[i].cursorOffsetY = selection.pieces[i].y - cursor.y;
                }
                movePiecesToTopNet(selection.pieces);
            }
        }else if(e.which == 2){
            rotSelection();
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
    
    canvas.onmousemove = function(e){
        //tick++;
        if(e.which == 1){
            setCursor(e);
            if(e.shiftKey){
                selection.x2 = cursor.x;
                selection.y2 = cursor.y;
            }else{
                for(var i=0;i<selection.pieces.length;i++){
                    selection.x1 = cursor.x;
                    selection.x2 = cursor.x;
                    selection.y1 = cursor.y;
                    selection.y2 = cursor.y;
                    selection.pieces[i].x = Math.round(cursor.x + selection.pieces[i].cursorOffsetX);
                    selection.pieces[i].y = Math.round(cursor.y + selection.pieces[i].cursorOffsetY);
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
            selection.pieces = getPiecesInArea(selection.x1, selection.y1, selection.x2, selection.y2, table.pieces);
        }
        selection.x1 = cursor.x;
        selection.x2 = cursor.x;
        selection.y1 = cursor.y;
        selection.y2 = cursor.y;
        changePiecesNet(selection.pieces);
        
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
                
                table.pieces = table.pieces.concat(loadedTable.pieces);
                
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
            sendMessage({msg:"requestPieces"});
        }
    });
}

function updatePUBNUBChannel(newChannel){
    PUBNUB_cards.unsubscribe({
        channel: PUBNUB_channel
    });
    
    subscribeToPUBNUBChannel(newChannel);
}



