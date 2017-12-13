function MissileCommand(webgl, width, height) {
    this.gl = webgl.gl;
    this.shaderManager = webgl.shaderManager;
    this.width = width;
    this.height = height;
    this.init();
}


MissileCommand.prototype.init = function() {
    this.projectionMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    this.eye = vec3.fromValues(0, 0.2, -0.12);

    this.center = vec3.fromValues(0, 0.2, 0);
    this.up = vec3.fromValues(0, 1, 0);
    this.objId = 0;
    this.objects = [];
    this.spawnMissileTimeLeft = 0;
    this.targets = [];
    var simpleShader = this.shaderManager.programs["simple"];
    this.objects.push(new Terrain(this.objId++, this.gl, simpleShader));
    this.batteries = [];
    this.missileCount = 0;
    this.missilesDestroyed = 0;
    this.missilesNeutralized = 0;
    this.maxMissiles = 15;
    this.score = 0;
    for(var i = -1; i < 2; i++) {
        var battery = new Battery(this.objId++, this.gl, simpleShader, i * 4);
        this.batteries.push(battery);
        this.objects.push(battery);
        this.targets.push(battery);
    }
    for(var i = -3; i <= 3; i++) {
        if(i != 0) {
            var city = new City(this.objId++, this.gl, simpleShader, i);
            this.objects.push(city);
            this.targets.push(city);
        }
    }
}


MissileCommand.prototype.gameLoop = function() {
    window.requestAnimationFrame(this.gameLoop.bind(this));
    if(!this.pause && !this.endGame) {
        this.update();
        this.render();
    }
}

MissileCommand.prototype.update = function() {
    if(this.missilesDestroyed == this.maxMissiles) {
        this.showEndGame("Game Over! You Win!");
    }
    else if(this.targets.length == 0)
        this.showEndGame("Game Over! You Lose!");
    if(this.spawnMissileTimeLeft == 0) {
        if(this.missileCount < this.maxMissiles) {
            this.spawnMissile();
            this.spawnMissileTimeLeft = 100;
            this.missileCount ++;
        }
    } else {
        this.spawnMissileTimeLeft--;
    }
    for(var i in this.objects) {
        var obj = this.objects[i];
        obj.update();
    }
    for(var i = 0; i < this.objects.length; i++) {
        if(this.objects[i].type == "explosion") {
            for(var j = 0; j < this.objects.length; j++) {
                if(i == j || this.objects[j].type != "ballistic") continue;
                var radius = this.objects[i].radius * this.objects[i].transform.scale[0];
                if(vec3.distance(this.objects[j].transform.offset, this.objects[i].transform.offset) <= radius) {
                    this.objects[j].neutralized = true;
                    this.missilesNeutralized++;
                    this.score += 5;
                }
            }
        }
    }
    var newExplosions = [];
    for(var i = this.objects.length-1; i >= 0; i--) {
        if(this.objects[i].shouldDelete()) {
            if(this.objects[i].type == "antiballistic")
                newExplosions.push(new Explosion(this.objId++, this.gl, this.shaderManager.programs["noise"], this.objects[i].transform.offset));
            if(this.objects[i].type == "ballistic") {
                this.missilesDestroyed++;
                if(this.objects[i].neutralized != true) {
                    for(var j = 0; j < this.objects.length; j++) {
                        if(this.objects[i].targetObjId == this.objects[j].objId) {
                            this.objects[j].destroyed = true;
                            break;
                        }
                    }
                    for(var j = 0; j < this.targets.length; j++) {
                        if(this.targets[j].objId == this.objects[i].targetObjId) {
                            this.targets.splice(j, 1);
                            break;
                        }
                    }
                    for(var j = 0; j < this.batteries.length; j++) {
                        if(this.batteries[j].objId == this.objects[i].targetObjId) {
                            this.batteries.splice(j, 1);
                            break;
                        }
                    }
                    newExplosions.push(new Explosion(this.objId++, this.gl, this.shaderManager.programs["noise"], this.objects[i].transform.offset));
                    
                }
            }
            this.objects.splice(i, 1);
        }
    }
    this.objects = this.objects.concat(newExplosions);
}

MissileCommand.prototype.spawnMissile = function() {
    var targetIndex = Math.floor(Math.random() * this.targets.length);
    var sourceX = (Math.random() * 0.2) - 0.1;
    var source = vec3.fromValues(sourceX, 0.32, 0);
    var target = vec3.fromValues(this.targets[targetIndex].transform.offset[0], 0.11, 0);
    this.objects.push(new Missile(this.objId++, this.gl, this.shaderManager.programs["simple"], source, target, "ballistic", this.targets[targetIndex].objId));
}


MissileCommand.prototype.transformModel = function(transform) {
    var transformRight = transform.right;
    var transformUp = transform.up;
    var centroid = transform.centroid;
    var scale = transform.scale;
    var offset = transform.offset;

    var modelMatrix = mat4.create();
    var translateToOrigin = mat4.create();
    var translateBackFromOrigin = mat4.create();

    var translation = mat4.create();
    var rotation = mat4.create();
    var scaled = mat4.create();

    var minusCentroid = vec3.create();
    var transformedLookAt = vec3.create();
    vec3.normalize(transformRight, transformRight);
    vec3.normalize(transformUp, transformUp)
    vec3.normalize(transformedLookAt, vec3.cross(transformedLookAt, transformRight, transformUp));
    vec3.negate(minusCentroid, centroid);

    mat4.fromTranslation(translateToOrigin, minusCentroid);
    mat4.fromTranslation(translateBackFromOrigin, centroid);

    mat4.fromTranslation(translation, offset);

    mat4.fromScaling(scaled, scale);

    mat4.set(rotation,
        transformRight[0], transformUp[0], transformedLookAt[0], 0,
        transformRight[1], transformUp[1], transformedLookAt[1], 0,
        transformRight[2], transformUp[2], transformedLookAt[2], 0,
        0, 0, 0, 1);
    
    mat4.multiply(modelMatrix, translateToOrigin, modelMatrix);
    mat4.multiply(modelMatrix, scaled, modelMatrix);
    mat4.multiply(modelMatrix, rotation, modelMatrix);
    mat4.multiply(modelMatrix, translateBackFromOrigin, modelMatrix);
    mat4.multiply(modelMatrix, translation, modelMatrix);
    
    return modelMatrix;
}


MissileCommand.prototype.setUniforms = function(program) {
    var gl = this.gl;
    gl.useProgram(program);
    gl.uniform3fv(gl.getUniformLocation(program, "uEyePosition"), this.eye);
    gl.uniform3fv(gl.getUniformLocation(program, "uLightAmbient"), vec3.fromValues(1, 1, 1));
    gl.uniform3fv(gl.getUniformLocation(program, "uLightDiffuse"), vec3.fromValues(1, 1, 1));
    gl.uniform3fv(gl.getUniformLocation(program, "uLightSpecular"), vec3.fromValues(1, 1, 1));
    gl.uniform3fv(gl.getUniformLocation(program, "uLightPosition"), vec3.fromValues(-1, 1, -1));
}

MissileCommand.prototype.render = function() {
    var gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(this.projectionMatrix, 0.5 * Math.PI, 1.0, 0.01, 10);
    mat4.lookAt(this.viewMatrix, this.eye, this.center, this.up);
    
    var handednessMatrix = mat4.create();
    var viewProjectionMatrix = mat4.create();
    mat4.fromScaling(handednessMatrix, vec3.fromValues(-1, 1, 1));
    mat4.multiply(viewProjectionMatrix, handednessMatrix, this.projectionMatrix);
    mat4.multiply(viewProjectionMatrix, viewProjectionMatrix, this.viewMatrix);
    
    this.setUniforms(this.shaderManager.programs["simple"]);
    this.setUniforms(this.shaderManager.programs["noise"])

    for(var i in this.objects) {
        var obj = this.objects[i];
        var modelMatrix = this.transformModel(obj.transform);
        var modelViewProjectionMatrix = mat4.create();
        mat4.multiply(modelViewProjectionMatrix, viewProjectionMatrix, modelMatrix);
        if(obj.type == "explosion")
            gl.useProgram(this.shaderManager.programs["noise"]);
        else
            gl.useProgram(this.shaderManager.programs["simple"]);
        obj.render(modelMatrix, modelViewProjectionMatrix);
    }
    
    document.getElementById("score").innerText = "Score: " + this.score;
}

MissileCommand.prototype.keyDown = function(e) {
    var lookAt = vec3.create(), right = vec3.create(), direction = vec3.create();
    vec3.normalize(lookAt, vec3.subtract(lookAt, this.center, this.eye));
    vec3.normalize(right, vec3.cross(right, lookAt, this.up));
    var speed = 0.002;
    switch(e.key) {
        case "p": 
            this.pause = !this.pause;
            break;
        // case "a":
        //     vec3.subtract(this.eye, this.eye, vec3.scale(direction, right, -speed));
        //     vec3.subtract(this.center, this.center, vec3.scale(direction, right, -speed));
        //     break;
        // case "d":
        //     vec3.subtract(this.eye, this.eye, vec3.scale(direction, right, speed));
        //     vec3.subtract(this.center, this.center, vec3.scale(direction, right, speed));
        //     break;
        // case "w":
        //     vec3.subtract(this.eye, this.eye, vec3.scale(direction, this.up, -speed));
        //     vec3.subtract(this.center, this.center, vec3.scale(direction, this.up, -speed));
        //     break;
        // case "s":
        //     vec3.subtract(this.eye, this.eye, vec3.scale(direction, this.up, speed));
        //     vec3.subtract(this.center, this.center, vec3.scale(direction, this.up, speed));
        //     break;
        // case "q":
        //     vec3.subtract(this.eye, this.eye, vec3.scale(direction, lookAt, -speed));
        //     vec3.subtract(this.center, this.center, vec3.scale(direction, lookAt, -speed));
        //     break;
        // case "e":
        //     vec3.subtract(this.eye, this.eye, vec3.scale(direction, lookAt, speed));
        //     vec3.subtract(this.center, this.center, vec3.scale(direction, lookAt, speed));
        //     break;
    }
}

MissileCommand.prototype.mouseDown = function(e) {
    if(this.pause)
        return;
    var x = -0.12;
    var y = 0.32;
    var xLeft = -0.12;
    var xRight = 0.12;
    var yTop = 0.32;
    var yBottom = 0.12;
    var x = (e.clientX / this.width) * (xRight - xLeft) + xLeft;
    var bar = 0.84;
    if(e.clientY > this.height * 0.84)
        return;
    var y = (1 - e.clientY / (this.height * 0.84)) * (yTop - yBottom) + yBottom;
    var simpleShader = this.shaderManager.programs["simple"];
    var target = vec3.fromValues(x, y, 0);
    var leastIndex = -1, leastDistance = Number.POSITIVE_INFINITY;
    for(var i = 0; i < this.batteries.length; i++) {
        var distance = vec3.distance(target, this.batteries[i].transform.offset);
        if(distance < leastDistance) {
            leastDistance = distance;
            leastIndex = i;
        }
    }
    var source = this.batteries[leastIndex].transform.offset;
    source = vec3.fromValues(source[0], source[1], source[2]);
    this.objects.push(new Missile(this.objId++, this.gl, simpleShader, source, target, "antiballistic"))
}

MissileCommand.prototype.showEndGame = function(str) {
    this.endGame = true;
    var numCities = this.targets.length - this.batteries.length;
    var numBatteries = this.batteries.length;
    var numMissDest = this.missilesNeutralized;
    console.log("Number of cities left: " + numCities);
    console.log("Number of batteries remaining: " + numBatteries);
    console.log("Number of missiles destroyed: " + numMissDest);
    document.getElementById("textbox").innerText = str;
    var totalScore = (numMissDest * 5 + numCities * 30 + numBatteries * 40);
    this.score = totalScore;
    document.getElementById("scoreTextbox").innerText = ("Your Score: " + totalScore);
}