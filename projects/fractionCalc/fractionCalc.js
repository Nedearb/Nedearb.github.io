
var canvas;
var ctx;

var textSize;

var signMultiply = "\u00F7";
var signDivide = "\u00D7";
var signAdd = "+";
var signSubtract = "-";

var formula = {elements:[
    {number:42, fraction:{top:1, bottom:10}}, 
    {symbol:signMultiply}, 
    {number:3, fraction:{top:56, bottom:100}}, 
    {symbol:signDivide}, 
    {fraction:{top:78, bottom:1000}}, 
    {symbol:signAdd}, 
    {number:6, fraction:{top:5, bottom:3}},
    {symbol:signSubtract}, 
    {fraction:{top:0, bottom:0}}
]};

function canvasOnClick(event){
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
};

function init(){
    canvas = document.getElementById("formulaCanvas");
    ctx = canvas.getContext("2d");
    
    canvas.addEventListener('click', canvasOnClick, false);
    
    
    reDraw();
};

function drawFraction(x, y, fraction){
    var t = ctx.measureText(fraction.top).width;
    var b = ctx.measureText(fraction.bottom).width;
    var w = Math.max(t, b);
    var hw = (w/2);
    
    ctx.fillText(fraction.top, x+hw, y-(textSize*.25));
    
    ctx.moveTo(x, y-1);
    ctx.lineTo(x+w, y-1);
    
    ctx.fillText(fraction.bottom, x+hw, y+(textSize*.75));
    
    //ctx.strokeRect(x-hw, y-10-5, hw*2, 10+12+5);
    
    return w+2;
};

function drawText(x, y, text){
    var w = ctx.measureText(text).width;
    var hw = w/2;
    
    ctx.fillText(text, x+hw, y+4);
    
    //ctx.strokeRect(x, y-10+4, w, 10);
    
    return w+2;
};

function reDraw(){
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    
    ctx.lineWidth = 1;
    
    ctx.textAlign = "center";
    textSize = 20;
    ctx.font=textSize+"px Monospace";
    
    
    //ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    var arrayLength = formula.elements.length;
    
    var drawX = 4;
    var drawY = 32;
    
    for(var i=0;i<arrayLength;i++){
        var e = formula.elements[i];
        if("symbol" in e){
            drawX += drawText(drawX, drawY, e.symbol);
        }
        if("number" in e){
            drawX += drawText(drawX, drawY, e.number);
        }
        if("fraction" in e){
            drawX += drawFraction(drawX, drawY, e.fraction);
        }
    }
    
    
    
    
    ctx.fill();
    ctx.stroke();
};

window.onresize = function(event){
    
};
