var gl;
var buffer;
var font_texture;
var render_texture;
var render_frame_buffer;
var flow_texture;
var flow_frame_buffer;
var shaderProgram;
var flow_shader_program;

const buffer_data = [
    1.0,  1.0,
    1.0,  1.0,

    -1.0,  1.0,
    0.0,  1.0,

    1.0, -1.0,
    1.0, 0.0,

    -1.0, -1.0,
    0.0, 0.0,
];
main();
window.requestAnimationFrame(draw);

function draw() {
  generate_flow_data();
  drawScene();
  window.requestAnimationFrame(draw);
}

function main() {
  const canvas = document.querySelector('#glcanvas');
  gl = canvas.getContext('webgl2');
  if (!gl) {
    console.log('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  shaderProgram = initShaderProgram(gl, vertex_shader_source, fragment_shader_source);
  buffer = initBuffer();
  init_render_texture();
  init_flow_texture();
  init_flow_shader_program();
  generate_flow_data();
  font_texture = loadTexture('data/jetbrains.png');
}

function initBuffer() {
  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer_data), gl.STATIC_DRAW);
  const position_location = gl.getAttribLocation(shaderProgram, 'position');
  gl.vertexAttribPointer(position_location, 2, gl.FLOAT, false, 4*4, 0);
  gl.enableVertexAttribArray(position_location);
  const tex_coord_location = gl.getAttribLocation(shaderProgram, 'tex_coord');
  gl.vertexAttribPointer(tex_coord_location, 2, gl.FLOAT, false, 4*4, 2*4);
  gl.enableVertexAttribArray(tex_coord_location);
  return vertex_buffer;
}

function init_render_texture() {
    // create to render to
    const targetTextureWidth = 500;
    const targetTextureHeight = 500;
    render_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, render_texture);
    {
      // define size and format of level 0
      const level = 0;
      const internalFormat = gl.RGBA;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      const data = null;
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    targetTextureWidth, targetTextureHeight, border,
                    format, type, data);
      // set the filtering so we don't need mips
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    // Create and bind the framebuffer
    render_frame_buffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, render_frame_buffer);
    // attach the texture as the first color attachment
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, render_texture, 0);
}

function init_flow_texture() {
    // create to render to
    const targetTextureWidth = 500;
    const targetTextureHeight = 500;
    const targetTextureDepth = 32;
    flow_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_3D, flow_texture);
    {
      // define size and format of level 0
      const level = 0;
      const internalFormat = gl.RGBA;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      gl.texImage3D(gl.TEXTURE_3D, level, internalFormat,
                    targetTextureWidth, targetTextureHeight, targetTextureDepth,
                    border, format, type, null);
      // set the filtering so we don't need mips
      // TODO (28 Apr 2022 sam): See what these should be...
      // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, 32);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    // Create and bind the framebuffer
    flow_frame_buffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, flow_frame_buffer);
    // attach the texture as the first color attachment
    gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, flow_texture, 0, 0);
}


function drawScene() {
     {
//      gl.bindFramebuffer(gl.FRAMEBUFFER, render_frame_buffer);
//    gl.clearColor(1.0, 0.0, 0.0, 1.0);
//    gl.enable(gl.BLEND);
//    // gl.clearDepth(1.0);
//    // gl.enable(gl.DEPTH_TEST);
//    // gl.depthFunc(gl.LEQUAL);
//    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//    // Tell WebGL to use our program when drawing
//    // gl.viewport(0, 0, 500, 500);
//    gl.useProgram(flow_shader_program);
//    gl.program = flow_shader_program;
//    gl.activeTexture(gl.TEXTURE0);
//    gl.bindTexture(gl.TEXTURE_2D, font_texture);
//    // Set the shader uniforms
//    gl.uniform1i(gl.getUniformLocation(flow_shader_program, 'tex'), 0);
//    gl.uniform1f(gl.getUniformLocation(flow_shader_program, 'time'), 0);
//    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
//    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer_data), gl.STATIC_DRAW);
//    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
     }
    {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.0, 0.0, 1.0, 1.0);
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
  gl.bindTexture(gl.TEXTURE_2D, render_texture);
  // Set the shader uniforms
  gl.uniform1i(gl.getUniformLocation(shaderProgram, 'tex'), 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer_data), gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
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

function init_flow_shader_program() {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertex_shader_source);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, flow_fragment_shader_source);
  flow_shader_program = gl.createProgram();
  gl.attachShader(flow_shader_program, vertexShader);
  gl.attachShader(flow_shader_program, fragmentShader);
  gl.linkProgram(flow_shader_program);
  if (!gl.getProgramParameter(flow_shader_program, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(flow_shader_program));
    return null;
  }
}

function generate_flow_data() {
    // we draw onto the flow_frame_buffer and then copy that texture into the
    // render_texture
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer_data), gl.STATIC_DRAW);
    for (let i=0; i < 32; i++) {
      {
        // draw to flow frame buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, flow_frame_buffer);
        gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, flow_texture, 0, i);
        gl.clearColor(0.0, 1.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(flow_shader_program);
        gl.program = flow_shader_program;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, render_texture);
        gl.uniform1i(gl.getUniformLocation(flow_shader_program, 'tex'), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_3D, null);
        gl.uniform1i(gl.getUniformLocation(flow_shader_program, 'tex2'), 1);
        gl.uniform1f(gl.getUniformLocation(flow_shader_program, 'time'), (i*1.0) / 32.0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      {
        // copy onto render texture
        gl.bindFramebuffer(gl.FRAMEBUFFER, render_frame_buffer);
        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(flow_shader_program);
        gl.program = flow_shader_program;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.uniform1i(gl.getUniformLocation(flow_shader_program, 'tex'), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_3D, flow_texture);
        gl.uniform1i(gl.getUniformLocation(flow_shader_program, 'tex2'), 1);
        gl.uniform1f(gl.getUniformLocation(flow_shader_program, 'time'), (i*-1.0) / 32.0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }
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

function loadTexture(url) {
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
