import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react'

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
)

const footerLinks = {
  Product: [
    { label: 'Explore', to: '/explore' },
    { label: 'How it works', to: '/how-it-works' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Reviews', to: '/reviews' },
  ],
  Business: [
    { label: 'List your business', to: '/business/register' },
    { label: 'Business dashboard', to: '/business' },
    { label: 'Marketing tools', to: '/business/marketing' },
    { label: 'Analytics', to: '/business/reports' },
  ],
  Support: [
    { label: 'Help Center', to: '/help' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
  ],
}

const socials = [
  { Icon: InstagramIcon, href: '#', label: 'Instagram' },
  { Icon: TwitterIcon, href: '#', label: 'Twitter' },
  { Icon: FacebookIcon, href: '#', label: 'Facebook' },
]

export default function Footer() {
  return (
    <footer className="bg-surface-950 text-surface-400 mt-auto">
      {/* Top section */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">
                Beauty Personalized <span className="gradient-text">AI</span>
              </span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed max-w-xs">
              The smart way to discover and book beauty, salon, spa, and wellness appointments near you.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-brand-400 flex-shrink-0" />
                <span>Lahore, Johar Town</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-brand-400 flex-shrink-0" />
                <a href="mailto:hello@beautyai.com" className="hover:text-white transition-colors">hello@beautyai.com</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-brand-400 flex-shrink-0" />
                <span>+1 (800) BEAUTY-AI</span>
              </div>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-2.5 pt-1">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-surface-400 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-brand-500/10 hover:text-brand-300 hover:shadow-[0_8px_24px_rgba(124,58,237,0.18)]"
                >
                  <Icon className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="font-semibold text-white text-sm">{category}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-surface-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-surface-800">
        <div className="container-custom py-5 text-center">
          <p className="text-sm text-surface-500">© 2024 Beauty Personalized AI, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
