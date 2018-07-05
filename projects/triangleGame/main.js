
let gridElements = [];
let gridCoords = [];
let gridContainer;

let rowQty;
let rowLen = [];

let tileElements = [];
let tileContainer;

let touchDownX = null;
let touchDownY = null;

let vecRightX = 1;
let vecRightY = 0;

let vecForwardSlashDownX = -0.5;
let vecForwardSlashDownY = Math.sqrt(3)/2;

let vecBackwardSlashDownX = 0.5;
let vecBackwardSlashDownY = Math.sqrt(3)/2;


let msgLeft;
let msgRight;
let tryAgainButton;


let init = function(){
    //console.log("init");

    rowQty = 0;

    gridContainer = document.getElementsByClassName("gameContainer")[0];
    tileContainer = document.getElementsByClassName("tileContainer")[0];
    let rows = gridContainer.children;
    for(let y = 0; y < rows.length; y++){
        gridElements.push([]);
        tileElements.push([]);
        gridCoords.push([]);
        let row = rows[y].children;
        if(rows[y].className == "gridRow"){
            rowQty++;
            for(let x = 0; x < row.length; x++){
                let cell = row[x];
                if(cell.className.includes("gridPiece")){
                    gridElements[y].push(cell);
                    tileElements[y].push(null);
                    let isV = gridElements[y].length%2==0;
                    let xPos = cell.getBoundingClientRect().left+(isV?0:0)+80-110-4;
                    let yPos = cell.getBoundingClientRect().top+(isV?44:0)-9;
                    gridCoords[y].push({x: xPos, y: yPos});
                }
            }
            rowLen.push(gridElements[y].length);
        }
    }

    document.body.onkeydown = function(e){
        let moved = false;
        if(e.keyCode == 'Q'.charCodeAt(0)){
            moved = shiftBackwardSlash(false);
        }else if(e.keyCode == 'W'.charCodeAt(0)){
            moved = shiftForwardSlash(false);
        }else if(e.keyCode == 'A'.charCodeAt(0)){
            moved = shiftHoriz(false);
        }else if(e.keyCode == 'S'.charCodeAt(0)){
            moved = shiftHoriz(true);
        }else if(e.keyCode == 'Z'.charCodeAt(0)){
            moved = shiftForwardSlash(true);
        }else if(e.keyCode == 'X'.charCodeAt(0)){
            moved = shiftBackwardSlash(true);
        }
        if(moved){
            cleanRecentMerges();
            addNewRandomTile();
            checkLoss();
        }
    };

    document.addEventListener('touchstart', function(e){
        touchDownX = e.touches[0].clientX;
        touchDownY = e.touches[0].clientY;
    }, false);

    document.addEventListener('touchmove', function(e){
        if(!touchDownX || !touchDownY){
            return;
        }

        let touchUpX = e.touches[0].clientX;
        let touchUpY = e.touches[0].clientY;

        let dx = touchUpX - touchDownX;
        let dy = touchUpY - touchDownY;

        let horizDot = dx*vecRightX + dy*vecRightY;
        let forwardDot = dx*vecForwardSlashDownX + dy*vecForwardSlashDownY;
        let backwardDot = dx*vecBackwardSlashDownX + dy*vecBackwardSlashDownY;

        let moved = false;

        if(Math.abs(horizDot) > Math.abs(forwardDot) && Math.abs(horizDot) > Math.abs(backwardDot)){
            if(horizDot > 0){
                moved = shiftHoriz(true);
            }else{
                moved = shiftHoriz(false);
            }
        }else if(Math.abs(forwardDot) > Math.abs(horizDot) && Math.abs(forwardDot) > Math.abs(backwardDot)){
            if(forwardDot > 0){
                moved = shiftForwardSlash(true);
            }else{
                moved = shiftForwardSlash(false);
            }
        }else if(Math.abs(backwardDot) > Math.abs(horizDot) && Math.abs(backwardDot) > Math.abs(forwardDot)){
            if(backwardDot > 0){
                moved = shiftBackwardSlash(true);
            }else{
                moved = shiftBackwardSlash(false);
            }
        }

        if(moved){
            cleanRecentMerges();
            addNewRandomTile();
            checkLoss();
        }

        touchDownX = null;
        touchDownY = null;

    }, false);

    addNewRandomTile();
    addNewRandomTile();


    /*let openTiles = findAllOpenTiles();
    let x = 2;
    for(let i = 0; i < 16; i++){
        addTile(openTiles[i].row, openTiles[i].col, x);
        x *= 2;
    }*/

    /*addTile(1, 2, 256);
    addTile(2, 2, 512);
    addTile(3, 2, 1024);

    addTile(2, 3, 2048);
    addTile(3, 3, 4096);

    addTile(2, 4, 8192);
    addTile(3, 4, 16384);

    addTile(3, 5, 32768);

    addTile(3, 6, 65536);*/

    

}

let isInBounds = function(row, col){
    return row >= 0 && row < rowQty && col >= 0 && col < rowLen[row];
}

let cellCanMerge = function(row, col){
    let val = tileElements[row][col].getAttribute("tilenum");
    if(isInBounds(row, col-1) && tileElements[row][col-1].getAttribute("tilenum") == val){
        return true;
    }
    if(isInBounds(row, col+1) && tileElements[row][col+1].getAttribute("tilenum") == val){
        return true;
    }
    if(col%2==0){
        if(isInBounds(row+1, col+1) && tileElements[row+1][col+1].getAttribute("tilenum") == val){
            return true;
        }
    }else{
        if(isInBounds(row-1, col-1) && tileElements[row-1][col-1].getAttribute("tilenum") == val){
            return true;
        }
    }
    return false;
}

let isLossState = function(){
    for(let row = 0; row < rowQty; row++){
        for(let col = 0; col <= row*2; col++){
            if(tileElements[row][col] == null){
                return false;
            }
        }
    }
    for(let row = 0; row < rowQty; row++){
        for(let col = 0; col <= row*2; col++){
            if(cellCanMerge(row, col)){
                return false;
            }
        }
    }
    return true;
}

let resetGame = function(){
    msgLeft.style.animationName = "";
    msgRight.style.animationName = "";
    tryAgainButton.style.opacity = 0;
    tryAgainButton.style.transitionDuration = "0.5s";

    setTimeout(function(){
        msgLeft.style.animationName = "msgLeftSlideOut";
        msgRight.style.animationName = "msgRightSlideOut";
        msgLeft.style.animationTimingFunction = "ease-in";
        msgRight.style.animationTimingFunction = "ease-in";
        msgLeft.style.animationDuration = "0.25s";
        msgRight.style.animationDuration = "0.25s";
    }, 1);

    setTimeout(function(){
        gridContainer.removeChild(msgLeft);
        gridContainer.removeChild(msgRight);
    }, 250);

    setTimeout(function(){
        gridContainer.removeChild(tryAgainButton);
    }, 500);

    for(let row = 0; row < rowQty; row++){
        for(let col = 0; col <= row*2; col++){
            let prev = tileElements[row][col];
            prev.style.opacity = 0;
            setTimeout(function(){
                try{
                    tileContainer.removeChild(prev);
                }catch(e){};
            }, 500);

            tileElements[row][col] = null;
        }
    }

    addNewRandomTile();
    addNewRandomTile();

}

let checkLoss = function(){
    if(isLossState()){

        msgLeft = document.createElement("div")
        msgLeft.className = "message msgLeft";
        msgLeft.innerHTML = "<span>GAME</span>";
        gridContainer.appendChild(msgLeft);

        msgRight = document.createElement("div")
        msgRight.className = "message msgRight";
        msgRight.innerHTML = "<span>OVER</span>";
        gridContainer.appendChild(msgRight);

        tryAgainButton = document.createElement("button");
        tryAgainButton.className = "tryAgain";
        tryAgainButton.innerHTML = "TRY AGAIN";
        tryAgainButton.onclick = resetGame;
        tryAgainButton.style.opacity = 0;
        tryAgainButton.style.transitionDuration = "1s";
        setTimeout(function(){
            tryAgainButton.style.opacity = 1;
        }, 1);
        gridContainer.appendChild(tryAgainButton);
    }
}

let cleanRecentMerges = function(){
    for(let row = 0; row < rowQty; row++){
        for(let col = 0; col <= row*2; col++){
            let cell = tileElements[row][col];
            if(cell != null){
                if(cell.hasAttribute("recentMerge")){
                    cell.removeAttribute("recentMerge");
                }
            }
        }
    }
}

let findAllOpenTiles = function(){
    let openTiles = [];
    for(let row = 0; row < rowQty; row++){
        for(let col = 0; col <= row*2; col++){
            if(tileElements[row][col] == null){
                openTiles.push({"row":row, "col":col});
            }
        }
    }
    return openTiles;
}

let addNewRandomTile = function(){
    let openTiles = findAllOpenTiles();
    let spot = openTiles[Math.floor(Math.random() * openTiles.length)];
    addTile(spot.row, spot.col, (Math.random() >= 0.9)?4:2);
}

let addTile = function(row, col, value){
    let newTile = document.createElement("div");
    let pos = gridCoords[row][col];
    newTile.className = "grid"+(col%2==0?"A":"V")+" gridPiece tilePiece";
    newTile.setAttribute("tilenum", value);
    newTile.innerHTML = getInnerHTMLForTile(col%2==0, value);
    newTile.style.position = "absolute";
    newTile.style.left = pos.x+'px';
    newTile.style.top = pos.y+'px';
    newTile.style.opacity = 0;
    setTimeout(function(){
        newTile.style.opacity = 1;
    }, 100);
    tileContainer.appendChild(newTile);
    tileElements[row][col] = newTile;
}

let getInnerHTMLForTile = function(isA, num){
    return "<div class=\"tilenum"+(isA?"A":"V")+num.toString().length+"\"><span>"+num+"</span></div>";
}

let moveAndMergeTile = function(row, col, dirRow, dirCol){
    let newRow = row + dirRow;
    let newCol = col + dirCol;
    if(newRow < 0 || newRow > rowQty-1){
        return false;
    }
    if(newCol < 0 || newCol > rowLen[newRow]-1){
        return false;
    }
    let tile = tileElements[row][col];

    if(tile == null){
        return false;
    }

    if(tileElements[newRow][newCol] != null){
        let num = tile.getAttribute("tilenum");
        if(num == tileElements[newRow][newCol].getAttribute("tilenum")){
            if(!tile.hasAttribute("recentMerge") && !tileElements[newRow][newCol].hasAttribute("recentMerge")){
                tile.setAttribute("tilenum", num*2);
                let prev = tileElements[newRow][newCol];
                prev.style.opacity = 0;
                setTimeout(function(){
                    try{
                        tileContainer.removeChild(prev);
                    }catch(e){};
                }, 500);
                tile.setAttribute("recentMerge", "")
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    tileElements[row][col] = null;
    tileElements[newRow][newCol] = tile;

    if((newCol)%2==0){
        tile.className = tile.className.replace("gridV", "gridA");
    }else{
        tile.className = tile.className.replace("gridA", "gridV");
    }
    tile.innerHTML = getInnerHTMLForTile(newCol%2==0, tile.getAttribute("tilenum"));
    
    let pos = gridCoords[newRow][newCol];
    tile.style.left = pos.x+'px';
    tile.style.top = pos.y+'px';
    return true;
}

let shiftTileHoriz = function(row, col, right){
    let moved = false;
    let everMoved = false;
    do{
        moved = moveAndMergeTile(row, col, 0, right?1:-1);
        if(moved) everMoved = true;
        col += right?1:-1;
    }while(moved);
    return everMoved;
}

let shiftTileForwardSlash = function(row, col, down){
    let moved = false;
    let everMoved = false;
    do{
        let isV = col%2==1;
        let dirRow = isV?(down?0:-1):(down?1:0);
        let dirCol = isV?-1:1;
        moved = moveAndMergeTile(row, col, dirRow, dirCol);
        if(moved) everMoved = true;
        row += dirRow;
        col += dirCol;
    }while(moved);
    return everMoved;
}

let shiftTileBackwardSlash = function(row, col, down){
    let moved = false;
    let everMoved = false;
    do{
        let isV = col%2==1;
        let dirRow = isV?(down?0:-1):(down?1:0);
        let dirCol = down?1:-1;
        moved = moveAndMergeTile(row, col, dirRow, dirCol);
        if(moved) everMoved = true;
        row += dirRow;
        col += dirCol;
    }while(moved);
    return everMoved;
}

let shiftHoriz = function(shiftRight){
    let moved = false;
    for(let y = 0; y < rowQty; y++){
        let rowMax = y*2; // max col index
        for(let i = 0; i <= rowMax; i++){
            let x = shiftRight?rowMax-i:i;
            if(shiftTileHoriz(y, x, shiftRight)) moved = true;
        }
    }
    return moved;
}

let shiftForwardSlash = function(shiftDown){
    let moved = false;
    for(let y = 0; y < rowQty; y++){
        if(shiftDown){
            let row = rowQty-1;
            let col = y*2;
            let sign = 1;
            while(isInBounds(Math.ceil(row), col)){
                if(shiftTileForwardSlash(Math.ceil(row), col, shiftDown)) moved = true;
                //console.log(Math.ceil(row), col);
                row -= 0.5;
                col += sign;
                sign = -sign;
            }
        }else{
            let row = y+0.5;
            let col = y*2
            let sign = 1;
            while(isInBounds(Math.floor(row), col)){
                if(shiftTileForwardSlash(Math.floor(row), col, shiftDown)) moved = true;
                //console.log(Math.ceil(row), col);
                row += 0.5;
                col += sign;
                sign = -sign;
            }
        }
        // slash/up 0: 3,0  3,1  2,0  2,1  1,0  1,1  0,0
        // slash/up 1: 3,2  3,3  2,2  2,3  1,2
        // slash/up 2: 3,4  3,5  2,4
        // slash/up 3: 3,6
    }
    return moved;
}

let shiftBackwardSlash = function(shiftDown){
    let moved = false;
    for(let y = 0; y < rowQty; y++){
        if(shiftDown){
            let row = rowQty-1;
            let col = y*2;
            while(isInBounds(Math.ceil(row), col)){
                if(shiftTileBackwardSlash(Math.ceil(row), col, shiftDown)) moved = true;
                //console.log(Math.ceil(row), col);
                row -= 0.5;
                col -= 1;
            }
        }else{
            let row = y+0.5;
            let col = 0;
            while(isInBounds(Math.floor(row), col)){
                if(shiftTileBackwardSlash(Math.floor(row), col, shiftDown)) moved = true;
                //console.log(Math.floor(row), col);
                row += 0.5;
                col += 1;
            }
        }
        // slash\up 3,0: 3,6  3,5  2,4  2,3  1,2  1,1  0,0
        // slash\up 2,1: 3,4  3,3  2,2  2,1  1,0
        // slash\up 1,2: 3,2  3,1  2,0
        // slash\up 0,3: 3,0
    }
    return moved;
}

/*
 ,      ,
  \q  w/

<- a  s ->

  /z  x\
 '      '
*/



init();