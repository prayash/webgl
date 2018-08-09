const regl = require('regl')()

const draw = regl({
  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform float time;

    void main() {
      vec2 position2 = position;
      position2.y += time;
      gl_Position = vec4(position2, 0.0, 1.0);
    }
  `,

  frag: `
    precision mediump float;

    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `,

  attributes: {
    position: [[-0.5, 0.75], [0.5, 0.75], [0, 0.2]]
  },

  uniforms: {
    time: context => {
      // Lot of values available inside this context!
      return context.time % 1
    }
  },

  count: 3
})

regl.frame(() => {
  regl.clear({ color: [0, 0, 0, 1.0] })
  draw()
})
