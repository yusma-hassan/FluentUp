// import Link from 'next/link';
// import { FloatingBackground } from '@/components/ui/FloatingBackground';

// export default function Home() {
//   return (
//     <main className="relative min-h-screen overflow-hidden bg-[var(--bg-page)]">
//       <FloatingBackground />

//       <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-20">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

//           {/* Left column */}
//           <div className="flex flex-col gap-8">
//             <div>
//               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--navy)] leading-[1.05]">
//                 Fluent<span className="text-[var(--coral)]">Up</span>
//               </h1>
//               <p className="mt-4 text-lg sm:text-xl font-bold text-[var(--navy)] leading-snug max-w-md">
//                 Sharpen your communication.<br />
//                 Speak with confidence.
//               </p>
//             </div>

//             {/* Main CTA Card */}
//             <div className="fu-card max-w-md">
//               <div className="flex justify-between items-start gap-4 mb-5">
//                 <div>
//                   <p className="font-bold text-[var(--navy)] text-lg">Ready to level up?</p>
//                   <p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">
//                     Challenges help you practice real conversations and track your progress.
//                   </p>
//                 </div>
//                 <div
//                   className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border-[2.5px] border-[var(--navy)]"
//                   style={{ background: 'var(--coral)' }}
//                 >
//                   <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
//                     <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//                   </svg>
//                 </div>
//               </div>

//               <Link href="/challenge" className="fu-btn-primary w-full text-center">
//                 Start a Challenge
//               </Link>
//             </div>
//           </div>

//           {/* Right column – Feature cards */}
//           <div className="flex flex-col gap-4">
//             {/* Daily Conversations */}
//             <div
//               className="group rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] px-5 py-4 shadow-[var(--shadow)] flex items-center transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1A1A2E]"
//               style={{ background: 'var(--coral)' }}
//             >
//               <div className="flex h-11 w-11 shrink-0 items-center justify-center">
//                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
//                   <path d="M4 4h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="white" fillOpacity="0.95"/>
//                   <path d="M9 9h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2v3l-4-3h-6a2 2 0 0 1-2-2v-1" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
//                 </svg>
//               </div>
//               <div className="w-[2px] h-10 bg-white/45 mx-4" />
//               <div>
//                 <p className="font-bold text-white text-base">Daily Conversations</p>
//                 <p className="text-sm text-white/90 mt-0.5">Real-life topics. Real progress. Every day.</p>
//               </div>
//             </div>

//             {/* Track Your Growth */}
//             <div
//               className="group rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] px-5 py-4 shadow-[var(--shadow)] flex items-center transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1A1A2E]"
//               style={{ background: 'var(--teal)' }}
//             >
//               <div className="flex h-11 w-11 shrink-0 items-center justify-center">
//                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
//                   <rect x="3" y="12" width="3.5" height="8" rx="1" fill="white"/>
//                   <rect x="9" y="8" width="3.5" height="12" rx="1" fill="white"/>
//                   <rect x="15" y="4" width="3.5" height="16" rx="1" fill="white"/>
//                   <path d="M19 7l2-2m0 0l-2-2m2 2h-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </div>
//               <div className="w-[2px] h-10 bg-white/45 mx-4" />
//               <div>
//                 <p className="font-bold text-white text-base">Track Your Growth</p>
//                 <p className="text-sm text-white/90 mt-0.5">See your progress and stay motivated.</p>
//               </div>
//             </div>

//             {/* Build Real Confidence */}
//             <div
//               className="group rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] px-5 py-4 shadow-[var(--shadow)] flex items-center transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1A1A2E]"
//               style={{ background: 'var(--yellow)' }}
//             >
//               <div className="flex h-11 w-11 shrink-0 items-center justify-center">
//                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
//                   <circle cx="12" cy="12" r="9" stroke="#1A1A2E" strokeWidth="2"/>
//                   <circle cx="12" cy="12" r="5.5" stroke="#1A1A2E" strokeWidth="2"/>
//                   <circle cx="12" cy="12" r="2" fill="#1A1A2E"/>
//                   <path d="M16.5 7.5l3-3m0 0h-3m3 0v3" stroke="#1A1A2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </div>
//               <div className="w-[2px] h-10 bg-[var(--navy)]/30 mx-4" />
//               <div>
//                 <p className="font-bold text-[var(--navy)] text-base">Build Real Confidence</p>
//                 <p className="text-sm text-[var(--navy)]/85 mt-0.5">Practice. Improve. Speak freely in any situation.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

import { HomeContent } from '@/components/home/HomeContent';

export default function Home() {
  return <HomeContent />;
}