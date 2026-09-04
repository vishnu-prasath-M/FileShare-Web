import React from 'react'
import { DeviceHeroAnimation } from '../components/DeviceHeroAnimation'
import {
  ArrowRight,
  Shield,
  Zap,
  Smartphone,
  QrCode,
  HardDrive,
  Lock,
  ChevronDown,
  CheckCircle2,
  Share2
} from 'lucide-react'

interface LandingPageProps {
  onStartSharing: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartSharing }) => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>Peer-to-Peer WebRTC Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white light:text-zinc-900 leading-[1.1] mb-6">
          Move files. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-cyan-300">
            Not through the cloud.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 light:text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Fast, private, peer-to-peer file sharing between your mobile phones, laptops, tablets, and desktops. No accounts, no file size limits, zero cloud storage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartSharing}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-base shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Start Sharing</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#171b26] hover:bg-[#202534] border border-white/[0.08] text-zinc-300 hover:text-white font-semibold text-base transition-all cursor-pointer"
          >
            <span>How it works</span>
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Hero Animated Device Visualization */}
      <section className="w-full">
        <DeviceHeroAnimation />
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-2">
            Simplicity by Design
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white light:text-zinc-900 tracking-tight">
            How DropLink Works
          </h3>
          <p className="text-sm sm:text-base text-zinc-400 light:text-zinc-600 mt-3">
            Pair any two devices in seconds. Data travels directly across your local network or NAT without touching a cloud database.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Open DropLink',
              desc: 'Open the website on your phone, laptop, or tablet. No installation, signup, or app download required.'
            },
            {
              step: '02',
              title: 'Connect Devices',
              desc: 'Scan the instant QR code from your phone camera or enter a simple 6-digit pairing code.'
            },
            {
              step: '03',
              title: 'Select Files',
              desc: 'Drag and drop photos, 4K videos, documents, or entire folders. Preview before sending.'
            },
            {
              step: '04',
              title: 'Transfer Directly',
              desc: 'Files stream in encrypted chunks directly through WebRTC DataChannels straight into device memory.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 sm:p-8 rounded-3xl bg-[#12141c] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
            >
              <div className="font-mono text-3xl font-extrabold text-sky-400/40 group-hover:text-sky-400 transition-colors mb-4">
                {item.step}
              </div>
              <h4 className="text-lg font-bold text-white light:text-zinc-900 mb-2">
                {item.title}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-2">
            Core Architecture
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white light:text-zinc-900 tracking-tight">
            Engineered for Pure Performance
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12141c] border border-white/[0.06] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-2">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white light:text-zinc-900">Direct Wire Speed</h4>
            <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 leading-relaxed">
              When both devices share the same Wi-Fi, transfers route directly over local network hardware at full Gigabit speed without leaving your room.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#12141c] border border-white/[0.06] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white light:text-zinc-900">Zero Server Storage</h4>
            <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 leading-relaxed">
              Your files never touch a hard drive or bucket in the cloud. Signaling only relays ephemeral SDP handshake packets.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#12141c] border border-white/[0.06] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
              <Smartphone className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white light:text-zinc-900">Universal Cross-Device</h4>
            <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 leading-relaxed">
              Phone to Laptop, Laptop to Phone, iPhone to Windows, Android to Mac. Works across all modern web browsers without drivers.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#12141c] border border-white/[0.06] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <QrCode className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white light:text-zinc-900">Instant QR & Code Pairing</h4>
            <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 leading-relaxed">
              Pair your phone in 2 seconds with a camera scan, or enter a memorable 6-digit code. Sessions expire automatically.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#12141c] border border-white/[0.06] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
              <HardDrive className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white light:text-zinc-900">Memory-Safe Chunking</h4>
            <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 leading-relaxed">
              Uses incremental 64KB slicing and WebRTC backpressure control. Slices large files without crashing the browser tab.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#12141c] border border-white/[0.06] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white light:text-zinc-900">SHA-256 Integrity</h4>
            <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 leading-relaxed">
              Every transferred payload is verified with client-side Web Crypto SHA-256 hashing to guarantee bit-for-bit file integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-b from-[#131622] to-[#0d0f17] border border-white/[0.08] p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-white light:text-zinc-900 tracking-tight">
              Privacy by Architecture
            </h3>
          </div>

          <p className="text-lg text-zinc-200 font-medium leading-relaxed">
            "Your files stay strictly between your devices."
          </p>

          <p className="text-sm text-zinc-400 leading-relaxed">
            DropLink does not operate an intermediate file server. When you transfer files, WebRTC sets up an end-to-end encrypted channel between your devices using standard DTLS (Datagram Transport Layer Security) and SRTP.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
            {[
              'No user registration or email required',
              'No file data uploaded to any server or database',
              'Signaling relays ephemeral SDP handshakes only',
              'Temporary pairing sessions expire automatically',
              'Client-side SHA-256 integrity verification',
              'Zero third-party trackers or marketing cookies'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full border-t border-white/[0.06]">
        <div className="text-center mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-2">
            Questions & Answers
          </h2>
          <h3 className="text-3xl font-bold text-white light:text-zinc-900 tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Do I need an account?',
              a: 'No. DropLink does not require any account registration, email, or password. You can start sharing immediately upon opening the page.'
            },
            {
              q: 'Are my files stored online?',
              a: 'No. The application is built on WebRTC DataChannels. Files stream directly in chunks between the two paired browser instances and are never written to any cloud database or server.'
            },
            {
              q: 'Does it work between Android and Windows?',
              a: 'Yes. As long as both devices use a modern browser supporting WebRTC (such as Chrome, Edge, Firefox, or Brave) and network conditions allow peer-to-peer connection.'
            },
            {
              q: 'Does it work on iPhone and Mac?',
              a: 'Yes. Open Safari or Chrome on iOS and your Mac/PC to connect seamlessly via the QR code.'
            },
            {
              q: 'Is there a file size limit?',
              a: 'DropLink does not artificially cap file sizes. Files are streamed incrementally using 64KB chunks and backpressure management. Browser memory limits for Blob URLs may apply on low-memory mobile devices for multi-gigabyte files.'
            },
            {
              q: 'Does it work without internet?',
              a: 'The initial signaling handshake requires reaching the lightweight signaling worker to exchange connection metadata. Once the WebRTC peer connection is established on the same local Wi-Fi, the data transfer itself stays on your local network.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#12141c] border border-white/[0.06] space-y-2"
            >
              <h4 className="text-sm font-semibold text-white light:text-zinc-900">{item.q}</h4>
              <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-cyan-500/20 border border-sky-500/30 space-y-6">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to transfer files effortlessly?
          </h3>
          <p className="text-sm sm:text-base text-zinc-300 max-w-lg mx-auto">
            Experience direct device-to-device transfers today. No account needed.
          </p>
          <button
            onClick={onStartSharing}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm shadow-xl shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <span>Launch DropLink Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] py-10 px-4 text-center text-xs text-zinc-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-zinc-400">
            <Share2 className="w-4 h-4 text-sky-400" />
            <span>DropLink</span>
            <span className="font-normal text-zinc-600">— Move files. Not through the cloud.</span>
          </div>
          <div>
            <span>Peer-to-Peer WebRTC Architecture • No Cloud Storage</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
