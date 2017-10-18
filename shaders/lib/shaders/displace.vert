attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform float scale;
uniform sampler2D texture;

varying vec3 fNormal;
varying float noise;


void main () {
  fNormal = normal;

  vec4 noiseTexture = texture2D(texture, uv);

  noise = noiseTexture.r;

  vec3 newPosition = position + normal * noise * scale;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}