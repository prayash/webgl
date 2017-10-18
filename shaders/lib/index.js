global.THREE = require('three')
const path = require('path')
const fs = require('fs')
const createApp = require('./createApp')
const createBunnyGeometry = require('./createBunnyGeometry')
const animate = require('raf-loop')

// Create our basic ThreeJS application
const { renderer, camera, scene, updateControls } = createApp()

// Get a nicely prepared geometry
const geometry = createBunnyGeometry({ flat: true })

// Create our vertex/fragment shaders
const material = new THREE.RawShaderMaterial({
  vertexShader: fs.readFileSync(
    path.join(__dirname, 'shaders/shader.vert'),
    'utf8'
  ),
  fragmentShader: fs.readFileSync(
    path.join(__dirname, 'shaders/shader.frag'),
    'utf8'
  ),
  uniforms: {
    time: { type: 'f', value: 0 }
  }
})

// Setup our mesh
const mesh = new THREE.Mesh(geometry, material)
const helper = new THREE.VertexNormalsHelper(mesh, 2, 0x00ff00, 1)
// scene.add(mesh)
// scene.add(helper)

const loader = new THREE.TextureLoader()
loader.load('./textures/texture.jpg', texture => {
  const dMat = new THREE.RawShaderMaterial({
    vertexShader: fs.readFileSync(
      path.join(__dirname, 'shaders/displace.vert'),
      'utf8'
    ),
    fragmentShader: fs.readFileSync(
      path.join(__dirname, 'shaders/displace.frag'),
      'utf8'
    ),
    uniforms: {
      texture: { type: 't', value: texture },
      scale: { type: 'f', value: 0.5 },
      time: { type: 'f', value: 0 }
    }
  })
  const dGeom = new THREE.SphereGeometry(1, 40, 40)
  const dMesh = new THREE.Mesh(dGeom, dMat)
  scene.add(dMesh)
})

// ************************************************

let time = 0
animate(dt => {
  // update time
  time += dt / 1000
  material.uniforms.time.value = time

  // render
  updateControls()
  renderer.render(scene, camera)
}).start()
