import { useEffect, useRef } from 'react'

export default function Starfield({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let stars = []
    let raf

    function init() {
      canvas.width  = canvas.offsetWidth  || 800
      canvas.height = canvas.offsetHeight || 600
      const count = Math.min(180, Math.floor(canvas.width * canvas.height / 7000))
      stars = Array.from({ length: count }, () => ({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.1 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.7 + 0.3,
      }))
    }

    const onResize = () => init()
    window.addEventListener('resize', onResize)
    init()

    let t = 0
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.01
      for (const s of stars) {
        const alpha = 0.2 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(215,220,245,${alpha.toFixed(3)})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />
}
