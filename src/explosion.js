function Explosion(objId, gl, program, position) {
    this.objId = objId;
    this.gl = gl;
    this.type = "explosion";
    this.program = program;
    this.radius = 0.5;
    var lats = 20, longs = 20;
    this.vertices = [];
    this.normals = [];
    this.triangles = [];
    this.type = "explosion";
    
    for(var latNumber = 0; latNumber <= lats; latNumber++) {
        for(var longNumber = 0; longNumber <= longs; longNumber++) {
            var theta = latNumber * Math.PI / lats;
            var phi = longNumber * 2 * Math.PI / longs;
            var sinTheta = Math.sin(theta);
            var sinPhi = Math.sin(phi);
            var cosTheta = Math.cos(theta);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;

            this.vertices.push([this.radius * x, this.radius * y, this.radius * z]);
            this.normals.push([x, y, z]);
        }
    }

    for(var latNumber = 0; latNumber < lats; latNumber++) {
        for(var longNumber = 0; longNumber < longs; longNumber++) {
            var first = (latNumber * (longs + 1)) + longNumber;
            var second = first + longs + 1;
            this.triangles.push([first, second, first + 1]);
            this.triangles.push([second, second + 1, first + 1]);
        }
    }

    this.material = {
        ambient: [0.6, 0.6, 0.1],
        diffuse: [0.6, 0.6, 0.1],
        specular: [0.2, 0.2, 0.2],
        n: 11
    };
    this.transform = {
        right: vec3.fromValues(1, 0, 0),
        up: vec3.fromValues(0, 1, 0),
        centroid: vec3.fromValues(0, 0, 0),
        scale: vec3.fromValues(0.01, 0.01, 0.01),
        offset: position
    }

    this.vPosAttribLoc = gl.getAttribLocation(this.program, "aVertexPosition");
    gl.enableVertexAttribArray(this.vPosAttribLoc);
    this.vNormAttribLoc = gl.getAttribLocation(this.program, "aVertexNormal");
    gl.enableVertexAttribArray(this.vNormAttribLoc);
    this.init();
    this.startTime = new Date();
    this.count = 0;
    this.exploded = false;
}

Explosion.prototype.init = function() {
    var gl = this.gl;
    this.glvertices = this.flatten(this.vertices);
    this.glnormals = this.flatten(this.normals);
    this.gltriangles = this.flatten(this.triangles);
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glvertices), gl.STATIC_DRAW);
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glnormals), gl.STATIC_DRAW);
    this.triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.gltriangles), gl.STATIC_DRAW);
}

Explosion.prototype.flatten = function(matrix) {
    var array = [];
    for(var i = 0; i < matrix.length; i++) {
        for(var j = 0; j < matrix[i].length; j++) {
            array.push(matrix[i][j]);
        }
    }
    return array;
}

Explosion.prototype.render = function(modelMatrix, modelViewProjectionMatrix) {
    var gl = this.gl;
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "upvmMatrix"), false, modelViewProjectionMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "umMatrix"), false, modelMatrix);

    var x = 100;
    var y = 100;
    var dt = (new Date() - this.startTime) / 100;
    gl.uniform2fv(gl.getUniformLocation(this.program, "uResolution"), [x, y]);
    gl.uniform1f(gl.getUniformLocation(this.program, "uTime"), dt);

    gl.uniform3fv(gl.getUniformLocation(this.program, "uAmbient"), this.material.ambient);
    gl.uniform3fv(gl.getUniformLocation(this.program, "uDiffuse"), this.material.diffuse);
    gl.uniform3fv(gl.getUniformLocation(this.program, "uSpecular"), this.material.specular);
    gl.uniform1f(gl.getUniformLocation(this.program, "uShininess"), this.material.n);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.vPosAttribLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(this.vNormAttribLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer);
    gl.drawElements(gl.TRIANGLES, this.triangles.length * 3, gl.UNSIGNED_SHORT, 0);
}

Explosion.prototype.update = function() {
    if(this.transform.scale[0] < 0.04)
        vec3.scale(this.transform.scale, this.transform.scale, 1.1);
    else
        this.exploded = true;
}

Explosion.prototype.shouldDelete = function() {
    return this.exploded;
}