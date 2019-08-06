import Earth from './index.js'

const parent = document.querySelector('.navi-earth')

const earth = new Earth({
  parent,

  rotateSpeed: 0.002,

  coords: [
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
  ],

  pointFlashSpeed: 1,
  pointRadius: 0.45,
  pointSegments: 4,
  pointColor: 0x656e79,
  pointHighlight: 0xcbdcf0,

  ringRadius: 16,
  ringWidth: 0.5,

  fogColor: 0x151a28
})

earth.start()
