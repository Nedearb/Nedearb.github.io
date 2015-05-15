
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
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if(gl){
            gl.viewportWidth = canvas.width/zoom;
            gl.viewportHeight = canvas.height/zoom;
        }
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

function getTexCoords(x, y, texW, texH, dif){
    return [(x+dif)/texW, (y+dif)/texH];
}

function makeFrame(x, y, w, h, texW, texH){
    
    var min = getTexCoords(x, y, texW, texH, .5);
    var max = getTexCoords(x+w, y+h, texW, texH, -.5);
    
    var texCoords = [
        [min[0], max[1]],
        max,
        min,
        [max[0], min[1]],
    ];
    
    var b = createBuffer(texCoords);
    b.width = w;
    b.height = h;
    
    return b;
}

function initBuffers(){
    
    var vertices = [
        [-.5,  .5,  0.0],
        [ .5,  .5,  0.0],
        [-.5, -.5,  0.0],
        [ .5, -.5,  0.0],
    ];
    
    bufferVertexSquare = createBuffer(vertices);
    
    var colors = [
        [1.0, 1.0, 1.0,  1.0],
        [1.0, 1.0, 1.0,  1.0],
        [1.0, 1.0, 1.0,  1.0],
        [1.0, 1.0, 1.0,  1.0]
    ];
    
    bufferColorSquareWhite = createBuffer(colors);
    
    
    bufferTextureCoord = {player:{walk:[]}, enemy:{golem:{walk:[], death:[], attack:[]}}, projectile:{}};
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
    
    bufferTextureCoord.projectile.whiteLine = makeFrame(0, 0, 8, 1, 256, 256);
    
    
    //console.log(squareBuffer);
}

function createBgBuffer(rectangles, texture){
    var vertices = [];
    var colors = [];
    var texCoords = [];
    var indices = [];
    var j = 0;
    for(var i=0;i<rectangles.length;i++){
        var r = rectangles[i];
        if(r.texBounds){
            vertices.push.apply(vertices, [
                [r.bounds.x1, r.bounds.y2, 0.0], 
                [r.bounds.x2, r.bounds.y2, 0.0],
                [r.bounds.x1, r.bounds.y1, 0.0],
                [r.bounds.x2, r.bounds.y1, 0.0]
                                          ]);
            colors.push.apply(colors, [[1, 1, 1, 1],  [1, 1, 1, 1],  [1, 1, 1, 1],  [1, 1, 1, 1]]);

            var min = getTexCoords(r.texBounds.x1, r.texBounds.y1, texture.width, texture.height, .5);
            var max = getTexCoords(r.texBounds.x2, r.texBounds.y2, texture.width, texture.height, -.5);
            texCoords.push.apply(texCoords, [[min[0], max[1]], max, min, [max[0], min[1]]]);
            indices.push.apply(indices, [(4*j)+0, (4*j)+1, (4*j)+2, (4*j)+3, (4*j)+1, (4*j)+2]);
            j++;
        }
    }
    return {vertex: createBuffer(vertices), color: createBuffer(colors), texCoord: createBuffer(texCoords), index: createBufferDirectList(indices, Uint16Array, gl.ELEMENT_ARRAY_BUFFER), texture: texture};
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

function drawBuffers(renderInfo){
    
    if(renderInfo.texture.loaded){
    
        gl.bindBuffer(gl.ARRAY_BUFFER, renderInfo.vertex);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, renderInfo.vertex.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, renderInfo.color);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, renderInfo.color.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, renderInfo.texCoord);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttrubute, renderInfo.texCoord.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, renderInfo.texture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
        setMatrixUniforms();
        //gl.drawElements(buffer.mode, buffer.index.numItems, gl.UNSIGNED_SHORT, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, renderInfo.vertex.numItems);
        
    }
}

function drawBuffersIndexed(renderInfo){
    
    if(renderInfo.texture.loaded){
    
        gl.bindBuffer(gl.ARRAY_BUFFER, renderInfo.vertex);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, renderInfo.vertex.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, renderInfo.color);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, renderInfo.color.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, renderInfo.texCoord);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttrubute, renderInfo.texCoord.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, renderInfo.texture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderInfo.index);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, renderInfo.index.numItems, gl.UNSIGNED_SHORT, 0);
        
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
    texture.width = 256;
    texture.height = 256;
    return texture;
}

function initTextures(){
    textureActors = loadTexture("actors.png");
    textureProjectiles = loadTexture("projectiles.png");
    textureLevels = loadTexture("levels.png");
}

function gameLoop(){
    draw();
    update();
    tick++;
}

function draw(){
    gl.viewport(0, 0, gl.viewportWidth*zoom, gl.viewportHeight*zoom);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    //mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, .01, 1000, pMatrix);
    mat4.ortho(0, gl.viewportWidth, gl.viewportHeight, 0, -1, 1, pMatrix);
    mat4.identity(mvMatrix);
    
    mat4.translate(pMatrix, [-view.x, -view.y, 0]);
    
    
    drawBuffersIndexed(level.bgBuffer);
    
    for(var i=0;i<actorList.length;i++){
        actorList[i].draw();
    }
    
    for(var i=0;i<projectileList.length;i++){
        projectileList[i].draw();
    }
}

function update(){
    view.x += Math.round(((player.x - gl.viewportWidth/2)-view.x)/3);
    view.y += Math.round(((player.y - gl.viewportHeight/2)-view.y)/3);
    
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
    
    if(keys[KEY_DEBUG_SPAWN_ENEMY] && !lastKeys[KEY_DEBUG_SPAWN_ENEMY]){
        var t = new Actor(player.x, player.y-100, 3, 7, 200, {vertex: bufferVertexSquare, color: bufferColorSquareWhite, texture: textureActors}, bufferTextureCoord.enemy.golem);
        t.initEnemy();
        actorList.push(t);
    }
}

function keyDownHandler(e){
    keysTemp[e.keyCode] = true;
}

function keyUpHandler(e){
    keysTemp[e.keyCode] = false;
}

function start(){
    var canvas = document.getElementById("glCanvas");
    initWebGL(canvas);
    
    initShaders();
    initBuffers();
    initTextures();
    
    player = new Actor(0, 0, 2, 5, 100, {vertex: bufferVertexSquare, color: bufferColorSquareWhite, texture: textureActors}, bufferTextureCoord.player);
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

function makeInvRect(x, y, w, h){
    return {x1: x, y1: -y-h, x2: x+w, y2: -y};
}

function makeRect(x, y, w, h){
    return {x1: x, y1: y, x2: x+w, y2: y+h};
}

function AABB(a, b){
    return (
        a.x1 < b.x2 &&
        a.x2 > b.x1 &&
        a.y1 < b.y2 &&
        a.y2 > b.y1
    );
}

function contains(box, p){
    return p.x >= box.x1 && p.x <= box.x2 && p.y >= box.y1 && p.y <= box.y2;
}

function maxBounds(a, b){
    if(!a){
        return b;
    }
    if(!b){
        return a;
    }
    return {x1:Math.max(a.x1, b.x1), y1:Math.max(a.y1, b.y1), x2:Math.max(a.x2, b.x2), y2:Math.max(a.y2, b.y2)}
}

var Actor = function(x, y, hw, hh, maxHp, renderInfo, frames) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.hw = hw;
    this.hh = hh;
    this.depth = 0;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.renderInfo = renderInfo;
    this.renderInfo.texCoord = frames.stand;
    this.facingRight = true;
    
    this.speeds = {walk: .5};
    
    this.tick = 0;
    this.frameTick = 0;
    this.frames = frames;
    this.frameSpeed = 10;
    
    this.freezeTime = -1;
    this.frozen = false;
    
    this.shootCooldown = -1;
    
    this.collisionWithLadder = function(xOff, yOff){
        var myBounds = {x1: this.x+xOff-this.hw, y1: this.y+yOff-this.hh, x2: this.x+xOff+this.hw, y2: this.y+yOff+this.hh};
        for(var i=0;i<level.structures.length;i++){
            var s = level.structures[i];
            if(s.ladder){
                if(AABB(s.bounds, myBounds)){
                    return s;
                }
            }
        }
        return false;
    }
    
    this.collision = function(xOff, yOff){
        var myBounds = {x1: this.x+xOff-this.hw, y1: this.y+yOff-this.hh, x2: this.x+xOff+this.hw, y2: this.y+yOff+this.hh};
        var c = null;
        for(var i=0;i<level.structures.length;i++){
            var s = level.structures[i];
            if(s.solid){
                if(AABB(s.bounds, myBounds)){
                    c = maxBounds(s.bounds);
                }
            }
        }
        return c;
    }
    
    this.die = function(){
        this.remove = true;
        console.log("Super Die");
    }
    
    this.frameAndHealthUpdate = function(){
        this.tick++;
        this.frameTick = Math.floor(this.tick / this.frameSpeed);
        
        if(this.hp <= 0){
            if(!this.dead){
                this.die();
            }
            this.dead = true;
        }
        
        if(this.frozen){
            if(this.freezeTime > 0){
                this.freezeTime--;
            }else if(this.freezeTime == 0){
                this.freezeTime = -1;
                this.frozen = false;
            }
        }
        if(this.shootCooldown > 0){
            this.shootCooldown--;
        }else if(this.shootCooldown == 0){
            this.shootCooldown = -1;
        }
    }

    this.update = function(){
        
        this.frameAndHealthUpdate();
        
        this.x += this.vx;
        this.y += this.vy;
        
        cDown = this.collision(0, 1);
        
        if(!cDown){
            this.vy += .3;
        }
        
        if(this.vy > 0){
            if(cDown){
                this.vy = 0;
                this.y = cDown.y1 - this.hh;
            }
        }else if(this.vy < 0){
            var cUp = this.collision(0, -1);
            if(cUp){
                this.vy = 0;
                this.y = cUp.y2 + this.hh;
            }
        }
        
        this.vx *= .5;
        
        if(this.vx < 0){
            var cLeft = this.collision(-1, 0);
            if(cLeft){
                this.vx = 0;
                this.x = cLeft.x2 + this.hw;
            }
        }else if(this.vx > 0){
            var cRight = this.collision(1, 0);
            if(cRight){
                this.vx = 0;
                this.x = cRight.x1 - this.hw;
            }
        }
        
        
    }
    
    this.draw = function(){
        if(!(this.x+this.hw < view.x || this.x-this.hw > view.x+gl.viewportWidth || this.y+this.hh < view.y || this.y-this.hh > view.y+gl.viewportHeight)){
            mvPushMatrix();
            mat4.translate(mvMatrix, [Math.round(this.x), Math.round(this.y), this.depth]);
            mat4.scale(mvMatrix, [this.renderInfo.texCoord.width*(this.facingRight?1:-1), this.renderInfo.texCoord.height, 1]);
            drawBuffers(this.renderInfo);
            mvPopMatrix();
        }
    }
    
    this.initPlayer = function(){
        this.isPlayer = true;
        
        this.cDown = null;
        this.inSolid = null;
        
        this.ladder = null;
        this.climbing = false;
        this.offLadder = 0;
        
        this.speeds = {jump: 3, walk: 1, climb: 1};
        
        
        this.keyUpdate = function(){
            if(!this.frozen){
                if(this.vy == 0 && this.cDown){
                    if(keys[KEY_JUMP]){
                        this.vy = -this.speeds.jump;
                    }
                }
                if(!this.climbing){
                    this.offLadder++;
                }else{
                    this.offLadder = 0;
                }
                if(this.ladder && this.offLadder > 20){
                    this.offLadder = 0;
                    if(keys[KEY_UP] || keys[KEY_DOWN]){
                        this.climbing = true;
                        this.x = this.ladder.bounds.x1 - (this.ladder.bounds.x1 - this.ladder.bounds.x2)/2;
                    }
                }
                this.renderInfo.texCoord = this.frames.stand;
                if(keys[KEY_LEFT]){
                    this.facingRight = false;
                    if(this.cDown){
                        this.renderInfo.texCoord = this.frames.walk[this.frameTick % this.frames.walk.length];
                    }
                }
                if(keys[KEY_RIGHT]){
                    this.facingRight = true;
                    if(this.cDown){
                        this.renderInfo.texCoord = this.frames.walk[this.frameTick % this.frames.walk.length];
                    }
                }
                if(this.vy > 0 || this.climbing){
                    this.renderInfo.texCoord = this.frames.fall;
                }else if(this.vy < 0){
                    this.renderInfo.texCoord = this.frames.jump;
                }
                if(keys[KEY_SHOOT]){
                    if(this.shootCooldown == -1){
                        this.shootCooldown = 30;
                        this.renderInfo.texCoord = this.frames.shoot;
                        this.frozen = true;
                        this.freezeTime = 15;
                    }
                }
                if(this.climbing){
                    if(keys[KEY_UP]){
                        this.vy = -this.speeds.climb;
                    }
                    if(keys[KEY_DOWN]){
                        this.vy = this.speeds.climb;
                    }
                    if(keys[KEY_JUMP] && !this.inSolid && this.climbing && !lastKeys[KEY_JUMP]){
                        this.climbing = false;
                        this.vy = -this.speeds.jump;
                    }
                }else{
                    if(keys[KEY_LEFT]){
                        this.vx = -this.speeds.walk;
                    }
                    if(keys[KEY_RIGHT]){
                        this.vx = this.speeds.walk;
                    }
                }
            }
        }
        
        this.update = function(){
            
            this.frameAndHealthUpdate();
            
            if(this.shootCooldown == 28){
                projectileList.push(new Projectile(this.x, this.y-3, {x: this.facingRight?40:-40, y: 0}, 30, 1000, false, {vertex: bufferVertexSquare, color: bufferColorSquareWhite, texCoord: bufferTextureCoord.projectile.whiteLine, texture: textureProjectiles}));
            }
            
            this.keyUpdate();
        
            this.y += this.vy;

            this.cDown = this.collision(0, 1);
            this.inSolid = this.collision(0, 0);

            this.ladder = this.collisionWithLadder(0, 0);

            if(!this.cDown && !(this.ladder && this.climbing)){
                this.vy += .3;
            }

            if(this.climbing && !this.ladder){
                this.climbing = false;
                this.vx = 0;
                this.vy = 0;
            }

            if(!this.climbing){

                if(this.vy > 0){
                    if(this.cDown){
                        this.vy = 0;
                        this.y = this.cDown.y1 - this.hh;
                    }
                }else if(this.vy < 0){
                    var cUp = this.collision(0, -1);
                    if(cUp){
                        this.vy = 0;
                        this.y = cUp.y2 + this.hh;
                    }
                }

            }else{
                this.vy *= .5;
            }

            if(!this.climbing){

                this.x += this.vx;

                if(this.vx < 0){
                    var cLeft = this.collision(-1, 0);
                    if(cLeft){
                        this.vx = 0;
                        this.x = cLeft.x2 + this.hw;
                    }
                }else if(this.vx > 0){
                    var cRight = this.collision(1, 0);
                    if(cRight){
                        this.vx = 0;
                        this.x = cRight.x1 - this.hw;
                    }
                }

            }
            
            this.vx *= .8;
        }
    }
    
    this.initEnemy = function(){
        this.isEnemy = true;
    
        this.die = function(){
            this.tick = -1;
            this.frameTick = 0;
            this.frameSpeed = 15;
        }
        
        this.aiUpdate = function(){
            var xDif = player.x - this.x;
            var yDif = player.y - this.y;
            
            if(!this.frozen){
            
                this.renderInfo.texCoord = this.frames.stand;
                if(Math.abs(yDif) < 30){
                    if(xDif > 10){
                        this.facingRight = true;
                        this.vx = this.speeds.walk;
                        this.renderInfo.texCoord = this.frames.walk[this.frameTick % this.frames.walk.length];
                    }else if(xDif < -10){
                        this.facingRight = false;
                        this.vx = -this.speeds.walk;
                        this.renderInfo.texCoord = this.frames.walk[this.frameTick % this.frames.walk.length];
                    }else{
                        if(this.shootCooldown == -1){
                            this.shootCooldown = 60;
                            this.frameSpeed = 5;
                            this.tick = 0;
                            this.frameTick = 0;
                            this.frozen = true;
                            this.freezeTime = 30;
                        }
                    }
                }

            }
            
        }
        
        this.superUpdate = this.update;
        this.update = function(){
            
            this.superUpdate();
            
            if(this.shootCooldown >= 45){
                this.renderInfo.texCoord = this.frames.attack[this.frameTick % this.frames.attack.length];
            }else if(this.shootCooldown == 44){
                this.frameSpeed = 10;
                this.renderInfo.texCoord = this.frames.stand;
            }else if(this.shootCooldown == 30){
                projectileList.push(new Projectile(this.x, this.y, {x: this.facingRight?10:-10, y: 0}, 1, 1, true, null));
            }
            
            if(!this.dead && !this.frozen){
                this.aiUpdate();
            }else if(this.dead){
                this.renderInfo.texCoord = this.frames.death[this.frameTick % this.frames.death.length];
                if(this.frameTick >= this.frames.death.length){
                    this.remove = true;
                }
            }
            console.log(this);
        }
    }
}

var Projectile = function(x, y, speed, life, power, hostile, renderInfo){
    this.x = x;
    this.y = y;
    this.lastX = x;
    this.lastY = y;
    this.depth = 0;
    this.vx = speed.x;
    this.vy = speed.y;
    this.life = life;
    this.power = power;
    this.hostile = hostile;
    this.pierce = 0;
    this.renderInfo = renderInfo;
    this.collisionFrameCount = Math.max(Math.abs(speed.x), Math.abs(speed.y))/4;
    
    this.collision = function(){
        var myBounds = {x1: Math.min(this.x, this.lastX), y1: Math.min(this.y, this.lastY), x2: Math.max(this.x, this.lastX), y2: Math.max(this.y, this.lastY)};
        for(var i=0;i<level.structures.length;i++){
            var s = level.structures[i];
            if(s.solid){
                if(AABB(s.bounds, myBounds)){
                    return s;
                }
            }
        }
        return null;
    }
    
    this.enemyCollision = function(){
        var myBounds = {x1: Math.min(this.x, this.lastX), y1: Math.min(this.y, this.lastY), x2: Math.max(this.x, this.lastX), y2: Math.max(this.y, this.lastY)};
        var b = null;
        for(var i=0;i<actorList.length;i++){
            a = actorList[i];
            if((this.hostile?a.isPlayer:a.isEnemy) && !a.dead){
                if(AABB({x1: a.x-a.hw, y1: a.y-a.hh, x2: a.x+a.hw, y2: a.y+a.hh}, myBounds)){
                    b = b?((Math.abs(a.x-this.lastX)+Math.abs(a.y-this.lastY) < Math.abs(b.x-this.lastX)+Math.abs(b.y-this.lastY))?a:b ):a;
                }
            }
        }
        return b;
    }
    
    this.update = function(){
        
        this.lastX = this.x;
        this.lastY = this.y;
        this.x += this.vx;
        this.y += this.vy;
        var c = this.collision();
        var ec = this.enemyCollision();
        if(ec){
            ec.hp -= this.power;
            if(this.pierce > 0){
                this.pierce--;
            }else{
                this.remove = true;
            }
        }
        if(c){
            this.remove = true;
        }
        
        if(this.life <= 0){
            this.remove = true;
        }else{
            this.life--;
        }
    }
    
    this.draw = function(){
        if(this.renderInfo){
            mvPushMatrix();
            mat4.translate(mvMatrix, [Math.round(this.x), Math.round(this.y), this.depth]);
            mat4.scale(mvMatrix, [this.renderInfo.texCoord.width*(this.vx>0?1:-1), this.renderInfo.texCoord.height, 1]);
            drawBuffers(this.renderInfo);
            mvPopMatrix();
        }
    }
}

var KEY_UP = 87;//W
var KEY_DOWN = 83;//S
var KEY_LEFT = 65;//A
var KEY_RIGHT = 68;//D
var KEY_JUMP = 32;//Space
var KEY_SHOOT = 16;//Left Shift
var KEY_DEBUG_SPAWN_ENEMY = 85;//U

var fps = 60;
var tick = 0;

var zoom = 1;
var bg = {r: 0, g: 0, b: 0};

var gl;
var shaderProgram;

var mvMatrixStack = [];

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var textureActors;
var textureProjectiles;
var textureLevels;

var bufferVertexSquare;
var bufferColorSquareWhite;
var bufferTextureCoord;

var view = {x: 0, y: 0};

var player;
var actorList = [];
var projectileList = [];

var level = {};


var keysTemp = [];
var keys = [];
var lastKeys = [];

