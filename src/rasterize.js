function WebGL(canvas) {
    this.canvas = canvas;
}

WebGL.prototype.setup = function() {
    this.gl = this.canvas.getContext("webgl");
    try {
        if(this.gl == null) {
            throw "Unable to create webgl context!";
        } else {
            this.gl.clearColor(0.52, 0.80, 0.92, 1.0);
            this.gl.clearDepth(1.0);
            this.gl.enable(this.gl.DEPTH_TEST);
            return true;
        }
    } catch(e) {
        console.log(e);
        return false;
    }
}

WebGL.prototype.loadShaders = function() {
    this.shaderManager = new ShaderManager(this.gl);
    this.shaderManager.loadShader("simple");
    this.shaderManager.loadShader("noise");
    this.shaderManager.useShader("simple");
    return true;
}

function main() {
    var canvas = document.getElementById("viewport");
    var webgl = new WebGL(canvas);
    if(webgl.setup() && webgl.loadShaders()) {
        var game = new MissileCommand(webgl, canvas.width, canvas.height);
        document.onkeydown = game.keyDown.bind(game);
        canvas.onmousedown = game.mouseDown.bind(game);
        game.gameLoop();
    }
}