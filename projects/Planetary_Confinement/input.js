

function keyDownHandler(e){
    keysTemp[e.keyCode] = true;
}

function keyUpHandler(e){
    keysTemp[e.keyCode] = false;
}