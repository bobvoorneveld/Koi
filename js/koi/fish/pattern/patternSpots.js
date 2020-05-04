/**
 * A coloured spots pattern
 * @param {Number} scale The noise scale
 * @param {Color} color The spot color
 * @param {Vector3} anchor The noise sample position
 * @param {Vector3} x The noise sample X direction
 * @constructor
 */
const PatternSpots = function(scale, color, anchor, x) {
    this.scale = scale / Atlas.prototype.RESOLUTION;
    this.color = color;
    this.anchor = anchor;
    this.x = x;
};

PatternSpots.prototype.UP = new Vector3(0, 1, 0);

PatternSpots.prototype.SHADER_CUBIC_NOISE = `
mediump float random(mediump vec3 x) {
  return fract(sin(x.x + x.y * 211.081 + x.z * 937.016) * 991.012);
}

mediump float interpolate(mediump float a, mediump float b, mediump float c, mediump float d, mediump float x) {
  mediump float p = (d - c) - (a - b);

  return x * (x * (x * p + ((a - b) - p)) + (c - a)) + b;
}

mediump float sampleX(mediump vec3 at) {
  mediump float floored = floor(at.x);

  return interpolate(
      random(vec3(floored - 1.0, at.yz)),
      random(vec3(floored, at.yz)),
      random(vec3(floored + 1.0, at.yz)),
      random(vec3(floored + 2.0, at.yz)),
  at.x - floored) * 0.5 + 0.25;
}

mediump float sampleY(mediump vec3 at) {
  mediump float floored = floor(at.y);

  return interpolate(
      sampleX(vec3(at.x, floored - 1.0, at.z)),
      sampleX(vec3(at.x, floored, at.z)),
      sampleX(vec3(at.x, floored + 1.0, at.z)),
      sampleX(vec3(at.x, floored + 2.0, at.z)),
      at.y - floored);
}

mediump float cubicNoise(mediump vec3 at) {
  mediump float floored = floor(at.z);

  return interpolate(
      sampleY(vec3(at.xy, floored - 1.0)),
      sampleY(vec3(at.xy, floored)),
      sampleY(vec3(at.xy, floored + 1.0)),
      sampleY(vec3(at.xy, floored + 2.0)),
      at.z - floored);
}
`;

PatternSpots.prototype.SHADER_VERTEX = `#version 100
attribute vec2 position;
attribute vec2 uv;

varying mediump vec2 iUv;

void main() {
  iUv = uv;

  gl_Position = vec4(position, 0.0, 1.0);
}
`;

PatternSpots.prototype.SHADER_FRAGMENT = `#version 100
` + PatternSpots.prototype.SHADER_CUBIC_NOISE + `
uniform mediump float scale;
uniform mediump vec2 size;
uniform lowp vec3 color;
uniform mediump vec3 anchor;
uniform mediump mat3 rotate;

varying mediump vec2 iUv;

void main() {
  mediump vec2 at = size * (iUv - vec2(0.5)) * scale;
  mediump float noise = cubicNoise(anchor + vec3(at, 0.0) * rotate);

  if (noise < 0.55)
    discard;
    
  gl_FragColor = vec4(color, 1.0);
}`;

/**
 * Get the z direction vector, which depends on the X direction vector
 * @returns {Vector3} The Z direction vector
 */
PatternSpots.prototype.getZ = function() {
    return this.x.cross(this.UP).normalize();
};

/**
 * Get the Y direction vector, which depends on the Z direction vector
 * @param {Vector3} z The Z direction vector
 * @returns {Vector3} The Y direction vector
 */
PatternSpots.prototype.getY = function(z) {
    return this.x.cross(z);
};

/**
 * Configure this pattern to a shader
 * @param {WebGLRenderingContext} gl A webGL context
 * @param {Shader} program A shader program created from this patterns' shaders
 */
PatternSpots.prototype.configure = function(gl, program) {
    const z = this.getZ();
    const y = this.getY(z);

    gl.uniform1f(program.uScale, this.scale);
    gl.uniform2f(program.uSize, Atlas.prototype.RESOLUTION * Atlas.prototype.RATIO, Atlas.prototype.RESOLUTION);
    gl.uniform3f(program.uColor, this.color.r, this.color.g, this.color.b);
    gl.uniform3f(program.uAnchor, this.anchor.x, this.anchor.y, this.anchor.z);
    gl.uniformMatrix3fv(
        program.uRotate,
        false,
        [
            this.x.x, this.x.y, this.x.z,
            y.x, y.y, y.z,
            z.x, z.y, z.z
        ]);
};

/**
 * Create the shader for this pattern
 * @param {WebGLRenderingContext} gl A webGL context
 * @returns {Shader} The shader program
 */
PatternSpots.prototype.createShader = function(gl) {
    return new Shader(
        gl,
        this.SHADER_VERTEX,
        this.SHADER_FRAGMENT,
        ["scale", "size", "color", "anchor", "rotate"],
        ["position", "uv"]);
};