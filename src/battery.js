function Battery(objId, gl, program, index) {
    this.objId = objId;
    this.gl = gl;
    this.program = program;
    this.vertices = [
        [1, 1, 1], [-1, 1, 1], [-1, -1, 1], [1, -1, 1], //back
        [1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, -1], //right
        [1, 1, 1], [1, 1, -1], [-1, 1, -1], [-1, 1, 1], //top
        [-1, 1, 1], [-1, 1, -1], [-1, -1, -1], [-1, -1, 1], //left
        [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], //bottom
        [1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1], //front
    ]
    this.normals = [
        [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1],
        [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
        [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
        [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
        [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0],
        [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]
    ];
    this.uvs = [
        [0, 1], [1, 1], [1, 0], [0, 0],
        [1, 1], [1, 0], [0, 0], [1, 0],
        [1, 1], [1, 0], [0, 0], [0, 1],
        [0, 1], [1, 1], [1, 0], [0, 0],
        [0, 0], [1, 0], [1, 1], [0, 1],
        [1, 0], [0, 0], [0, 1], [1, 1],
    ];
    this.triangles = [
        [0, 1, 2], [0, 2, 3], //back
        [4, 5, 6], [4, 6, 7], //right
        [8, 9, 10], [8, 10, 11], //top
        [12, 13, 14], [12, 14, 15], //left
        [16, 17, 18], [16, 18, 19], //bottom
        [20, 21, 22], [20, 22, 23] //front
    ];
    this.material = {
        ambient: [0.1, 0.1, 0.1],
        diffuse: [0.5, 0.5, 0.5],
        specular: [0.1, 0.1, 0.1],
        n: 11
    };
    this.transform = {
        right: vec3.fromValues(1, 0, 0),
        up: vec3.fromValues(0, 1, 0),
        centroid: vec3.fromValues(0, 0, 0),
        scale: vec3.fromValues(0.01, 0.01, 0.005),
        offset: vec3.fromValues(0 + index * 0.025, 0.11, 0)
    }
    this.vPosAttribLoc = gl.getAttribLocation(this.program, "aVertexPosition");
    gl.enableVertexAttribArray(this.vPosAttribLoc);
    this.vNormAttribLoc = gl.getAttribLocation(this.program, "aVertexNormal");
    gl.enableVertexAttribArray(this.vNormAttribLoc);
    this.vUVAttribLoc = gl.getAttribLocation(this.program, "aVertexUV");
    gl.enableVertexAttribArray(this.vUVAttribLoc);
    this.setupTexture("https://aakshayy.github.io/atari-missile-command/images/stripe2.png");
    this.init();
}

Battery.prototype.init = function() {
    var gl = this.gl;
    this.glvertices = this.flatten(this.vertices);
    this.glnormals = this.flatten(this.normals);
    this.gltriangles = this.flatten(this.triangles);
    this.glUVs = this.flatten(this.uvs);
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
}

Battery.prototype.flatten = function(matrix) {
    var array = [];
    for(var i = 0; i < matrix.length; i++) {
        for(var j = 0; j < matrix[i].length; j++) {
            array.push(matrix[i][j]);
        }
    }
    return array;
}

Battery.prototype.render = function(modelMatrix, modelViewProjectionMatrix) {
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
}

Battery.prototype.update = function() {
}

Battery.prototype.shouldDelete = function() {
    return this.destroyed == true;
}

Battery.prototype.setupTexture = function(textureSource) {
    var gl = this.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    gl.bindTexture(gl.TEXTURE_2D, null);

    var texture = this.texture;
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
}