precision highp float;

varying float noise;
varying vec3 fNormal;

void main() {
  gl_FragColor = vec4(fNormal * noise, 1.0);
}