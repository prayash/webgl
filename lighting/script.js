class Sketch {
  constructor() {
    console.log(MDN)

    // Prep the canvas
    this.canvas = document.getElementById('canvas')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    // Grab a context
    this.gl = MDN.createContext(this.canvas)

    this.webglProgram = this.setupProgram()
    this.buffers = this.createBuffers()
    this.locations = this.createLocations()
    this.transforms = {} // All of the matrix transforms get saved here

    this.color = [1.0, 0.4, 0.7, 1.0]

    // These matrices don't change and only need to be computed once
    this.computeProjectionMatrix()
    this.computeViewMatrix()
    // the model matrix gets re-computed every draw call

    // Start the drawing loop
    this.draw()
  }

  createBuffers() {
    let gl = this.gl

    // See /shared/bunny-model.js for the array buffers referenced by MDN.bunnyModel.positions and MDN.bunnyModel.elements

    let positionsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, MDN.bunnyModel.positions, gl.STATIC_DRAW)

    let normalsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, MDN.bunnyModel.vertexNormals, gl.STATIC_DRAW)

    let elementsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer)
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      MDN.bunnyModel.elements,
      gl.STATIC_DRAW
    )

    return {
      positions: positionsBuffer,
      elements: elementsBuffer,
      normals: normalsBuffer
    }
  }

  setupProgram() {
    let gl = this.gl

    // Setup a WebGL program
    let webglProgram = MDN.createWebGLProgramFromIds(
      gl,
      'vertex-shader',
      'fragment-shader'
    )
    gl.useProgram(webglProgram)

    // Tell WebGL to test the depth when drawing
    gl.enable(gl.DEPTH_TEST)

    return webglProgram
  }

  createLocations() {
    let gl = this.gl

    let locations = {
      // Save the uniform locations
      model: gl.getUniformLocation(this.webglProgram, 'model'),
      view: gl.getUniformLocation(this.webglProgram, 'view'),
      projection: gl.getUniformLocation(this.webglProgram, 'projection'),
      normalMatrix: gl.getUniformLocation(this.webglProgram, 'normalMatrix'),
      color: gl.getUniformLocation(this.webglProgram, 'color'),

      // Save the attribute location
      position: gl.getAttribLocation(this.webglProgram, 'position'),
      normal: gl.getAttribLocation(this.webglProgram, 'normal')
    }

    return locations
  }

  computeViewMatrix() {
    // Move the camera so that the bunny is in view
    let view = MDN.invertMatrix(MDN.translateMatrix(0, 5, 10))

    //Save as a typed array so that it can be sent to the GPU
    this.transforms.view = new Float32Array(view)
  }

  computeProjectionMatrix() {
    let fieldOfViewInRadians = Math.PI * 0.5
    let aspectRatio = window.innerWidth / window.innerHeight
    let nearClippingPlaneDistance = 1
    let farClippingPlaneDistance = 200

    let projection = MDN.perspectiveMatrix(
      fieldOfViewInRadians,
      aspectRatio,
      nearClippingPlaneDistance,
      farClippingPlaneDistance
    )

    // Save as a typed array so that it can be sent to the GPU
    this.transforms.projection = new Float32Array(projection)
  }

  computeModelMatrix(now) {
    // Rotate according to time
    let model = MDN.rotateYMatrix(now * 0.0005)

    //Save as a typed array so that it can be sent to the GPU
    this.transforms.model = new Float32Array(model)

    /*
    Performance caveat: in real production code it's best to re-use
    objects and arrays. It's best not to create new arrays and objects
    in a loop. This example chooses code clarity over performance.
  */
  }

  computerNormalMatrix() {
    let modelView = MDN.multiplyMatrices(
      this.transforms.view,
      this.transforms.model
    )

    // Run the function from the shared/matrices.js that takes
    // the inverse and then transpose of the provided matrix
    // and returns a 3x3 matrix.
    this.transforms.normalMatrix = MDN.normalMatrix(modelView)
  }

  draw() {
    let gl = this.gl
    let now = Date.now()

    // Compute our model matrix
    this.computeModelMatrix(now)
    this.computerNormalMatrix()

    // Update the data going to the GPU
    this.updateAttributesAndUniforms()

    // Perform the actual draw
    gl.drawElements(
      gl.TRIANGLES,
      MDN.bunnyModel.elements.length,
      gl.UNSIGNED_SHORT,
      0
    )

    // Run the draw as a loop
    requestAnimationFrame(this.draw.bind(this))
  }

  updateAttributesAndUniforms() {
    let gl = this.gl

    // Set the uniforms
    gl.uniformMatrix4fv(
      this.locations.projection,
      false,
      this.transforms.projection
    )
    gl.uniformMatrix4fv(this.locations.view, false, this.transforms.view)
    gl.uniformMatrix4fv(this.locations.model, false, this.transforms.model)
    gl.uniformMatrix3fv(
      this.locations.normalMatrix,
      false,
      this.transforms.normalMatrix
    )

    gl.uniform4fv(this.locations.color, this.color)

    // Set the positions attribute
    gl.enableVertexAttribArray(this.locations.position)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions)
    gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0)

    // Set the normals attribute
    gl.enableVertexAttribArray(this.locations.normal)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normals)
    gl.vertexAttribPointer(this.locations.normal, 3, gl.FLOAT, false, 0, 0)

    // Set the elements array which defines the order the positions will be drawn
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.elements)
  }
}

let sketch = new Sketch()
sketch.draw()
