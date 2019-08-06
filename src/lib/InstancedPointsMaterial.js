/**
 * @author Felix Cai / http://github.com/tari404
 *
 * parameters = {
 *  color: <hex>,
 *  highlight: <hex>
 *  planeHeight: <float>,
 *  radiu: <float>,
 *  deformation: <float>,
 *  timer: <float>
 * }
 */

import * as THREE from 'three'

// import pointsVS from './points.glsl.vs'
// import pointsFS from './points.glsl.fs'

const pointsVS = `
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

attribute vec3 instancePos;

uniform float uDeformation;
uniform float uPlaneHeight;
uniform float uRadiu;

varying float vRand;

vec2 restoreLongAndLat(const in vec2 longAndLat) {
  float latI = longAndLat.y + 15.0;
  float k = 0.9 - latI * latI / 72900.0;
  float longI = longAndLat.x / k;
  return vec2(longI + 12.0, latI);
}

vec3 coordTrans(
  const in vec2 longAndLat,
  const in float radiu,
  out mat3 tranX,
  out mat3 tranY
) {
  float dk = saturate(uDeformation * 2.0 - rand(longAndLat));
  float cosX = cos(radians(longAndLat.y * dk));
  float sinX = sin(radians(longAndLat.y * dk));
  float cosY = cos(radians(longAndLat.x * dk));
  float sinY = sin(radians(longAndLat.x * dk));
  float xz = radiu * cos(radians(longAndLat.y));
  float y = radiu * sin(radians(longAndLat.y));
  float x = xz * sin(radians(longAndLat.x));
  float z = xz * cos(radians(longAndLat.x));
  tranX = mat3(
    1, 0, 0,
    0, cosX, -sinX,
    0, sinX, cosX
  );
  tranY = mat3(
    cosY, 0, -sinY,
    0, 1, 0,
    sinY, 0, cosY
  );
  return mix(vec3(instancePos.xy, uPlaneHeight), vec3(x, y, z), dk);
}

void main() {
  vec2 longAndLat = restoreLongAndLat(instancePos.xy);
  mat3 tranX, tranY;
  vec3 coord = coordTrans(longAndLat, uRadiu, tranX, tranY);
  vec3 pos = tranY * tranX * position;
  vec4 mvPosition = modelViewMatrix * vec4(coord + pos, 1.0);
  // vec4 mvPosition = modelViewMatrix * vec4(instancePos + position + vec3(0, 0, 80), 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vRand = rand(instancePos.xy);

  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
}
`

const pointsFS = `
uniform vec3 diffuse;
uniform vec3 uHighlight;
uniform float opacity;

#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

uniform float uTimer;
varying float vRand;

void main() {

  #include <clipping_planes_fragment>

  // float flash = rand(vec2(uTimer, vRand));
  float test = saturate(mod(uTimer * 0.5 + 100.0, vRand * 8.0 + 8.0));
  float flash = 1.0 - sin(test * PI);
  vec4 diffuseColor = vec4(mix(uHighlight, diffuse, flash), opacity);
  // vec4 diffuseColor = vec4(diffuse, opacity * vRand);

  #include <logdepthbuf_fragment>
  #include <color_fragment>

  gl_FragColor = diffuseColor;

  #include <premultiplied_alpha_fragment>
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  #include <fog_fragment>
}
`

const pointsUniforms = THREE.UniformsUtils.merge([
  THREE.UniformsLib.common,
  THREE.UniformsLib.fog,
  {
    uDeformation: { value: 0 },
    uPlaneHeight: { value: 0 },
    uRadiu: { value: 100 },
    uTimer: { value: 0 },
    uHighlight: { value: new THREE.Color(0xffffff) }
  }
])

export default class InstancedPointsMaterial extends THREE.ShaderMaterial {
  constructor (parameters) {
    super({
      type: 'InstancedPointsMaterial',
      uniforms: THREE.UniformsUtils.clone(pointsUniforms),
      vertexShader: pointsVS,
      fragmentShader: pointsFS
    })

    this.setValues(parameters)
  }

  get color () {
    return this.uniforms.diffuse.value
  }
  set color (value) {
    this.uniforms.diffuse.value = value
  }

  get planeHeight () {
    return this.uniforms.uPlaneHeight.value
  }
  set planeHeight (value) {
    this.uniforms.uPlaneHeight.value = value
  }

  get radiu () {
    return this.uniforms.uRadiu.value
  }
  set radiu (value) {
    this.uniforms.uRadiu.value = value
  }

  get deformation () {
    return this.uniforms.uDeformation.value
  }
  set deformation (value) {
    this.uniforms.uDeformation.value = value
  }

  get timer () {
    return this.uniforms.uTimer.value
  }
  set timer (value) {
    this.uniforms.uTimer.value = value
  }

  get highlight () {
    return this.uniforms.uHighlight.value
  }
  set highlight (value) {
    this.uniforms.uHighlight.value.copy(value)
  }

  static get isInstancedPointsMaterial () {
    return true
  }

  clone () {
    return new this.constructor().copy(this)
  }

  copy (source) {
    THREE.ShaderMaterial.prototype.copy.call(this, source)
    this.color.copy(source.color)
    // TODO
    return this
  }
}
