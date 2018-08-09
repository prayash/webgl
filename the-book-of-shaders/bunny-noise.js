import createREGL from 'regl'
import bunny from 'bunny'
import createCamera from 'perspective-camera'
import angleNormals from 'angle-normals'
import mat4 from 'gl-mat4'

// Have to use RequireJS for this thing :/
const glsl = require('glslify')

const regl = createREGL()

const camera = createCamera({
  fov: Math.PI / 4,
  near: 0.01,
  far: 100,
  viewport: [0, 0, window.innerWidth, window.innerHeight]
})

camera.translate([0, 5, -30])
camera.lookAt([0, 5, 0])
camera.update()

const draw = regl({
  vert: glsl`
    precision mediump float;
    
    attribute vec3 position, normal;
    
    uniform mat4 projectionView, model;
    uniform float time;

    varying vec3 vNormal;

    #pragma glslify: snoise4 = require(glsl-noise/simplex/4d)

    void main() {
      vNormal = normal;
      vec3 position2 = position;

      // This is going to cause random distortions
      // TODO: Why is the 4th element of the vector a mysterious 0.0?
      // Answer: Cuz the final 1.0 makes it easy to calculate the final 4x1!
      // position2 += snoise4(vec4(position2, 0.0));

      // Spike towards the direction of the normal
      position2 += normal * snoise4(
        vec4(position2 * 0.5, time)
      );

      gl_Position = projectionView * model * vec4(position2 , 1.0);
    }
  `,

  frag: glsl`
    precision mediump float;

    varying vec3 vNormal;

    void main() {
      // Shift normals to the appropriate color space
      vec3 color = vNormal * 0.5 + 0.5;

      gl_FragColor = vec4(color, 1.0);
    }
  `,

  attributes: {
    position: bunny.positions,
    normal: angleNormals(bunny.cells, bunny.positions)
  },

  uniforms: {
    projectionView: camera.projView,
    model: ({ time }) => mat4.rotateY([], mat4.identity([]), time),
    time: ({ time }) => time
  },

  elements: bunny.cells
})

const loop = regl.frame(() => {
  try {
    regl.clear({ color: [0, 0, 0, 1.0] })
    draw()
  } catch (err) {
    loop.cancel()
    throw err
  }
})
