function Terrain(objId, gl, program) {
    this.objId = objId;
    this.gl = gl;
    this.program = program;
    //this.vertices =  [[-100, 0, -2], [0, 0.1, 0.03], [100, 0, -2]];
    this.vertices =  [
        //[-1, 0, 0], [-1, 0.1, 0], [1, 0.1, 0]
        [-2, 0, 0.25], [0, 0, -1], [2, 0, 0.25]
    ];
    this.skyVertices = [
        [-2, -2, 1], [-2, 2, 1], [2, 2, 1],
        [-2, -2, 1], [2, 2, 1], [2, -2, 1]
    ];
    this.normals = [
        [0, 1, 0],[0, 1, 0],[0, 1, 0]
    ];
    this.skyNormals = [
        [0, 0, -1], [0, 0, -1], [0, 0, -1],
        [0, 0, -1], [0, 0, -1], [0, 0, -1]
    ];
    this.uvs = [
        [0, 0], [0.5, 1], [1, 0]
    ];
    this.skyUvs = [
        [0, 0], [0, 1], [1, 1],
        [0, 0], [1, 1], [1, 0]
    ];
    this.triangles = [
        [0,1,2]
    ];
    this.skyTriangles = [
        [0, 1, 2], [3, 4, 5]
    ]
    this.material = {
        ambient: [0.1, 0.1, 0.1],
        diffuse: [0.1, 0.6, 0.1],
        specular: [0.3, 0.3, 0.3],
        n: 11
    };
    this.transform = {
        right: vec3.fromValues(1, 0, 0),
        up: vec3.fromValues(0, 1, 0),
        centroid: vec3.fromValues(0, 0, 0),
        scale: vec3.fromValues(1, 1, 1),
        offset: vec3.fromValues(0, 0, 0)
    }
    this.vPosAttribLoc = gl.getAttribLocation(this.program, "aVertexPosition");
    gl.enableVertexAttribArray(this.vPosAttribLoc);
    this.vNormAttribLoc = gl.getAttribLocation(this.program, "aVertexNormal");
    gl.enableVertexAttribArray(this.vNormAttribLoc);
    this.vUVAttribLoc = gl.getAttribLocation(this.program, "aVertexUV");
    gl.enableVertexAttribArray(this.vUVAttribLoc);
    this.texture = this.setupTexture("https://aakshayy.github.io/atari-missile-command/images/terrain.jpg");
    this.texture2 = this.setupTexture("https://aakshayy.github.io/atari-missile-command/images/sky.jpg");
    this.init();
}

Terrain.prototype.init = function() {
    var gl = this.gl;
    this.glvertices = this.flatten(this.vertices);
    this.glnormals = this.flatten(this.normals);
    this.gltriangles = this.flatten(this.triangles);
    this.glUVs = this.flatten(this.uvs);
    this.glvertices2 = this.flatten(this.skyVertices);
    this.glnormals2 = this.flatten(this.skyNormals);
    this.gltriangles2 = this.flatten(this.skyTriangles);
    this.glUVs2 = this.flatten(this.skyUvs);
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glvertices), gl.STATIC_DRAW);
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glnormals), gl.STATIC_DRAW);
    this.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glUVs), gl.STATIC_DRAW);
    this.triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.gltriangles), gl.STATIC_DRAW);
    this.vertexBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glvertices2), gl.STATIC_DRAW);
    this.normalBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glnormals2), gl.STATIC_DRAW);
    this.uvBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glUVs2), gl.STATIC_DRAW);
    this.triangleBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer2);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.gltriangles2), gl.STATIC_DRAW);
}

Terrain.prototype.flatten = function(matrix) {
    var array = [];
    for(var i = 0; i < matrix.length; i++) {
        for(var j = 0; j < matrix[i].length; j++) {
            array.push(matrix[i][j]);
        }
    }
    return array;
}

Terrain.prototype.render = function(modelMatrix, modelViewProjectionMatrix) {
    var gl = this.gl;
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "upvmMatrix"), false, modelViewProjectionMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "umMatrix"), false, modelMatrix);
        
    gl.uniform3fv(gl.getUniformLocation(this.program, "uAmbient"), this.material.ambient);
    gl.uniform3fv(gl.getUniformLocation(this.program, "uDiffuse"), this.material.diffuse);
    gl.uniform3fv(gl.getUniformLocation(this.program, "uSpecular"), this.material.specular);
    gl.uniform1f(gl.getUniformLocation(this.program, "uShininess"), this.material.n);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(gl.getUniformLocation(this.program, "uTexture"), 0);
            
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.vPosAttribLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(this.vNormAttribLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(this.vUVAttribLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer);
    gl.drawElements(gl.TRIANGLES, this.triangles.length * 3, gl.UNSIGNED_SHORT, 0);
    

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture2);
    gl.uniform1i(gl.getUniformLocation(this.program, "uTexture"), 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer2);
    gl.vertexAttribPointer(this.vPosAttribLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer2);
    gl.vertexAttribPointer(this.vNormAttribLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer2);
    gl.vertexAttribPointer(this.vUVAttribLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer2);
    gl.drawElements(gl.TRIANGLES, this.skyTriangles.length * 3, gl.UNSIGNED_SHORT, 0);
}

Terrain.prototype.update = function() {
}

Terrain.prototype.shouldDelete = function() {
    return false;
}

Terrain.prototype.setupTexture = function(textureSource) {
    var gl = this.gl;
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    gl.bindTexture(gl.TEXTURE_2D, null);

    //var texture = this.texture;
    var image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if(isPowerOfTwo(this.width) && isPowerOfTwo(this.height)) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);         
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    image.crossOrigin = "Anonymous";
    image.src = textureSource;
    return texture;
}

function isPowerOfTwo(val) {
    return (val & (val-1)) == 0;
}