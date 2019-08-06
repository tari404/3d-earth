declare interface EarthBannerOptions {
	/**
	 * The parent element that holds the canvas.
	 */
  parent: HTMLElement

	/**
	 * The coordinates of the highlighted point on the Earth model (format: [longitude, latitude, longitude, latitude...]).
   * @example [29.458349, 106.396826, 39.804935, 114.973428, ... ]
	 */
  coords?: number[]

  /**
   * The radius of connecting line animation highlights.
   * @default 10
   */
  lineHighlightSize?: number

  /**
   * Minimum interval (frame) between two line animations.
   * @default 30
   */
  minLineSpacing?: number

  /**
   * Maximum interval (frame) between two line animations.
   * @default 110
   */
  maxLineSpacing?: number

  /**
   * The rotation speed (deg/frame) of earth model.
   * @default 0.002
   */
  rotateSpeed?: number

  /**
   * The rate coefficient of small spot flashing。
   * @default 1
   */
  pointFlashSpeed?: number

  /**
   * The radius of small spot.
   * @default 0.45
   */
  pointRadius?: number

  /**
   * The segments of small spot.
   * @default 4
   */
  pointSegments?: number

  /**
   * The base color of small spot.
   * @default 0x656e79
   */
  pointColor?: number

  /**
   * The color of small spot when flashing.
   * @default 0xcbdcf0
   */
  pointHighlight?: number

  /**
   * The maximum radius of the animated rings.
   * @default 16
   */
  ringRadius?: number
  
  /**
   * Theradial width of the halo animation.
   * @default 0.5
   */
  ringWidth?: number

  /**
   * Environmental fog color.
   * @default 0x151a28
   */
  fogColor?: number
}

declare class Earth {
  constructor(options: EarthBannerOptions)

  /**
   * Create a random link animation.
   */
  randomLinkAnimator(): void

  /**
   * Start rendering animation.
   */
  start(): void

  /**
   * Stop rendering animation.
   */
  stop(): void
}

export = Earth
