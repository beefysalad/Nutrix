'use client'

import Header from './components/header'
import Hero from './components/hero'
import StatsStrip from './components/stats-strip'
import HowItWorks from './components/how-it-works'
import Features from './components/features'
import TelegramIntegration from './components/telegram-integration'
import Cta from './components/cta'
import Footer from './components/footer'

const LandingPageComponent = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080808] text-white">
      <Header />
      <Hero />
      <StatsStrip />
      <HowItWorks />
      <Features />
      <TelegramIntegration />
      <Cta />
      <Footer />
    </main>
  )
}

export default LandingPageComponent
