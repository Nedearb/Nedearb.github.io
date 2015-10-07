var coinProperties = {
    values:{red:0, blue:2, green:3, yellow:4, balck:5, white:6},
    sides:{heads:0, tails:1}, 
    radius:5
};

function makeCoinLocal(val, side, x, y){
    return {val:val, side:side, x:x, y:y, uid:createGuid()};
}
