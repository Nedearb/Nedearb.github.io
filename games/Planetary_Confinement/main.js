

function initBuffers(){
    
    var vertices = [
        [-.5,  .5,  0.0],
        [ .5,  .5,  0.0],
        [-.5, -.5,  0.0],
        [ .5, -.5,  0.0],
    ];
    
    bufferVertex = {};
    bufferVertex.square = createBuffer(vertices);
    
    bufferColor = {};
    bufferColor.square = makeSquareColorBuffer(1, 1, 1, 1);
    bufferColor.square.white = bufferColor.square;
    bufferColor.square.red = makeSquareColorBuffer(1, 0, 0, 1);
    bufferColor.square.green = makeSquareColorBuffer(0, 1, 0, 1);
    bufferColor.square.blue = makeSquareColorBuffer(0, 0, 0, 1);
    bufferColor.square.black = makeSquareColorBuffer(0, 0, 0, 1);
    bufferColor.square.gray = makeSquareColorBuffer(.5, .5, .5, 1);
    bufferColor.square.gray.p25 = makeSquareColorBuffer(.25, .25, .25, 1);
    bufferColor.square.gray.p50 = bufferColor.square.gray;
    bufferColor.square.gray.p75 = makeSquareColorBuffer(.75, .75, .75, 1);
    
    bufferTextureCoord = {player:{walk:[]}, enemy:{golem:{walk:[], death:[], attack:[]}}, particle:{}, projectile:{}};
    bufferTextureCoord.player.stand = makeFrame(0, 0, 12, 12, 256, 256);
    bufferTextureCoord.player.jump = makeFrame(12, 0, 12, 12, 256, 256);
    bufferTextureCoord.player.fall = makeFrame(24, 0, 12, 12, 256, 256);
    bufferTextureCoord.player.shoot = makeFrame(36, 0, 12, 12, 256, 256);
    bufferTextureCoord.player.walk.push(makeFrame(0, 12, 12, 12, 256, 256));
    bufferTextureCoord.player.walk.push(makeFrame(12, 12, 12, 12, 256, 256));
    bufferTextureCoord.player.walk.push(makeFrame(24, 12, 12, 12, 256, 256));
    bufferTextureCoord.player.walk.push(makeFrame(36, 12, 12, 12, 256, 256));
    
    bufferTextureCoord.enemy.golem.stand = makeFrame(0, 24, 12, 16, 256, 256);
    bufferTextureCoord.enemy.golem.death.push(makeFrame(12, 24, 12, 16, 256, 256));
    bufferTextureCoord.enemy.golem.death.push(makeFrame(24, 24, 12, 16, 256, 256));
    bufferTextureCoord.enemy.golem.death.push(makeFrame(36, 24, 16, 16, 256, 256));
    bufferTextureCoord.enemy.golem.death.push(makeFrame(36, 24, 16, 16, 256, 256));
    bufferTextureCoord.enemy.golem.walk.push(makeFrame(0, 40, 12, 16, 256, 256));
    bufferTextureCoord.enemy.golem.walk.push(makeFrame(12, 40, 12, 16, 256, 256));
    bufferTextureCoord.enemy.golem.walk.push(makeFrame(24, 40, 12, 16, 256, 256));
    bufferTextureCoord.enemy.golem.walk.push(makeFrame(36, 40, 12, 16, 256, 256));
    bufferTextureCoord.enemy.golem.attack.push(makeFrame(0, 56, 12, 16, 256, 256));
    bufferTextureCoord.enemy.golem.attack.push(makeFrame(12, 56, 12, 16, 256, 256));
    bufferTextureCoord.enemy.golem.attack.push(makeFrame(24, 56, 12, 16, 256, 256));
    
    bufferTextureCoord.particle.muzzleFlashSmall = makeFrame(0, 0, 8, 3, 256, 256);
    bufferTextureCoord.particle.spark1 = makeFrame(0, 3, 3, 3, 256, 256);
    
    bufferTextureCoord.projectile.whiteLine = makeFrame(0, 0, 8, 1, 256, 256);
    
    
    bufferTextureCoord.zeros = makeFrame(0, 0, 0, 0, 1, 1);
    
    
    //console.log(squareBuffer);
}

function initTextures(){
    textureActors = loadTexture("actors.png");
    textureProjectiles = loadTexture("projectiles.png");
    textureLevels = loadTexture("levels.png");
    textureUi = loadTexture("ui.png");
    textureParticle = loadTexture("particles.png");
}

function gameLoop(){
    if(stop){
        return;
    }
    draw();
    update();
    tick++;
}

function draw(){
    gl.viewport(0, 0, gl.viewportWidth*zoom, gl.viewportHeight*zoom);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    //mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, .01, 1000, pMatrix);
    mat4.ortho(0, gl.viewportWidth, gl.viewportHeight, 0, -100, 100, pMatrix);
    mat4.identity(mvMatrix);
    
    mat4.translate(pMatrix, [-view.x, -view.y, 0]);
    
    mvPushMatrix();
    mat4.translate(mvMatrix, [0, 0, depths.background]);
    drawBuffersIndexed(level.bgBuffer);
    mvPopMatrix();
    
    for(var i=0;i<actorList.length;i++){
        actorList[i].draw();
    }
    
    for(var i=0;i<projectileList.length;i++){
        projectileList[i].draw();
    }
    
    for(var i=0;i<particleList.length;i++){
        particleList[i].draw();
    }
}

function update(){
    view.x += (((player.x - gl.viewportWidth/2)-view.x)/3);
    view.y += (((player.y - gl.viewportHeight/2)-view.y)/3);
    
    lastKeys = keys.slice(0);
    keys = keysTemp.slice(0);
    
    for(var i=0;i<actorList.length;i++){
        actorList[i].update();
        if(actorList[i].remove){
            actorList.splice(i, 1);
            i--;
        }
    }
    
    for(var i=0;i<projectileList.length;i++){
        projectileList[i].update();
        if(projectileList[i].remove){
            projectileList.splice(i, 1);
            i--;
        }
    }
    
    for(var i=0;i<particleList.length;i++){
        particleList[i].update();
        if(particleList[i].remove){
            particleList.splice(i, 1);
            i--;
        }
    }
    
    if(keys[KEY_DEBUG_SPAWN_ENEMY] && !lastKeys[KEY_DEBUG_SPAWN_ENEMY]){
        var t = new Actor(player.x, player.y-100, 3, 7, 200, {vertex: bufferVertex.square, color: bufferColor.square.white, texture: textureActors}, bufferTextureCoord.enemy.golem);
        t.initEnemy();
        actorList.push(t);
    }
}

function start(){
    var canvas = document.getElementById("glCanvas");
    initWebGL(canvas);
    
    initShaders();
    initBuffers();
    initTextures();
    
    player = new Actor(0, 0, 2, 5, 100, {vertex: bufferVertex.square, color: bufferColor.square.white, texture: textureActors}, bufferTextureCoord.player);
    player.initPlayer();
    actorList.push(player);
    
    
    /*for(var i=0;i<1000;i++){
        actorList.push(new Actor((Math.random()-.5)*1000, (Math.random()-.5)*1000, {vertex: bufferVertexSquare, color: bufferColorSquareWhite, texCoord: bufferTextureCoord.player.stand, texture: textureActors}));
    }*/
    
    level.structures = [];
    level.structures.push({bounds:makeRect(-100, 30, 200, 12), texBounds:makeRect(0, 0, 4, 4), solid:true});
    level.structures.push({bounds:makeRect(-112, 0, 12, 42), texBounds:makeRect(0, 0, 4, 4), solid:true});
    level.structures.push({bounds:makeRect(100, 6, 12, 36), texBounds:makeRect(0, 0, 4, 4), solid:true});
    level.structures.push({bounds:makeRect(-200, 80, 400, 12), texBounds:makeRect(0, 0, 4, 4), solid:true});
    
    level.structures.push({bounds:makeRect(-2, 24, 4, 32), texBounds:makeRect(4, 0, 4, 4), ladder:true});
    
    level.bgBuffer = createBgBuffer(level.structures, textureLevels);
    
    gl.clearColor(bg.r, bg.g, bg.b, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    
    view.x += Math.round((player.x - gl.viewportWidth/2)-view.x);
    view.y += Math.round((player.y - gl.viewportHeight/2)-view.y);
    

    setInterval(gameLoop, 1000/fps);
    
    window.addEventListener("keydown", keyDownHandler, false);
    window.addEventListener("keyup", keyUpHandler, false);
    
    for(var i = 0;i<256;i++){
        keys.push(false);
    }

        
}

var radian = (Math.PI / 180);
var r45 = radian*45;
var r90 = radian*90;

var KEY_UP = 87;//W
var KEY_DOWN = 83;//S
var KEY_LEFT = 65;//A
var KEY_RIGHT = 68;//D
var KEY_JUMP = 32;//Space
var KEY_SHOOT = 16;//Left Shift
var KEY_DEBUG_SPAWN_ENEMY = 85;//U

var fps = 60;
var tick = 0;
var stop = false;

var zoom = 2;
var bg = {r: 0, g: 0, b: 0};

var depths = {actors: 0, healthBars: 2, background:-1, projectiles: 0, particles: 1};

var gl;
var shaderProgram;

var mvMatrixStack = [];

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var textureActors;
var textureProjectiles;
var textureLevels;
var textureUi;
var textureParticle;

var bufferVertex;
var bufferColor;
var bufferTextureCoord;

var view = {x: 0, y: 0};

var player;
var actorList = [];
var projectileList = [];
var particleList = [];

var level = {};


var keysTemp = [];
var keys = [];
var lastKeys = [];

