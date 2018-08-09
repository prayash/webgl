import createREGL from 'regl'
import bunny from 'bunny'
import createCamera from 'perspective-camera'
import angleNormals from 'angle-normals'
import mat4 from 'gl-mat4'

const regl = createREGL()

const camera = createCamera({
  fov: Math.PI / 4,
  near: 0.01,
  far: 100,
  viewport: [0, 0, window.innerWidth, window.innerHeight]
})

camera.translate([0, 5, -20])
camera.lookAt([0, 5, 0])
camera.update()

const draw = regl({
  vert: `
    precision mediump float;
    
    attribute vec3 position, normal;
    
    uniform mat4 projectionView, model;
    uniform float time;

    varying vec3 vNormal;

    void main() {
      vNormal = normal;

      float SCALE = 0.5;
      gl_Position = projectionView * model * vec4(position * SCALE, 1.0);
    }
  `,

  frag: `
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
    time: context => {
      // Lot of values available inside this context!
      // console.log(context)
      return context.time % 1
    }
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
