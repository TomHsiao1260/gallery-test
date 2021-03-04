import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'

import img from './image/view.jpg'
import imgDepth from './image/viewHeight.jpg'

// Debug
// const gui = new dat.GUI()

const shift = 2
const numWall = 10
const maxShift = (numWall -1) * shift

// https://codeburst.io/scroll-based-animate-timeline-with-easing-functions-on-a-webgl-scene-ef7c3f5a8d9b

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
directionalLight.position.set(-1, 1, 1)
scene.add(directionalLight)

// gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
// gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
// gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')
// gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')

let geometry, material, mesh, meshes = null

// Geometry
const textureLoader = new THREE.TextureLoader()
textureLoader.load(img, (texture) => createImage(texture, imgDepth))

const geometry_ = new THREE.PlaneGeometry(1.5, 1.5, 32, 32)

function createImage(texture, imgDepth) {
    textureLoader.load(imgDepth, (texture_) => createImage_(texture, texture_))
}

function createImage_(texture, texture_) {
    const ratio = texture.image.width / texture.image.height

    geometry = new THREE.PlaneGeometry(0.7*ratio, 0.7, 32, 32)

    material = new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: testFragmentShader,
        uniforms:
        {
            uTime    : { value: 0 },
            uTexture : { value: texture },
            uTexture_: { value: texture_ },
            uPoint   : { value: new THREE.Vector2() },
        }
    })

    mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)

    for(let i=0;i<numWall;i++) {
      const mesh2 = mesh.clone()
      mesh2.position.x += shift * i
      scene.add(mesh2)
    }

    meshes = [ mesh ]
}

// Material
const material_ = new THREE.MeshStandardMaterial()

// Mesh
const mesh_ = new THREE.Mesh(geometry_, material_)
mesh_.position.z = -0.05
scene.add(mesh_)

for(let i=0;i<numWall;i++) {
  const mesh2_ = mesh_.clone()
  mesh2_.position.x += shift * i
  scene.add(mesh2_)
}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 1)
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

const mouse = new THREE.Vector2()
// 建立 Raycaster 接受的滑鼠座標系統，讓右上為 (1,1) 左下為 (-1,-1)
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

/**
 * scroll
 */
const event = {
  x: 0,
  deltaX: 0
}

const maxWidth = 1000 * (numWall - 1)

function onwheel(e) {
    const DIV = document.querySelector('.text')
    DIV.innerText = 'Wheel'

    const evt = event
    evt.deltaX = (e.wheelDeltaX * -1) || e.deltaX
    evt.deltaX *= 0.2

    scroll(e)
}

function scroll (e) {
  const evt = event
  const cameraMove = (maxShift / maxWidth) * evt.deltaX

  if ((evt.x + evt.deltaX) < 0 ) {
    evt.x = 0;
  } else if ((evt.x + evt.deltaX) >= maxWidth) {
    evt.x = maxWidth
  } else {
    evt.x += evt.deltaX
    camera.position.x += cameraMove
    evt.x = camera.position.x / (maxShift / maxWidth)
  }
}

// mobile
function onTouchStart (e) {
  const t = (e.targetTouches) ? e.targetTouches[0] : e
  touchStartX = t.pageX

  const DIV = document.querySelector('.text')
  DIV.innerText = 'TouchStart'
}

// mobile
function onTouchMove (e) {
  const DIV = document.querySelector('.text')
  DIV.innerText = 'TouchMove'

  const evt = event
  const t = (e.targetTouches) ? e.targetTouches[0] : e
  // the multiply factor on mobile must be about 10x the factor applied on the wheel
  evt.deltaX = (t.pageX - touchStartX) * 2
  touchStartX = t.pageX

  scroll(e)
}

canvas.addEventListener('wheel', onwheel, false);
canvas.addEventListener('touchstart', onTouchStart, false);
canvas.addEventListener('touchmove', onTouchMove, false);


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    if (material && meshes) { 
        material.uniforms.uTime.value = elapsedTime

        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects( meshes )
        // meshes.forEach( obj => obj.material.color.set('red'))
        intersects.forEach( e => material.uniforms.uPoint.value = e.uv )
    }

    // Update controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()