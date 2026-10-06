import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import Hero from './components/Hero'
import About from './components/About'
import NavBar from './components/Navbar'
import Features from './components/Features'
import FloatingImage from './components/Story'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import VelocityMarquee from './components/VelocityMarquee'

gsap.registerPlugin(ScrollTrigger)

// Never hold the visitor on the loader longer than this, no matter how slow the network is.
const MAX_LOADER_MS = 3000

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const App = () => {
  const [heroReady, setHeroReady] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [loaderGone, setLoaderGone] = useState(false)
  const lenisRef = useRef(null)
  const progressRef = useRef(null)

  const ready = (heroReady && fontsReady) || timedOut

  useEffect(() => {
    if (document.fonts) document.fonts.ready.then(() => setFontsReady(true))
    else setFontsReady(true)
    const id = setTimeout(() => setTimedOut(true), MAX_LOADER_MS)
    return () => clearTimeout(id)
  }, [])

  // Buttery smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.1 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  // Lock scrolling while the loader is up.
  useEffect(() => {
    document.documentElement.style.overflow = loaderGone ? '' : 'hidden'
    if (loaderGone) {
      lenisRef.current?.start()
      ScrollTrigger.refresh()
    } else {
      lenisRef.current?.stop()
    }
  }, [loaderGone])

  useEffect(() => {
    const tween = gsap.to(progressRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  const handleHeroReady = useCallback(() => setHeroReady(true), [])
  const handleReveal = useCallback(() => setRevealed(true), [])
  const handleExited = useCallback(() => setLoaderGone(true), [])

  return (
    <main className='relative min-h-screen w-screen overflow-x-hidden'>
      {!loaderGone && <Preloader ready={ready} onReveal={handleReveal} onExited={handleExited} />}
      {!prefersReducedMotion() && <Cursor />}

      <div
        ref={progressRef}
        className='fixed left-0 top-0 z-[150] h-[3px] w-full origin-left scale-x-0 bg-gradient-to-r from-violet-300 via-blue-300 to-yellow-300'
      />

      <NavBar/>
      <Hero onReady={handleHeroReady} revealed={revealed}/>
      <About/>
      <VelocityMarquee/>
      <Features/>
      <FloatingImage/>
      <Contact/>
      <Footer/>
    </main>
  )
}

export default App
