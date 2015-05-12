
var radian = (Math.PI / 180)
var r45 = radian*45;
var r90 = radian*90;

var fragmentShaderSource = `
precision mediump float;

varying vec4 vColor;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)) * vColor;
    //Need to add back colors
}
`
    
    
var vertexShaderSource = `
attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;
varying vec2 vTextureCoord;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
    vTextureCoord = aTextureCoord;
}
`

function setMatrixUniforms(){
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function initWebGL(canvas){
    gl = null;
    try{
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }catch(e){
        console.log(e);
    }
    
    if(!gl){
        alert("Unable to initalize WebGL");
    }
}

function loadShader(source, type){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function initShaders(){
    var vertexShader = loadShader(vertexShaderSource, gl.VERTEX_SHADER);
    var fragmentShader = loadShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
        alert("Failed to init Shader Program");
    }
    
    gl.useProgram(shaderProgram);
    
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    
    shaderProgram.textureCoordAttrubute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttrubute);
    
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

function createBuffer(points){
    return createBufferDetailed(points, Float32Array, gl.ARRAY_BUFFER);
}

function createBufferDetailed(points, arrayType, bufferType){
    var buffer = gl.createBuffer();
    gl.bindBuffer(bufferType, buffer);
    
    var pointList = [];
    
    pointList = pointList.concat.apply(pointList, points);
    
    gl.bufferData(bufferType, new arrayType(pointList), gl.STATIC_DRAW);
    
    buffer.numItems = points.length;
    buffer.itemSize = points[0].length;
    
    //console.log(pointList);
    
    return buffer;
}

function createBufferDirectList(points, arrayType, bufferType){
    var buffer = gl.createBuffer();
    gl.bindBuffer(bufferType, buffer);
    
    gl.bufferData(bufferType, new arrayType(points), gl.STATIC_DRAW);
    
    buffer.numItems = points.length;
    buffer.itemSize = 1;
    
    return buffer;
}

function getTexCoords(x, y, texWidth, texHeight, dif){
    return [(x+dif)/texWidth, (y+dif)/texHeight];
}

function initBuffers(){
    
    var vertices = [
        [-0.5,  0.5,  0.0],
        [ 0.5,  0.5,  0.0],
        [-0.5, -0.5,  0.0],
        [ 0.5, -0.5,  0.0],
    ];
    
    /*var vertices = [
        [-12, -12,  0.0],
        [-12,  12,  0.0],
        [ 12, -12,  0.0],
        [ 12,  12,  0.0]
    ];*/
    
    bufferVertexSquare = createBuffer(vertices);
    
    var colors = [
        [1.0, 1.0, 1.0,  1.0],
        [1.0, 1.0, 1.0,  1.0],
        [1.0, 1.0, 1.0,  1.0],
        [1.0, 1.0, 1.0,  1.0]
    ];
    
    bufferColorSquareWhite = createBuffer(colors);
    
    var min = getTexCoords(0, 0, 256, 256, .5);
    var max = getTexCoords(12, 12, 256, 256, -.5);
    
    var texCoords = [
        min,
        [max[0], min[1]],
        [min[0], max[1]],
        max
    ];
    
    
    bufferTextureCoord = {player:{stand:null}};
    bufferTextureCoord.player.stand = createBuffer(texCoords);
    bufferTextureCoord.player.stand.width = 12;
    bufferTextureCoord.player.stand.height = 12;
    
    //console.log(squareBuffer);
}

function add(arrayA, arrayB){
    var arrayC = [];
    for(var i=0;i<arrayA.length;i++){
        arrayC.push(arrayA[i] + arrayB[i]);
    }
    return arrayC;
}

function sub(arrayA, arrayB){
    var arrayC = [];
    for(var i=0;i<arrayA.length;i++){
        arrayC.push(arrayA[i] - arrayB[i]);
    }
    return arrayC;
}

function mult(arrayA, arrayB){
    var arrayC = [];
    for(var i=0;i<arrayA.length;i++){
        arrayC.push(arrayA[i] * arrayB[i]);
    }
    return arrayC;
}

function neg(arrayA){
    var arrayC = [];
    for(var i=0;i<arrayA.length;i++){
        arrayC.push(-arrayA[i]);
    }
    return arrayC;
}

function oneDiv(arrayA){
    var arrayC = [];
    for(var i=0;i<arrayA.length;i++){
        arrayC.push(1 / arrayA[i]);
    }
    return arrayC;
}

function mvPushMatrix(){
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix(){
    if(mvMatrixStack.length == 0){
        throw "Cannot pop matrix";
        return;
    }
    mvMatrix = mvMatrixStack.pop();
}

function drawBuffers(vertexBuffer, colorBuffer, texCoordBuffer, texture){
    
    if(texture.loaded){
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttrubute, texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
        setMatrixUniforms();
        //gl.drawElements(buffer.mode, buffer.index.numItems, gl.UNSIGNED_SHORT, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexBuffer.numItems);
        
    }
}

function loadTexture(path){
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.loaded = false;
    texture.image.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        texture.loaded = true;
    }
    texture.image.src = path;
    return texture;
}

function initTextures(){
    textureAtlasActors = loadTexture("actors.png");
}

function tick(){
    draw();
    update();
}

function draw(){
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, .01, 1000, pMatrix);
    //mat4.ortho(pMatrix, -1.0, 1.0, -1.0, 1.0, -100, 100);
    mat4.identity(mvMatrix);
    
    //mat4.scale(pMatrix, [100, 100, 1]);
    mat4.translate(pMatrix, [-view.x, -view.y, -zoom]);
    //mat4.translate(pMatrix, [(Math.random()-.5)*100, (Math.random()-.5)*100, (Math.random()-.5)*100]);
    
    for(var i=0;i<actorList.length;i++){
        actorList[i].draw();
    }
    
    /*gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer.positon);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareBuffer.positon.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer.color);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareBuffer.color.itemSize, gl.FLOAT, false, 0, 0);
    
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareBuffer.positon.numItems);*/
}

function update(){
    view.x = player.x;
    view.y = player.y;
    for(var i=0;i<actorList.length;i++){
        actorList[i].update();
    }
    player.x += 1;
}

function start(){
    var canvas = document.getElementById("glCanvas");
    initWebGL(canvas);
    
    initShaders();
    initBuffers();
    initTextures();
    
    player = new Actor(0, 0, {vertex: bufferVertexSquare, color: bufferColorSquareWhite, texCoord: bufferTextureCoord.player.stand, texture: textureAtlasActors});
    actorList.push(player);
    actorList.push(new Actor(10, -100, {vertex: bufferVertexSquare, color: bufferColorSquareWhite, texCoord: bufferTextureCoord.player.stand, texture: textureAtlasActors}));
    
    /*for(var i=0;i<1000;i++){
        actorList.push(new Actor((Math.random()-.5)*1000, (Math.random()-.5)*1000, {vertex: bufferVertexSquare, color: bufferColorSquareWhite, texCoord: bufferTextureCoord.player.stand, texture: textureAtlasActors}));
    }*/
    
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    

    setInterval(tick, 1000/10);

        
}

var Actor = function(x, y, renderInfo){
    this.x = x;
    this.y = y;
    this.renderInfo = renderInfo;

    this.update = function(){

    }
    
    this.draw = function(){
        mvPushMatrix();
        mat4.translate(mvMatrix, [this.x, this.y, 0]);
        mat4.scale(mvMatrix, [this.renderInfo.texCoord.width, this.renderInfo.texCoord.height, 0]);
        drawBuffers(this.renderInfo.vertex, this.renderInfo.color, this.renderInfo.texCoord, this.renderInfo.texture);
        mvPopMatrix();
    }
}


var gl;
var shaderProgram;

var zoom = 300;

var mvMatrixStack = [];

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var textureAtlasActors;

var bufferVertexSquare;
var bufferColorSquareWhite;
var bufferTextureCoord;

var view = {x: 0, y: 0};

var player;
var actorList = [];

