

let pivotX = 5;
let pivotY = 5;

let xScale = 10;
let yScale = 10;

let xmin;
let xmax;
let dx = .5;
let dy = dx;

let xOffset;
let yOffset;

let funcStr = "";

let curve = function(x){
    return eval(funcStr);
}

let curveX = [];
let curveY = [];

let canvas;
let context;
let width;
let height;

let resized = function(){

    width = canvas.width;
    height = canvas.height;

    xmin = -width/2;
    xmax = width/2;

    ymin = -height/2;
    ymax = height/2;

    xOffset = width/2/xScale;
    yOffset = height/2/yScale;

}

let drawX = function(x){
    return (x+xOffset)*xScale;
}

let drawY = function(y){
    return height-(y+yOffset)*yScale;
}

let init = function(){
    canvas = document.getElementById("mainCanvas");
    context = canvas.getContext("2d");

    resized();

    

    canvas.addEventListener('click', function(e){
        let cx = e.clientX-canvas.offsetLeft;
        let cy = e.clientY-canvas.offsetTop;
        pivotX = (cx/xScale)-xOffset;
        pivotY = ((height-cy)/yScale)-yOffset;
        draw();
    },false);

    draw();
}

let draw = function(){

    funcStr = document.getElementById("funcInput").value;

    context.beginPath();
    context.fillStyle = "white";
    context.rect(0, 0, width, height);
    context.fill();

    context.beginPath();
    context.lineWidth=".5";
    context.strokeStyle = "black";
    context.rect(0, 0, width, height);
    context.moveTo(width/2, 0);
    context.lineTo(width/2, height);
    context.moveTo(0, height/2);
    context.lineTo(width, height/2);
    context.stroke();

    context.beginPath();
    context.fillStyle="red";
    context.arc(drawX(pivotX), drawY(pivotY), xScale/4, 0, Math.PI*2);
    context.fill();

    let pointsX = [];
    let pointsY = [];

    context.beginPath();
    context.lineWidth="1";
    context.strokeStyle="blue";

    curveX = [];
    curveY = [];

    let first = true;

    for(let x = xmin; x < xmax; x+=dx){
        let y = curve(x);

        curveX.push(x);
        curveY.push(y);

        if(isNaN(y)){
            first = true;
        }else{
            if(first){
                first = false;
                context.moveTo(drawX(x), drawY(y));
            }else{
                context.lineTo(drawX(x), drawY(y));
            }
        }
    
    }
    context.stroke();

    pointsX = [];
    pointsY = [];

    for(let xt = xmin; xt < xmax; xt+=dx){
        for(let yt = ymin; yt < ymax; yt+=dy){

            let minDist2Curve2 = Infinity;
            for(let i = 0; i < curveX.length; i++){
                minDist2Curve2 = Math.min((xt-curveX[i])**2 + (yt-curveY[i])**2, minDist2Curve2);
            }

            dist2Pivot = Math.sqrt((xt-pivotX)**2 + (yt-pivotY)**2);
            if(Math.abs(dist2Pivot - Math.sqrt(minDist2Curve2)) <= dx/2){
                pointsX.push(xt);
                pointsY.push(yt);
            }
        }
    }


    //context.lineWidth="1";
    //context.strokeStyle="green";


    for(let i = 0; i < pointsX.length; i++){
        let x = pointsX[i];
        let y = pointsY[i];

        context.beginPath();
        context.fillStyle="green";
        context.rect(drawX(x)-1, drawY(y)-1, 2, 2);
        context.fill();

        if(i == 0){
            //context.moveTo(drawX(x), drawY(y));
        }else{
            //context.lineTo(drawX(x), drawY(y));
        }
    }
    //context.stroke();
}
