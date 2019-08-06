import * as THREE from 'three'

const geometry = new THREE.BufferGeometry()
geometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3))

const sprite = new THREE.TextureLoader().load(require('../assets/point_32.png'))

const material = new THREE.PointsMaterial({
  size: 10,
  map: sprite,
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true,
  color: 0xffffff
})

export default function newLight () {
  return new THREE.Points(geometry, material.clone())
}
