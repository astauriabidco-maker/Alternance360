'use client'

import Link from 'next/link'
import {
  Anchor,
  Ship,
  Compass,
  FileText,
  Bell,
  CheckCircle2,
  Shield,
  Users,
  Calendar,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Target,
  BookOpen,
  BarChart3,
  Clock,
  Download,
  Menu,
  X,
  Play,
  Quote,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import RadarChartHero from '@/components/landing/radar-chart-hero'
import { FadeIn } from '@/components/ui/fade-in'
import LeadMagnetSection from '@/components/landing/lead-magnet-section'
import { LogoMarquee } from '@/components/landing/logo-marquee'
import { BentoGrid } from '@/components/landing/bento-grid'
import { ProductMockup } from '@/components/landing/product-mockup'

const faqData = [
  {
    question: "Est-ce que la plateforme est réellement conforme aux exigences Qualiopi ?",
    answer: "Absolument. Notre outil a été conçu spécifiquement autour du référentiel national qualité. Il automatise la collecte de preuves pour l'Indicateur 11 (individualisation et positionnement) et l'Indicateur 20 (suivi des bénéficiaires et prévention des ruptures). Chaque action est horodatée et archivée, rendant vos audits sereins."
  },
  {
    question: "Nos données sont-elles sécurisées et conformes au RGPD ?",
    answer: "La sécurité est notre priorité. Grâce à notre architecture Multi-Tenant, les données de chaque CFA sont strictement cloisonnées dans des silos isolés. Nous hébergeons les données sur des serveurs sécurisés en Europe (conformité RGPD totale) et nous utilisons des protocoles de chiffrement de niveau bancaire."
  },
  {
    question: "Peut-on l'intégrer avec nos outils actuels (Yparéo, Gesti, etc.) ?",
    answer: "Oui. Nous savons que votre temps est précieux. C'est pourquoi Alternance360 communique nativement avec vos outils de gestion (Yparéo, Gesti, SC Form...). Importez vos cohortes en un clic et évitez toute double saisie fastidieuse."
  },
  {
    question: "Est-ce difficile à prendre en main pour les Maîtres d'Apprentissage ?",
    answer: "C'est le point fort de notre solution. L'interface tuteur est 'Mobile-First' : elle ne nécessite aucune formation. Une simple notification sur leur téléphone leur permet de valider une compétence ou de signer un bilan en moins de 30 secondes."
  },
  {
    question: "Combien de temps prend le déploiement de la plateforme ?",
    answer: "Grâce à notre module d'importation intelligente des référentiels RNCP, vous pouvez configurer votre premier diplôme en moins de 5 minutes. Une fois votre charte graphique intégrée, votre instance CFA est prête à accueillir ses premiers apprentis immédiatement."
  },
  {
    question: "Quel est le modèle de tarification ?",
    answer: "Nous proposons un modèle SaaS flexible basé sur le nombre d'apprentis actifs. Pas de frais d'infrastructure lourds, pas de maintenance à votre charge. Vous payez pour l'usage réel, ce qui permet une maîtrise totale de votre budget formation."
  }
]

function FaqAccordion({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <FadeIn delay={index * 0.1}>
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-4">
            <span className="text-xs font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-lg">
              {String(index).padStart(2, '0')}
            </span>
            <span className="font-bold text-slate-900">{question}</span>
          </span>
          <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-transform ${isOpen ? 'rotate-180 bg-blue-100' : ''}`}>
            {isOpen ? <Minus size={18} className="text-blue-900" /> : <Plus size={18} className="text-slate-600" />}
          </div>
        </button>
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 pt-0">
            <p className="text-slate-600 leading-relaxed pl-14">{answer}</p>
          </div>
        </motion.div>
      </div>
    </FadeIn>
  )
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Sticky Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-slate-100/50' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Anchor className="text-white" size={20} />
              </div>
              <span className={`text-xl font-black tracking-tight transition-colors duration-300 ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                Alternance<span className="text-blue-600">360</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className={`text-sm font-semibold transition-colors duration-300 ${isScrolled ? 'text-slate-600 hover:text-blue-900' : 'text-slate-600 hover:text-blue-900'}`}>Fonctionnalités</a>
              <a href="#why-us" className={`text-sm font-semibold transition-colors duration-300 ${isScrolled ? 'text-slate-600 hover:text-blue-900' : 'text-slate-600 hover:text-blue-900'}`}>Pourquoi nous</a>
              <Link href="/pricing" className={`text-sm font-semibold transition-colors duration-300 ${isScrolled ? 'text-slate-600 hover:text-blue-900' : 'text-slate-600 hover:text-blue-900'}`}>Tarifs</Link>
              <a href="#security" className={`text-sm font-semibold transition-colors duration-300 ${isScrolled ? 'text-slate-600 hover:text-blue-900' : 'text-slate-600 hover:text-blue-900'}`}>Sécurité</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className={`text-sm font-bold transition-colors duration-300 ${isScrolled ? 'text-slate-700 hover:text-blue-900' : 'text-slate-600 hover:text-blue-900'}`}>
                Espace Client
              </Link>
              <Link href="/register" className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:shadow-md hover:shadow-blue-900/10 active:scale-95">
                Demander une démo
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-100 pt-4 space-y-4 animate-in slide-in-from-top-2">
              <a href="#features" className="block text-sm font-semibold text-slate-600">Fonctionnalités</a>
              <a href="#why-us" className="block text-sm font-semibold text-slate-600">Pourquoi nous</a>
              <Link href="/register" className="block w-full bg-blue-900 text-white px-5 py-3 rounded-xl text-sm font-bold text-center">
                Commencer
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Institutional Light Theme */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-[100px] -ml-20"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              {/* Compliance Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">
                  <Shield size={14} className="text-blue-900" />
                  Certifié Qualiopi
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Conforme RGPD
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">
                  <Users size={14} className="text-slate-600" />
                  Hébergé en France
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                Sécurisez vos parcours <br />
                <span className="text-blue-900">d'apprentissage.</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl">
                La plateforme de référence pour les CFA. Centralisez vos preuves, assurez votre conformité <strong>Qualiopi</strong> et simplifiez le quotidien de vos équipes pédagogiques.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-lg text-base font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]">
                  Démarrer l'essai gratuit
                  <ArrowRight size={20} />
                </Link>
                <button className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-8 py-4 rounded-lg text-base font-bold transition-all shadow-sm">
                  <Play size={18} className="text-blue-900 fill-blue-900/10" />
                  Présentation vidéo
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-4">Ils nous font confiance :</p>
                <div className="flex items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  {/* Placeholder for Logos - Use Text for now to look cleaner */}
                  <span className="font-bold text-slate-400 text-lg">CFA BTP</span>
                  <span className="font-bold text-slate-400 text-lg">CCI Formation</span>
                  <span className="font-bold text-slate-400 text-lg">AFPA</span>
                  <span className="font-bold text-slate-400 text-lg">Greta</span>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} direction="left">
              <div className="relative">
                {/* Soft glow behind mockup */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-emerald-50 rounded-[2rem] blur-xl"></div>
                <div className="relative rounded-xl shadow-2xl border border-slate-200 bg-white overflow-hidden">
                  <ProductMockup />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Social Proof - Logo Marquee */}
      <LogoMarquee />

      {/* Management Section (ex-Analogy) */}
      <section className="py-24 md:py-32 bg-white relative border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-8">
                <BarChart3 size={16} />
                Pilotage & Performance
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                Pilotez votre CFA avec <br /><span className="text-blue-900">rigueur et précision.</span>
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  La gestion de l'apprentissage ne s'improvise pas. Au-delà des obligations légales, c'est la performance de votre organisme qui est en jeu.
                </p>
                <p>
                  Alternance360 centralise l'ensemble de vos données pédagogiques et administratives. Vous disposez d'une vision à 360° sur l'avancement de chaque cohorte, identifiez les décrochages potentiels et sécurisez vos financements OPCO.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} direction="right">
              <div className="relative">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 shadow-lg">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">Tableau de Bord Direction</h3>
                  <div className="space-y-4">
                    {[
                      { icon: CheckCircle2, label: 'Suivi de l\'assiduité en temps réel', sub: 'Connexion aux badges et feuilles d\'émargement', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { icon: BarChart3, label: 'Taux de remplissage TSF', sub: 'Indicateurs d\'avancement par diplôme', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { icon: FileText, label: 'Conformité Qualiopi', sub: 'Génération automatique des preuves', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                          <item.icon size={20} className={item.color} />
                        </div>
                        <div>
                          <span className="block text-base font-bold text-slate-900">{item.label}</span>
                          <span className="text-sm text-slate-500">{item.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <BentoGrid />

      {/* Why Us - Comparison Table */}
      <section id="why-us" className="py-20 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
              Pourquoi les CFA nous choisissent ?
            </h2>
            <p className="text-lg text-slate-600">Des solutions concrètes à vos défis quotidiens.</p>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100">
            <div className="grid grid-cols-3 bg-blue-900 text-white py-4 px-6 font-bold text-sm">
              <span>Défi CFA</span>
              <span>Notre Solution</span>
              <span>Bénéfice</span>
            </div>
            {[
              { challenge: 'Audit Qualiopi', solution: 'Archivage automatique (Ind. 11 & 20)', benefit: 'Sérénité totale' },
              { challenge: 'Relance Tuteurs', solution: 'Notifications intelligentes et mobiles', benefit: 'Engagement terrain' },
              { challenge: 'Rupture de contrat', solution: 'Score de risque et alertes précoces', benefit: 'Rétention accrue' },
              { challenge: 'Gestion Multi-sites', solution: 'Architecture Multi-Tenant isolée', benefit: 'Gouvernance simplifiée' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 py-5 px-6 border-t border-slate-100 text-sm">
                <span className="font-semibold text-slate-900">{row.challenge}</span>
                <span className="text-slate-600">{row.solution}</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={16} /> {row.benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative bg-white rounded-[3rem] p-10 md:p-14 shadow-xl shadow-slate-200/50 border border-slate-100">
            <Quote size={48} className="absolute top-8 left-8 text-blue-100" />
            <div className="relative">
              <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-medium mb-8">
                "Depuis que nous utilisons Alternance360, la relation avec nos entreprises partenaires s'est transformée.
                Les tuteurs apprécient la simplicité de l'outil, et nous avons <span className="text-blue-900 font-bold">sécurisé 100% de nos financements</span> sur le dernier audit."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  SM
                </div>
                <div>
                  <p className="font-bold text-slate-900">Sophie Martin</p>
                  <p className="text-sm text-slate-500">Responsable Pédagogique, CFA BTP Auvergne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section - Light/Grey Institutional */}
      <section id="security" className="py-24 md:py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-blue-900 px-4 py-2 rounded-lg text-sm font-bold mb-8 shadow-sm">
                <Shield size={16} />
                Infrastructure Souveraine
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                Vos données sont en <br /><span className="text-blue-900">sécurité.</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg mb-8">
                Nous comprenons la sensibilité des données d'un CFA. C'est pourquoi nous avons mis en place les standards de sécurité les plus élevés du marché.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 mt-1" />
                  <p className="text-slate-700"><strong>Hébergement 100% Français</strong> (Scaleway / OVH). Aucune donnée ne quitte le territoire.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 mt-1" />
                  <p className="text-slate-700"><strong>Chiffrement AES-256</strong> de bout en bout pour toutes les données sensibles.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 mt-1" />
                  <p className="text-slate-700"><strong>Sauvegardes Quotidiennes</strong> redondantes et externalisées.</p>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Shield, label: 'Conformité RGPD', desc: 'DPO externalisé & Registre à jour' },
                { icon: Users, label: 'Cloisonnement', desc: 'Architecture Multi-Tenant stricte' },
                { icon: Clock, label: 'Traçabilité', desc: 'Journalisation inviolable des actions' },
                { icon: CheckCircle2, label: 'Disponibilité', desc: 'SLA garanti 99.9%' },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1} direction="up">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                      <item.icon size={24} className="text-blue-900" />
                    </div>
                    <div className="font-bold text-slate-900 mb-1">{item.label}</div>
                    <div className="text-sm text-slate-500">{item.desc}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <HelpCircle size={16} className="text-blue-600" />
                Foire Aux Questions
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                Clarifions vos <span className="text-blue-600">intentions</span>.
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <FaqAccordion key={i} question={faq.question} answer={faq.answer} index={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Lead Magnet Section */}
      <LeadMagnetSection />

      {/* CTA Section - Professional */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-slate-900">
        {/* Subtle texture instead of neon */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Prêt à moderniser votre CFA ?
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
              Rejoignez les organismes de formation qui ont choisi la sérénité. <br />
              Sans engagement. Configuration assistée.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-bold transition-all hover:bg-blue-50 shadow-lg active:scale-[0.98]">
                Commencer l'essai gratuit
              </Link>
              <Link href="/contact" className="w-full sm:w-auto bg-transparent border border-white/20 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all hover:bg-white/5">
                Parler à un conseiller
              </Link>
            </div>

            <p className="mt-8 text-sm text-slate-500">
              Aucune carte bancaire requise pour démarrer.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Anchor className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold">Alternance360</span>
              </div>
              <p className="text-slate-400 text-sm">
                La plateforme de référence pour le suivi pédagogique en alternance.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique RGPD</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            © 2026 Alternance360. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
