function ShaderManager(gl) {
    this.gl = gl;
    this.sources = {
        "simple_vs": simple_vertex,
        "simple_fs": simple_fragment,
        "noise_vs": noise_vertex,
        "noise_fs": noise_fragment
    }
    this.programs = {};
}

ShaderManager.prototype.loadShader = function(id) {
    var gl = this.gl; 
    var program = gl.createProgram();
    gl.attachShader(program, this.compileShader(id + "_vs", gl.VERTEX_SHADER));
    gl.attachShader(program, this.compileShader(id + "_fs", gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw("Error linking shaders: " + gl.getProgramInfoLog(program));
    }
    this.programs[id] = program;
}

ShaderManager.prototype.compileShader = function(id, shaderType) {
    var gl = this.gl;
    var shader = gl.createShader(shaderType);
    var shaderSource = this.sources[id];
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw ("Failed to compile shader: " + gl.getShaderInfoLog(shader));
    }
    return shader;
}

ShaderManager.prototype.useShader = function(id) {
    if(this.programs[id]) {
        this.gl.useProgram(this.programs[id]);
    }
}