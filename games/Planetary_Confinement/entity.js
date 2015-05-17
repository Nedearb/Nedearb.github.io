

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


//---- Actor ----//
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
    
    this.frameTick = 0;
    this.frames = frames;
    this.frameSpeed = 10;
    
    this.freezeTime = -1;
    this.attackCooldown = -1;
    
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
        if(tick % this.frameSpeed == 0){
            this.frameTick++;
        }
        
        if(this.hp <= 0){
            if(!this.dead){
                this.die();
            }
            this.dead = true;
        }
        
        if(this.freezeTime > 0){
            this.freezeTime--;
        }else if(this.freezeTime == 0){
            this.freezeTime = -1;
        }
        
        if(this.attackCooldown > 0){
            this.attackCooldown--;
        }else if(this.attackCooldown == 0){
            this.attackCooldown = -1;
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
            mat4.translate(mvMatrix, [this.x, this.y, depths.actors]);
            mat4.scale(mvMatrix, [this.renderInfo.texCoord.width*(this.facingRight?1:-1), this.renderInfo.texCoord.height, 1]);
            drawBuffers(this.renderInfo);
            mvPopMatrix();
            if(this.hp < this.maxHp && this.hp > 0){
                mvPushMatrix();
                mat4.translate(mvMatrix, [this.x, this.y-10, depths.healthBars]);
                mvPushMatrix();
                mat4.scale(mvMatrix, [18, 3, 1]);
                drawBuffers(getColoredSquare(bufferColor.square.gray.p25));
                mvPopMatrix();
                mvPushMatrix();
                mat4.scale(mvMatrix, [16, 1, 1]);
                drawBuffers(getColoredSquare(bufferColor.square.black));
                mvPopMatrix();
                mvPushMatrix();
                var w = (16*(this.hp/this.maxHp));
                mat4.translate(mvMatrix, [(w-16)/2, 0, 0]);
                mat4.scale(mvMatrix, [w, 1, 1]);
                drawBuffers(getColoredSquare(bufferColor.square.red));
                mvPopMatrix();
                mvPopMatrix();
            }
        }
    }
    
    
    //---- Player ----//
    this.initPlayer = function(){
        this.isPlayer = true;
        
        this.cDown = null;
        this.inSolid = null;
        
        this.ladder = null;
        this.climbing = false;
        this.offLadder = 0;
        
        this.speeds = {jump: 3, walk: 1, climb: 1};
        
        
        this.keyUpdate = function(){
            if(this.freezeTime == -1){
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
                    if(this.attackCooldown == -1){
                        this.attackCooldown = 30;
                        this.renderInfo.texCoord = this.frames.shoot;
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
            
            if(this.attackCooldown == 25){
                projectileList.push(new Projectile(this.x, this.y-3, {x: this.facingRight?40:-40, y: 0}, 30, 16, false, null));
                particleList.push(new PinnedParticle(this, (14*(this.facingRight?1:-1)), -2.5, 3, {x: this.facingRight?1:-1, y:1}, {vertex: bufferVertex.square, color: bufferColor.square.white, texCoord: bufferTextureCoord.particle.muzzleFlashSmall, texture: textureParticle}));
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
    
    
    //---- Enemy ----//
    this.initEnemy = function(){
        this.isEnemy = true;
        
        this.attackCooldown = -1;
        
        this.tryAttack = function(){
            if(this.attackCooldown == -1){
                this.attackCooldown = 60;
                this.frameSpeed = 5;
                this.frameTick = 0
                this.freezeTime = 30;
            }
        }
        
        this.auxUpdate = function(){
            if(this.attackCooldown > 45){
                this.renderInfo.texCoord = this.frames.attack[this.frameTick % this.frames.attack.length];
            }else if(this.attackCooldown == 45){
                this.frameSpeed = 10;
                this.renderInfo.texCoord = this.frames.stand;
                
                projectileList.push(new Projectile(this.x, this.y, {x: this.facingRight?10:-10, y: 0}, 1, 1, true, null));
            }
        }
    
        this.die = function(){
            this.frameTick = 0;
            this.frameSpeed = 15;
        }
        
        this.aiUpdate = function(){
            
            if(this.freezeTime == -1){
                
                var xDif = player.x - this.x;
                var yDif = player.y - this.y;
                
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
                        this.tryAttack();
                    }
                }

            }
            
        }
        
        this.superUpdate = this.update;
        this.update = function(){
            
            this.superUpdate();
            
            this.auxUpdate();
            
            if(!this.dead){
                this.aiUpdate();
            }else{
                this.renderInfo.texCoord = this.frames.death[this.frameTick % this.frames.death.length];
                if(this.frameTick >= this.frames.death.length){
                    this.remove = true;
                }
            }
        }
    }
}

//---- PinnedParticle ----//
var PinnedParticle = function(base, xOff, yOff, life, scale, renderInfo){
    this.base = base;
    this.xOff = xOff;
    this.yOff = yOff;
    this.life = life;
    this.scale = scale;
    this.renderInfo = renderInfo;
    
    this.update = function(){
        if(this.life <= 0){
            this.remove = true;
        }else{
            this.life--;
        }
    }
    
    this.draw = function(){
        mvPushMatrix();
        mat4.translate(mvMatrix, [base.x+this.xOff, base.y+this.yOff, depths.particles]);
        mat4.scale(mvMatrix, [scale.x*this.renderInfo.texCoord.width, scale.y*this.renderInfo.texCoord.height, 1]);
        console.log();
        drawBuffers(this.renderInfo);
        mvPopMatrix();
    }
    
}

//---- Particle ----//
var Particle = function(x, y, speed, life, scale, renderInfo){
    this.x = x;
    this.y = y;
    this.vx = speed.x;
    this.vy = speed.y;
    this.life = life;
    this.scale = scale;
    this.renderInfo = renderInfo;
    
    this.update = function(){
        this.x += this.vx;
        this.y += this.vy;
        
        if(this.life <= 0){
            this.remove = true;
        }else{
            this.life--;
        }
    }
    
    this.draw = function(){
        mvPushMatrix();
        mat4.translate(mvMatrix, [this.x, this.y, depths.particles]);
        mat4.scale(mvMatrix, [scale.x*this.renderInfo.texCoord.width, scale.y*this.renderInfo.texCoord.height, 1]);
        console.log();
        drawBuffers(this.renderInfo);
        mvPopMatrix();
    }
    
}

//---- Projectile ----//
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
            particleList.push(new Particle(ec.x, ec.y, {x: (Math.random()-.5)*1, y: (Math.random()-.5)*1}, 10, {x:1, y:1}, {vertex: bufferVertex.square, color: bufferColor.square.white, texCoord: bufferTextureCoord.particle.spark1, texture: textureParticle}));
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
            mat4.translate(mvMatrix, [this.x, this.y, depths.projectiles]);
            mat4.scale(mvMatrix, [this.renderInfo.texCoord.width*(this.vx>0?1:-1), this.renderInfo.texCoord.height, 1]);
            drawBuffers(this.renderInfo);
            mvPopMatrix();
        }
    }
}
