import {
  RingBufferGeometry, MeshBasicMaterial, Mesh,
  DoubleSide
} from 'three'

export default class Ring {
  constructor (options) {
    const radius = options.radius || 16
    const width = options.width || 0.5
    const geometry = new RingBufferGeometry(radius, radius + width, 32)
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      side: DoubleSide,
      transparent: true
    })
    const mesh = new Mesh(geometry, material)

    mesh.position.set(options.x, options.y, options.z)
    mesh.rotation.order = 'YXZ'
    mesh.rotation.y = options.long
    mesh.rotation.x = -options.lat

    mesh.scale.set(0.01, 0.01, 0.01)

    this.mesh = mesh
    this.update = () => {
      const { done } = this.animator.next()
      if (!done) {
        requestAnimationFrame(this.update)
      }
    }
  }

  *createAnimator () {
    while (this.k < 1) {
      this.k += 0.02
      const k = this.k
      this.mesh.scale.set(k, k, k)
      this.mesh.material.opacity = 1 - k * k
      yield
    }
  }

  animate () {
    this.k = 0.01
    this.animator = this.createAnimator()
    requestAnimationFrame(this.update)
  }
}
