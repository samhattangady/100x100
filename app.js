const vertex_shader_source = `
    precision mediump float;

    attribute vec2 position;
    attribute vec2 tex_coord;

    uniform float canvas_width;
    uniform float canvas_height;
    uniform sampler2D tex;

    varying vec2 vert_tex_coord;

    void main()
    {
        // float x = position.x / canvas_width;
        // float y = position.y / canvas_height;
        gl_Position = vec4(position.xy, 1.0,  1.0);
        vert_tex_coord = tex_coord;
    }
`;
const fragment_shader_source = `
    precision mediump float;

    varying vec2 vert_tex_coord;

    uniform sampler2D tex;

    void main()
    {
        vec4 alpha = texture2D(tex, vert_tex_coord);
        gl_FragColor = vec4(alpha);
    } 
`;

var gl;
var programInfo;
var buffers;
var texture;
var shaderProgram;
const buffer_data = [
    0.5,  0.5,
    1.0,  1.0,

    -0.5,  0.5,
    0.0,  1.0,

    0.5, -0.5,
    1.0, 0.0,

    -0.5, -0.5,
    0.0, 0.0,
];
main();
window.requestAnimationFrame(draw);

function draw() {
  drawScene(gl, shaderProgram, buffers, texture);
  window.requestAnimationFrame(draw);
}

function main() {
  const canvas = document.querySelector('#glcanvas');
  gl = canvas.getContext('webgl');
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  shaderProgram = initShaderProgram(gl, vertex_shader_source, fragment_shader_source);
  buffers = initBuffers(gl, shaderProgram);
  texture = loadTexture(gl, 'data/jetbrains.png');
}

function initBuffers(gl, shaderProgram) {
  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer_data), gl.STATIC_DRAW);
  const position_location = gl.getAttribLocation(shaderProgram, 'position');
  gl.vertexAttribPointer(position_location, 2, gl.FLOAT, false, 4*4, 0);
  gl.enableVertexAttribArray(position_location);
  const tex_coord_location = gl.getAttribLocation(shaderProgram, 'tex_coord');
  gl.vertexAttribPointer(tex_coord_location, 2, gl.FLOAT, false, 4*4, 2*4);
  gl.enableVertexAttribArray(tex_coord_location);
  return { vertex: vertex_buffer };
}

function drawScene(gl, shaderProgram, buffers, texture) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.BLEND);
  // gl.clearDepth(1.0);
  // gl.enable(gl.DEPTH_TEST);
  // gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Tell WebGL to use our program when drawing
  // gl.viewport(0, 0, 500, 500);
  gl.useProgram(shaderProgram);
  gl.program = shaderProgram;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set the shader uniforms
  // gl.uniform1f(programInfo.uniformLocations.canvas_width, 500);
  // gl.uniform1f(programInfo.uniformLocations.canvas_height, 500);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, 'tex'), 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer_data), gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;
  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}


