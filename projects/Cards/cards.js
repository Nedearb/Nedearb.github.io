var cardProperties = {
    values:{ace:0, two:1, three:2, four:3, five:4, six:5, seven:6, eight:7, nine:8, ten:9, jack:10, queen:11, king:12}, 
    suits:{clubs:0, spades:1, diamonds:2, hearts:3}, 
    sides:{faceDown:0, faceUp:1}, 
    orientations:{portrait:0, landspace:1}, 
    width:28, height:38
};


function makeCardLocal(val, suit, side, rot, x, y){
    return {val:val, suit:suit, side:side, rot:rot, x:x, y:y, uid:createGuid()};
}

function makeDeckLocal(side, rot, x, y){
    var deck = [];
    for(var i=0;i<4;i++){
        for(var j=0;j<13;j++){
            deck.push(makeCardLocal(j, i, side, rot, x+(i*j/10), y+(i*j/10)));
        }
    }
    return deck;
}

function getCardAtPosition(pos, list){
    for(var i=list.length-1;i>=0;i--){
        var card = list[i];
        if(card.rot == cardProperties.orientations.landscape){
            if(card.x-cardProperties.halfHeight < pos.x && card.x+cardProperties.halfHeight > pos.x && card.y-cardProperties.halfWidth < pos.y && card.y+cardProperties.halfWidth > cursor.y){
                return card;
            }
        }else{
            if(card.x-cardProperties.halfWidth < pos.x && card.x+cardProperties.halfWidth > pos.x && card.y-cardProperties.halfHeight < pos.y && card.y+cardProperties.halfHeight > cursor.y){
                return card;
            }
        }
    }
    return null;
}

function getCardsInArea(x1, y1, x2, y2, list){
    var cards = [];
    for(var i=list.length-1;i>=0;i--){
        var card = list[i];
        if(card.rot == cardProperties.orientations.landscape){
            if(AABB(x1, y1, x2, y2, card.x-cardProperties.halfHeight, card.y-cardProperties.halfWidth, card.x+cardProperties.halfHeight, card.y+cardProperties.halfWidth)){
                cards.push(card);
            }
        }else{
            if(AABB(x1, y1, x2, y2, card.x-cardProperties.halfWidth, card.y-cardProperties.halfHeight, card.x+cardProperties.halfWidth, card.y+cardProperties.halfHeight)){
                cards.push(card);
            }
        }
    }
    return cards;
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
        if(table.cards[i].uid == uid){
            table.cards.splice(i, 1);
            return table.cards[i];
        }
    }
    return null;
}

function moveCardToTopLocal(uid){
    for(var i=0;i<table.cards.length;i++){
        var card = table.cards[i];
        if(card.uid == uid){
            table.cards.splice(i, 1);
            table.cards.push(card);
            return;
        }
    }
}

function changeCardLocal(changedCard){
    for(var i=0;i<table.cards.length;i++){
        if(table.cards[i].uid == changedCard.uid){
            table.cards[i].val = changedCard.val;
            table.cards[i].suit = changedCard.suit;
            table.cards[i].side = changedCard.side;
            table.cards[i].rot = changedCard.rot;
            table.cards[i].x = changedCard.x;
            table.cards[i].y = changedCard.y;
            return;
        }
    }
    table.cards.push(changedCard);
}


function flipSelection(){
    if(selection.cards.length == 0){
        var card = getCardAtPosition(cursor, table.cards);
        if(card){
            selection.cards.push(card);
        }
    }
    for(var i=0;i<selection.cards.length;i++){
        if(selection.cards[i].side == cardProperties.sides.faceDown){
            selection.cards[i].side = cardProperties.sides.faceUp;
        }else{
            selection.cards[i].side = cardProperties.sides.faceDown;
        }
    }
    changeCardsNet(selection.cards);
    //moveCardsToTopNet(selection.cards);
    selection.cards = [];
}

function rotSelection(){
    if(selection.cards.length == 0){
        var card = getCardAtPosition(cursor, table.cards);
        if(card){
            selection.cards.push(card);
        }
    }
    for(var i=0;i<selection.cards.length;i++){
        if(selection.cards[i].rot == cardProperties.orientations.portrait){
            selection.cards[i].rot = cardProperties.orientations.landscape;
        }else{
            selection.cards[i].rot = cardProperties.orientations.portrait;
        }
    }
    changeCardsNet(selection.cards);
    //moveCardsToTopNet(selection.cards);
    selection.cards = [];
}




