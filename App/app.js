// Create a new instance. Use one instance for each camera
window.handsfree = new Handsfree({})

let strokeColor = '#000'
const colors = [
  'f00',
  'ff0',
  '0f0',
  '0ff',
  '00f',
  'f0f',
  '964b00',
  'fff',
  '000'
]
let currentColorIdx = 0
let $colorBtns = []

/**
 * Create a simple plugin that displays pointer values on every frame
 */
Handsfree.use('p5.facePaint', {
  // Plugin properties
  x: 0,
  y: 0,
  lastX: 0,
  lastY: 0,

  // Contains our P5 instance
  p5: null,

  /**
   * Called exactly once when the plugin is first used
   */
  onUse() {
    this.p5 = new p5((p) => {
      const $canvasWrap = document.querySelector('#canvas-wrap')

      // Setup P5 canvas
      p.setup = () => {
        const $canvas = p.createCanvas(
          $canvasWrap.clientWidth,
          $canvasWrap.clientHeight
        )
        $canvas.parent($canvasWrap)
        p.strokeWeight(6)
      }

      // Match canvas size to window
      p.windowResized = () => {
        p.resizeCanvas($canvasWrap.clientWidth, $canvasWrap.clientHeight)
      }
    })
  },

  onFrame({ head }) {
    // Setup point coordinates
    this.lastX = this.x
    this.lastY = this.y
    // @todo: pointer origin should be at center, not corner (fix via CSS?)
    this.x = head.pointer.x + 10
    this.y = head.pointer.y + 10

    this.p5.stroke(this.p5.color(strokeColor))

    // Draw lines
    if (head.state.smirk || head.state.smile) {
      this.p5.line(this.x, this.y, this.lastX, this.lastY)
    }

    if (head.state.browLeftUp) this.updateColor(1)
    else if (head.state.browRightUp) this.updateColor(-1)
  },

  /**
   * Change a color, throttled to make it easier to select one
   */
  updateColor: _.throttle(
    function(step) {
      currentColorIdx += step
      if (currentColorIdx < 0) currentColorIdx = colors.length - 1
      if (currentColorIdx > colors.length - 1) currentColorIdx = 0

      $colorBtns[currentColorIdx].click()
    },
    250,
    { trailing: false }
  )
})

/**
 * Delete with clear
 */
handsfree.on('clear', () => {
  Handsfree.plugins['p5.facePaint'].p5.clear()
})

/**
 * Add color buttons and click events
 */
const $colorWrap = document.querySelector('#colors')
let colorIndexes = 0
let $currentColorBtn

colors.forEach((color) => {
  const $btn = document.createElement('button')
  $btn.setAttribute('data-color', `#${color}`)
  $btn.setAttribute('data-id', colorIndexes)
  $btn.style.background = `#${color}`
  $colorWrap.appendChild($btn)
  $colorBtns.push($btn)
  colorIndexes++

  /**
   * When clicked, update color index so that we can change it with eyebrows
   */
  $btn.addEventListener('click', function() {
    $currentColorBtn.classList.remove('selected')
    this.classList.add('selected')
    $currentColorBtn = this

    strokeColor = this.getAttribute('data-color')
    currentColorIdx = +this.getAttribute('data-id')
  })
})

$currentColorBtn = $colorBtns[$colorBtns.length - 1]
$currentColorBtn.classList.add('selected')
