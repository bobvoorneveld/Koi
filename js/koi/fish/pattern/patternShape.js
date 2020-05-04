/**
 * A fish shape which will be superimposed over a pattern
 * @param {Number} centerPower A power value that shifts the center of the fish thickness
 * @constructor
 */
const PatternShape = function(centerPower) {
    this.centerPower = centerPower;
};

PatternShape.prototype.LIGHT_POWER = 0.25;

PatternShape.prototype.SHADER_VERTEX = `#version 100
attribute vec2 position;
attribute vec2 uv;

varying mediump vec2 iUv;

void main() {
  iUv = uv;
  
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

PatternShape.prototype.SHADER_FRAGMENT = `#version 100
uniform mediump float centerPower;
uniform mediump float lightPower;

varying mediump vec2 iUv;

void main() {
  mediump float radius = abs(iUv.y - 0.5);
  mediump float edge = 0.5 * cos(3.141592 * (pow(iUv.x, centerPower) - 0.5));
  mediump float lightness = pow(max(0.0, 1.0 - radius / edge), lightPower);
  
  if (radius > edge)
    gl_FragColor = vec4(0.0);
  else
    gl_FragColor = vec4(vec3(lightness), 1.0);
}
`;

/**
 * Configure this pattern to a shader
 * @param {WebGLRenderingContext} gl A webGL context
 * @param {Shader} program A shader program created from this patterns' shaders
 */
PatternShape.prototype.configure = function(gl, program) {
    gl.uniform1f(program.uCenterPower, this.centerPower);
    gl.uniform1f(program.uLightPower, this.LIGHT_POWER);
};

/**
 * Create the shader for this pattern
 * @param {WebGLRenderingContext} gl A webGL context
 * @returns {Shader} The shader program
 */
PatternShape.prototype.createShader = function(gl) {
    return new Shader(
        gl,
        this.SHADER_VERTEX,
        this.SHADER_FRAGMENT,
        ["centerPower", "lightPower"],
        ["position", "uv"]);
};