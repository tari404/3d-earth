import * as THREE from 'three'
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Mesh,
  Fog, DoubleSide, TextureLoader,
  Vector3
} from 'three'

import InstancedPointsGeometry from './lib/InstancedPointsGeometry'
import InstancedPointsMaterial from './lib/InstancedPointsMaterial'
import Light from './lib/Light'

import Ring from './obj/Ring'
import newLight from './obj/Light'

import coords from './lib/world-points.json'

const deg = Math.PI / 180

const getControlPoint = (p1, p2) => {
  const c = new Vector3()
  c.addVectors(p1, p2)
  c.multiplyScalar(110 / c.length())
  return c
}

export default class Earth {
  constructor (options) {
    if (!(options.parent instanceof HTMLElement)) {
      throw new Error('[Earth] A correct DOM node must be provided!')
    }
    
    this.parent = options.parent
    this.rotateSpeed = options.rotateSpeed || 0.002
    this.pointFlashSpeed = options.pointFlashSpeed || 1

    this.coords = options.coords || [
      29.458349, 106.396826,
      39.804935, 114.973428,
      22.204878, 45.426417,
      10.106263, 39.144935,
      47.397837, 4.803222,
      41.997906, -1.405880,
      44.136586, 11.842139,
      38.935887, 16.504146,
      44.490049, 27.585049,
      39.062638, -78.335972,
      39.897687, -122.714527,
      9.171568, -66.633754,
      -15.47, -47.55,
      -35.15, 149.08,
      -18.06, 178.30,
      -6.09, 106.49
    ]

    this.linkAnimations = new Set()

    this.o = options
    this.init()
  }
    
  init () {
    // const camera = new OrthographicCamera(-160, 160, 88, -88, 0.1, 1000)
    // camera.position.set(0, 0, 100)
    const camera = new PerspectiveCamera(30, 1, 0.1, 1000)
    camera.position.set(0, 30, 220)
    const scene = new Scene()
    scene.fog = new Fog(this.o.fogColor || 0x151a28, 220, 320)
    const renderer = new WebGLRenderer({
      devicePixelRatio: window.devicePixelRatio,
      antialias: true,
      alpha: true
    })

    const geometry = new InstancedPointsGeometry(this.o.pointRadius || 0.45, this.o.pointSegments || 4)
    const pos = coords.reduce((res, coord) => {
      return res.concat(...coord, 0)
    }, [])
    geometry.setPositions(pos)
    const material = new InstancedPointsMaterial({
      planeHeight: 0,
      deformation: 1,
      radiu: 80,
      color: this.o.pointColor || 0x656e79,
      highlight: this.o.pointHighlight || 0xcbdcf0,
      fog: true,
      side: DoubleSide,
      depthTest: false,
      blending: THREE.AdditiveBlending
    })
    const earth = new Mesh(geometry, material)
    earth.rotation.x = 0.4
    earth.position.set(0, 0, 0)
    scene.add(earth)

    const light = new Light(this.coords)
    light.deformation = 1
    earth.add(light)

    new TextureLoader().load(require('./assets/light_128.png'), texture => {
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      light.lightMap = texture
    })

    const rings = []
    const points = []
    for (let i = 0; i < this.coords.length; i += 2) {
      const lat = this.coords[i] * deg
      const long = this.coords[i + 1] * deg
      const x = 80.5 * Math.cos(lat) * Math.sin(long)
      const y = 80.5 * Math.sin(lat)
      const z = 80.5 * Math.cos(lat) * Math.cos(long)
      const ring = new Ring({
        lat, long, x, y, z,
        radius: this.o.ringRadius,
        width: this.o.ringWidth
      })
      ring.afterAnimation = () => {
        this.locks[i / 2] = false
        this.freePointCoint++
      }
      rings.push(ring)
      points.push(new Vector3(x, y, z))
      earth.add(ring.mesh)
    }

    const bg = new Mesh(
      new THREE.OctahedronBufferGeometry(76, 4),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.05
      })
    )
    scene.add(bg)

    this.rings = rings
    this.points = points
    this.locks = new Array(points.length).fill(false)
    this.freePointCoint = points.length

    this.earth = earth
    this.light = light
    this.material = material

    this.scene = scene
    this.renderer = renderer
    this.camera = camera

    this.timer = 0
    this.minLineSpacing = this.o.minLineSpacing || 30
    this.maxLineSpacing = this.o.maxLineSpacing || 110
    this.interval = this.minLineSpacing + Math.random() * (this.maxLineSpacing - this.minLineSpacing)

    this.onresize = () => {
      const rect = this.parent.getBoundingClientRect()
      // this.left = rect.left + window.pageXOffset
      // this.top = rect.top + window.pageYOffset
      this.camera.aspect = rect.width / rect.height
      this.renderer.setSize(rect.width, rect.height)
      this.camera.updateProjectionMatrix()

      const k = rect.width < rect.height ? 1.4 : 1
      const cameraZ = (220 + rect.height / 7) * k
      this.camera.position.set(0, 20, cameraZ)
      this.scene.fog.near = cameraZ
      this.scene.fog.far = cameraZ + 80
    }

    this.render = timer => {
      this.linkAnimations.forEach(animator => {
        const { done } = animator.next()
        if (done) {
          this.linkAnimations.delete(animator)
        }
      })

      this.timer++
      if (++this.timer > this.interval) {
        this.timer = 0
        this.interval = this.minLineSpacing + Math.random() * (this.maxLineSpacing - this.minLineSpacing)
        this.randomLinkAnimator()
      }

      this.earth.rotation.y += this.rotateSpeed

      this.material.timer = timer / 1000 * this.pointFlashSpeed

      this.renderer.render(this.scene, this.camera)
      this.raf = requestAnimationFrame(this.render)
    }
  }

  getAndLockPoint () {
    const freePoints = this.locks.map((v, i) => {
      return v ? v : i
    }).filter(v => typeof v === 'number')
    const index = freePoints[Math.floor(freePoints.length * Math.random())]
    this.locks[index] = true
    this.freePointCoint--
    return index
  }

  randomLinkAnimator () {
    if (this.freePointCoint < 2) {
      return
    }
    const i1 = this.getAndLockPoint()
    const i2 = this.getAndLockPoint()
    this.linkAnimations.add(this.linkAnimator(i1, i2))
  }

  *linkAnimator (i, j) {
    const p1 = this.points[i]
    const p2 = this.points[j]
    const pm = getControlPoint(p1, p2)

    const curve = new THREE.QuadraticBezierCurve3(p1, pm, p2)
    const lenght = curve.getLength()

    const geometryC = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48))
    const materialC = new THREE.LineDashedMaterial({
      color: 0xcbdcf0,
      dashSize: 3,
      gapSize: lenght,
      scale: 6,
      transparent: true,
      depthTest: false
    })
    const curveObject = new THREE.Line(geometryC, materialC)
    curveObject.computeLineDistances()

    const light = newLight(this.o.lineHighlightSize || 10)
    this.earth.add(light)
    light.position.set(p1.x, p1.y, p1.z)

    this.earth.add(curveObject)
    this.rings[i].animate()
    let k = 0.5
    let timer = 0
    while (k < lenght) {
      k += 1.6
      timer++
      materialC.scale = 3 / k
      materialC.opacity = Math.min(1, (120 - timer) / 60)
      const j = k / lenght
      const pos = curve.getPointAt(j)
      light.position.set(pos.x, pos.y, pos.z)
      light.material.opacity = 1 - Math.pow((2 * j - 1), 2)
      yield
    }
    this.rings[j].animate()
    this.earth.remove(light)
    while (timer < 120) {
      timer++
      materialC.opacity = Math.min(1, (120 - timer) / 60)
      yield
    }
    this.earth.remove(curveObject)
  }

  start () {
    window.addEventListener('resize', this.onresize)
    this.onresize()

    const mainCanvas = this.renderer.domElement
    mainCanvas.id = 'webgl-world'
    this.parent.appendChild(this.renderer.domElement)
    this.raf = requestAnimationFrame(this.render)
  }

  stop () {
    if (this.raf) {
      cancelAnimationFrame(this.raf)
    }
    window.removeEventListener('resize', this.onresize)
    this.parent.removeChild(this.renderer.domElement)
  }
}
