const regl = require('regl')()
const mat4 = require('gl-mat4')
const glsl = require('glslify')

const positions = generatePlane(5, 5)

const drawPlane = regl({
  vert: glsl`
    precision mediump float;
    attribute vec3 position;
    
    uniform mat4 view, projection;
    uniform float time;

    varying vec3 vPosition;

    void main() {
      vec3 position2 = position;
      position2.y += 0.1 * sin(3.0 * time + position.x * 12.5);
      position2.y += 0.05 * cos(1.0 * time + position.z * 7.5);
      vPosition = position2;

      gl_Position = projection * view * vec4(position, 1);
    }
  `,

  frag: glsl`
    #define PI 3.14159265359

    precision mediump float;
    varying vec3 vPosition;

    uniform float time;

    vec3 rgb2hsb(in vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz),
                   vec4(c.gb, K.xy),
                   step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r),
                   vec4(c.r, p.yzx),
                   step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                  d / (q.x + e),
                  q.x);
    }
  
    //  Function from Iñigo Quiles
    //  https://www.shadertoy.com/view/MsS3Wc
    vec3 hsb2rgb(in vec3 c) {
        vec3 rgb = clamp(
          abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
          0.0,
          1.0
        );
        
        rgb = rgb * rgb * (3.0 - 2.0 * rgb);
        return c.z * mix(vec3(1.0), rgb, c.y);
    }

    void main() {
      vec3 color = vec3(0.0);
      
      color = hsb2rgb(vec3(vPosition.x + 0.5, 1.0, vPosition.z + 0.5));

      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // this converts the vertices of the mesh into the position attribute
  attributes: {
    position: positions
  },
  count: positions.length,
  uniforms: {
    view: ({ time }) => {
      const t = time * 0.4
      return mat4.lookAt([], [1, 1, 1], [0, 0, 0], [0, 1, 0])
    },
    time: ({ time }) => time,
    projection: ({ viewportWidth, viewportHeight }) =>
      mat4.perspective(
        [],
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000
      )
  }
})

function generatePlane(segmentsX, segmentsZ) {
  const positions = []
  const widthX = 1 / segmentsX
  const widthZ = 1 / segmentsZ

  for (let x = 0; x < segmentsX; x++) {
    for (let z = 0; z < segmentsZ; z++) {
      const x0 = x * widthX - 0.5
      const x1 = (x + 1) * widthX - 0.5
      const z0 = z * widthZ - 0.5
      const z1 = (z + 1) * widthZ - 0.5

      // Build 2 triangles
      //
      //       (x0, z1)       (x1, z1)
      //              *-------*
      //              | A   / |
      //              |   /   |
      //              | /   B |
      //              *-------*
      //       (x0, z0)       (x1, z0)

      // Triangle A
      positions.push([x0, 0, z0])
      positions.push([x0, 0, z1])
      positions.push([x1, 0, z1])

      // Triangle B
      positions.push([x1, 0, z1])
      positions.push([x1, 0, z0])
      positions.push([x0, 0, z0])
    }
  }

  return positions
}

// Run the draw code on every frame update at 60fps.
regl.frame(() => {
  regl.clear({ depth: 1, color: [0, 0, 0, 1] })
  drawPlane()
})
