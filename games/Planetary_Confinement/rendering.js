
var fragmentShaderSource = `
precision mediump float;

varying vec4 vColor;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uGlobalColor;

void main(void) {
    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)) * vColor * uGlobalColor;
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
    shaderProgram.globalColorUniform = gl.getUniformLocation(shaderProgram, "uGlobalColor");
    
    setGlobalColor(1, 1, 1, 1);
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
    
    var min = getTexCoords(x, y, texW, texH, 0);
    var max = getTexCoords(x+w, y+h, texW, texH, 0);
    
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

function makeSquareColorBuffer(r, g, b, a){
    return createBuffer([[r, g, b, a],  [r, g, b, a],  [r, g, b, a],  [r, g, b, a]]);
}

function getColoredSquare(colorBuffer){
    return {vertex: bufferVertex.square, color: colorBuffer, texCoord: bufferTextureCoord.zeros, texture: textureUi};
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
        
        gl.activeTexture(TEXTURE_INDEX[renderInfo.texture.index]);
        gl.bindTexture(gl.TEXTURE_2D, renderInfo.texture);
        gl.uniform1i(shaderProgram.samplerUniform, renderInfo.texture.index);

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

        gl.activeTexture(TEXTURE_INDEX[renderInfo.texture.index]);
        gl.bindTexture(gl.TEXTURE_2D, renderInfo.texture);
        gl.uniform1i(shaderProgram.samplerUniform, renderInfo.texture.index);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderInfo.index);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, renderInfo.index.numItems, gl.UNSIGNED_SHORT, 0);
        
    }
}

function setGlobalColor(red, green, blue, alpha){
    gl.uniform4f(shaderProgram.globalColorUniform, red, green, blue, alpha);
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
        
        texture.index = nextTextureIndex;
        nextTextureIndex++;
        
        gl.activeTexture(TEXTURE_INDEX[texture.index]);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }
    texture.image.src = path;
    texture.width = 256;
    texture.height = 256;
    return texture;
}
