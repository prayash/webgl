# Lighting

## Flat Shading

WebGL lighting leverages a lot of math under the hood, so it's really helpful to have some basic knowledge of matrix math and model, view, and projection matrices. It's not absolutely necessary, but it's very useful.

Lighting is the process of taking model data and simulating the effects of photons hitting the surface. Generally for real time graphics the approach has been to fake it, rather than trying to accurately recreate the physics of lighting models. Newer approaches can take a more realistic approach, while these lessons deal with more traditional (fake) models of simulating light.

Exercises:

  * Modify the color to play with the basic projected image.

  * Use a varying value in the shader to pass the position down to the fragment shader. Use the position to drive some part of the color, for example the depth.

From a high level, the main script does WebGL work from scratch with the help of some helper libraries. Our program creates the program, the buffers, locations, stores the matrix transforms, and has some internal state for the color. It computes the projection matrix, the view matrix and then invokes the draw loop.

The draw call computes the model matrix and updates all attributes and uniforms and then finally draws the elements, which it draws as `gl.TRIANGLES` with the bunny model that we have. It then fires a `requestAnimationFrame` which then sets off the loop.

What's important here is the shader code. We want to give our model some color as a first step. We accomplish this by changing the `gl_fragColor` variable and giving it any 4-dimensional vector of our choice:

```glsl
precision mediump float;

// The color of the model
uniform vec4 color;

void main() {
  // We can either pass in a color as a uniform
  // or define a vector from scratch!
  gl_FragColor = vec4(0.7, 0.3, 1.0, 1.0);
}
```

Right now, our model is flat. There's no lighting information there, so there's no way to really differentiate parts of the surface to give our model some sort of shading to make it look like somewhat of a realistic object. This is where normals come in.


## Surface Normals

We've gone over how we can set a base color for a model so we can draw it to a screen, but what we really care about is how the surface of the model can behave as if light is shining on it. We can describe the surface of a model by using normals.

Normals are extremely useful for working with lighting. A surface can be defined as a plane at its core. But if just place a point on this plane, we don't really know how that plane is changing over time. What we need to do is create a vector that is of length 1, and point perpendicular to the surface (outwards). This tells us very quickly which direction the surface is pointing in.

![Surface Normals](img/surface-normals.png  "Surface Normals")

In our WebGL program, we've got a buffer for our position of the model, and all the triangles that make up the model.

## Normal Matrix

