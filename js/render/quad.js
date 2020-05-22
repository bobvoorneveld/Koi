/**
 * A full screen quad renderer
 * @param {WebGLRenderingContext} gl A WebGL context
 * @constructor
 */
const Quad = function(gl) {
    this.gl = gl;
    this.buffer = gl.createBuffer();
    this.program = new Shader(
        this.gl,
        this.SHADER_VERTEX,
        this.SHADER_FRAGMENT,
        [],
        ["position"]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
};

Quad.prototype.SHADER_VERTEX = `#version 100
attribute vec2 position;

varying vec2 iUv;

void main() {
  iUv = position * 0.5 + 0.5;
  
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

Quad.prototype.SHADER_FRAGMENT = `#version 100
uniform sampler2D source;

varying mediump vec2 iUv;

void main() {
  gl_FragColor = texture2D(source, iUv);
}
`;

/**
 * Render a fullscreen quad of the currently bound texture 0
 */
Quad.prototype.render = function() {
    this.program.use();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    this.gl.enableVertexAttribArray(this.program.aPosition);
    this.gl.vertexAttribPointer(this.program.aPosition, 2, this.gl.FLOAT, false, 8, 0);

    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
};

/**
 * Free the quad renderer
 */
Quad.prototype.free = function() {
    this.program.free();

    this.gl.deleteBuffer(this.buffer);
};