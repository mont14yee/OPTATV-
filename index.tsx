import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- Types & Data ---

interface Match {
  id: number;
  home: string;
  away: string;
  time: string;
  score: string;
  status: "LIVE" | "HT" | "FT" | "UPCOMING";
  league: string;
  streamUrl?: string;
}

const HOT_MATCH: Match = {
  id: 999,
  home: "Real Madrid",
  away: "Man City",
  time: "78'",
  score: "2 - 2",
  status: "LIVE",
  league: "Champions League",
  streamUrl: "https://www.camel1.live/q/home/hotmatch"
};

const competitions = [
  {
    name: "Champions League",
    matches: [
      { id: 1, home: "Real Madrid", away: "Man City", time: "78'", score: "2 - 2", status: "LIVE" },
      { id: 2, home: "Arsenal", away: "Bayern", time: "20:00", score: "vs", status: "UPCOMING" }
    ]
  },
  {
    name: "Premier League",
    matches: [
      { id: 3, home: "Liverpool", away: "Crystal Palace", time: "FT", score: "0 - 1", status: "FT" },
      { id: 4, home: "Arsenal", away: "Aston Villa", time: "16:30", score: "vs", status: "UPCOMING" }
    ]
  },
  { name: "La Liga", matches: [] },
  { name: "Serie A", matches: [] },
  { name: "Bundesliga", matches: [] },
  { name: "Ligue 1", matches: [] },
  { name: "MLS", matches: [] }
] as const;

const THEMES = [
  { name: "Neon Green", color: "#39ff14", rgb: "57, 255, 20" },
  { name: "Cyber Blue", color: "#00f0ff", rgb: "0, 240, 255" },
  { name: "Electric Purple", color: "#d946ef", rgb: "217, 70, 239" },
  { name: "Hot Pink", color: "#ff0099", rgb: "255, 0, 153" },
  { name: "Sunset Orange", color: "#ff5f1f", rgb: "255, 95, 31" },
  { name: "Golden Yellow", color: "#facc15", rgb: "250, 204, 21" },
];

// --- Components ---

const SettingsTab = ({ currentTheme, onThemeChange }: { currentTheme: string, onThemeChange: (theme: typeof THEMES[0]) => void }) => {
  const [activeModal, setActiveModal] = useState<'none' | 'privacy' | 'tips'>('none');

  const closeModal = () => setActiveModal('none');

  return (
    <div className="p-6 pb-24 pt-24 space-y-8 animate-fade-in relative">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-display font-bold text-white tracking-wide">Settings</h2>
      </div>

      {/* Sign In / Sync Card */}
      <div className="relative group overflow-hidden rounded-2xl p-6 border border-slate-800 bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="p-3 rounded-full bg-slate-800 text-[var(--primary-color)]">
            <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Sync Your Preferences</h3>
            <p className="text-sm text-slate-400">Sign in to save your favorite teams, leagues, and settings across all your devices.</p>
          </div>
          <button className="mt-2 w-full py-3 bg-[var(--primary-color)] text-black font-bold rounded-xl hover:opacity-80 transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
            Sign In
          </button>
        </div>
      </div>

      {/* General Preferences */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">General</h3>
        <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
          
          {/* Theme Selector */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                <i className="fa-solid fa-palette"></i>
              </div>
              <span className="font-medium text-slate-200">Appearance</span>
            </div>
            <div className="grid grid-cols-6 gap-2 sm:gap-4 pl-11">
               {THEMES.map((theme) => (
                 <button
                   key={theme.name}
                   onClick={() => onThemeChange(theme)}
                   className={`w-8 h-8 rounded-full border-2 transition-all duration-300 shadow-lg ${currentTheme === theme.name ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                   style={{ backgroundColor: theme.color, boxShadow: currentTheme === theme.name ? `0 0 10px ${theme.color}` : 'none' }}
                   title={theme.name}
                   aria-label={`Select ${theme.name} theme`}
                 />
               ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                <i className="fa-solid fa-language"></i>
              </div>
              <span className="font-medium text-slate-200">Language</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-sm">English</span>
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Community */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Community</h3>
        <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
          <button className="w-full flex items-center justify-between p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-pink-400">
                <i className="fa-solid fa-share-nodes"></i>
              </div>
              <span className="font-medium text-slate-200">Share OPTATV</span>
            </div>
            <i className="fa-solid fa-arrow-up-right-from-square text-xs text-slate-500"></i>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                <i className="fa-brands fa-twitter"></i>
              </div>
              <span className="font-medium text-slate-200">Follow Updates</span>
            </div>
            <i className="fa-solid fa-chevron-right text-xs text-slate-500"></i>
          </button>
        </div>
      </div>

      {/* Support & Legal */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Support & Legal</h3>
        <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
          <button 
            onClick={() => setActiveModal('tips')}
            className="w-full flex items-center justify-between p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-yellow-400">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <span className="font-medium text-slate-200">Tips & Tricks</span>
            </div>
            <i className="fa-solid fa-chevron-right text-xs text-slate-500"></i>
          </button>
          <button 
            onClick={() => setActiveModal('privacy')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-green-400">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <span className="font-medium text-slate-200">Privacy Policy</span>
            </div>
            <i className="fa-solid fa-chevron-right text-xs text-slate-500"></i>
          </button>
        </div>
      </div>

      <div className="text-center pt-8 pb-4">
        <p className="text-slate-600 font-display font-bold text-xl tracking-wider">OPTA<span className="text-[var(--primary-color)]">TV</span></p>
        <p className="text-xs text-slate-700 mt-1">Version 1.0.1 (Build 2025) by MENKIR</p>
      </div>

      {/* Modals */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-slate-900 border-t sm:border border-slate-800 w-full max-w-lg sm:rounded-2xl rounded-t-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-display font-bold text-white">
                {activeModal === 'tips' ? 'Tips & Tricks' : 'Privacy Policy'}
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {activeModal === 'privacy' && (
              <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-user-shield text-[var(--primary-color)]"></i> Data Collection
                  </h4>
                  <p>OPTATV prioritizes your anonymity. We do not require account registration for basic streaming. Any data collected (such as app preferences) is stored locally on your device unless you choose to sync via cloud sign-in.</p>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-up-right-from-square text-[var(--primary-color)]"></i> External Links
                  </h4>
                  <p>Our service provides access to third-party content (streaming sources, news feeds, statistical dashboards). These external sites operate independently. We are not responsible for their content or privacy practices. We recommend reviewing the policies of any external site you visit.</p>
                </div>

                 <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-cookie-bite text-[var(--primary-color)]"></i> Cookies & Local Storage
                  </h4>
                  <p>We use local storage technologies to remember your theme settings and preferred language. No tracking cookies are used for advertising purposes within the app interface.</p>
                </div>
                
                <p className="text-xs text-slate-500 text-center mt-8">Last Updated: January 2025</p>
              </div>
            )}

            {activeModal === 'tips' && (
              <div className="space-y-4">
                 <div className="flex gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center font-bold">1</div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Customize Your Vibe</h4>
                        <p className="text-slate-400 text-sm">Head to the General settings above to toggle between 6 neon themes. "Neon Green" is classic, but "Cyber Blue" offers great contrast for night viewing.</p>
                    </div>
                 </div>

                 <div className="flex gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center font-bold">2</div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Seamless Streaming</h4>
                        <p className="text-slate-400 text-sm">On the Live tab, the large "Stream Now" button always connects to the hottest match of the moment. Use the "Mini Apps" below it to visit official league sites for schedules.</p>
                    </div>
                 </div>

                 <div className="flex gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center font-bold">3</div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Deep Dive Stats</h4>
                        <p className="text-slate-400 text-sm">The OPTA tab links directly to "The Analyst". Open it in a new tab alongside the stream to watch the game and track xG (Expected Goals) in real-time.</p>
                    </div>
                 </div>

                 <div className="flex gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center font-bold">4</div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Install as App</h4>
                        <p className="text-slate-400 text-sm">For the best experience on mobile, tap "Share" then "Add to Home Screen" on your browser to use OPTATV like a native app.</p>
                    </div>
                 </div>
              </div>
            )}
            
            <button onClick={closeModal} className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
                Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StreamPlayer = ({ match }: { match: Match | null }) => {
  const [error, setError] = useState<string | null>(null);

  const displayMatch = match || HOT_MATCH;

  const handleWatchClick = () => {
    if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
        return;
    }
    setError(null);
    window.open(displayMatch.streamUrl || 'https://www.camel1.live/q/home/hotmatch', '_blank');
  };

  return (
    <div 
      className="relative w-full h-[65vh] bg-black group overflow-hidden border-b border-slate-800 transition-all duration-500"
    >
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0">
             {/* Floating Icons Background */}
             <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                <i className="fa-solid fa-futbol text-8xl text-slate-700 absolute top-10 left-[-20px] animate-float" style={{animationDelay: '0s'}}></i>
                <i className="fa-solid fa-trophy text-7xl text-slate-600 absolute bottom-32 right-[-20px] animate-float" style={{animationDelay: '2s'}}></i>
                <i className="fa-solid fa-signal text-9xl text-slate-800 absolute top-1/2 left-1/3 animate-float blur-sm" style={{animationDelay: '4s'}}></i>
                <i className="fa-solid fa-tv text-6xl text-slate-700 absolute top-20 right-10 animate-float" style={{animationDelay: '1s'}}></i>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-slate-900/30"></div>
            
            {/* Center Content Area */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
                 {error ? (
                    <div className="bg-red-900/20 backdrop-blur-md border border-red-500/30 p-6 rounded-2xl flex flex-col items-center animate-fade-in max-w-sm z-50">
                        <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500 mb-3"></i>
                        <h3 className="text-white font-bold mb-1">Connection Error</h3>
                        <p className="text-red-200 text-sm mb-4">{error}</p>
                        <button 
                            onClick={() => setError(null)}
                            className="py-2 px-6 rounded-lg bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 animate-pulse-fast flex flex-col items-center">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-color)] opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--primary-color)]"></span>
                                </span>
                                <span className="text-[var(--primary-color)] font-bold tracking-widest text-sm uppercase">Live Signal</span>
                            </div>
                            <h1 className="text-7xl font-display font-black tracking-tighter italic text-white filter drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                                OPTA<span className="text-[var(--primary-color)]">TV</span>
                            </h1>
                            <p className="text-slate-300 font-display uppercase tracking-widest text-sm mt-2">Global Football Coverage</p>
                        </div>
                        
                        {/* Integrated Match & Launch Card */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-fade-in relative overflow-hidden group/card transform transition-all duration-300 hover:border-[var(--primary-color)]/30 hover:bg-slate-900/60">
                            {/* Subtle Carbon Texture */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            
                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-white leading-none">Watch For Free</h2>
                                    <p className="text-slate-400 text-xs px-4">Stream all major competitions live in HD quality.</p>
                                </div>

                                {/* Main Action Button */}
                                <button 
                                    onClick={handleWatchClick}
                                    className="w-full py-5 bg-[var(--primary-color)] text-black font-black font-display text-2xl uppercase tracking-wider rounded-2xl hover:scale-105 hover:opacity-90 transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center gap-3 group-hover/card:shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)]"
                                >
                                    <i className="fa-solid fa-play text-xl"></i>
                                    <span>Stream Now</span>
                                </button>
                                
                                {/* Info Footer */}
                                <div className="flex items-center justify-center w-full text-[10px] text-slate-500 uppercase tracking-widest gap-4">
                                    <span className="flex items-center gap-1">
                                        <i className="fa-solid fa-globe"></i>
                                        All Regions
                                    </span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                    <span className="flex items-center gap-1">
                                        <i className="fa-solid fa-bolt"></i>
                                        Low Latency
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

const LeagueItem = ({ league, config, onClick, href }: any) => {
    const [imgError, setImgError] = useState(false);

    const Wrapper = href ? 'a' : 'button';
    const wrapperProps = href ? { href, target: "_blank", rel: "noopener noreferrer" } : { onClick };
    
    return (
        <Wrapper 
            {...wrapperProps}
            className="flex flex-col items-center gap-2 min-w-[80px] snap-start group"
        >
            <div className={`w-20 h-20 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {!imgError && config.logo ? (
                    <img 
                        src={config.logo} 
                        alt={league.name}
                        className={`w-12 h-12 object-contain relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] ${config.className || ''}`}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <i className={`fa-solid ${config.icon} text-3xl ${config.color} group-hover:text-white transition-colors relative z-10 drop-shadow-md`}></i>
                )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center group-hover:text-white transition-colors w-full truncate leading-tight">
                {league.name.replace(' League', '').replace('Champions', 'UCL')}
            </span>
        </Wrapper>
    )
};

const LeagueMiniApps = ({ leagues }: { leagues: readonly { readonly name: string }[] }) => {
    const getLeagueConfig = (name: string) => {
        switch(name) {
            case "Champions League": return { 
                bg: "from-blue-800 to-slate-900", 
                icon: "fa-star", 
                color: "text-blue-400", 
                border: "border-blue-500/30",
                logo: "https://upload.wikimedia.org/wikipedia/en/b/bf/UEFA_Champions_League_logo_2.svg" 
            };
            case "Premier League": return { 
                bg: "from-purple-800 to-slate-900", 
                icon: "fa-crown", 
                color: "text-purple-400", 
                border: "border-purple-500/30",
                logo: "https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg" 
            };
            case "La Liga": return { 
                bg: "from-orange-800 to-slate-900", 
                icon: "fa-futbol", 
                color: "text-orange-400", 
                border: "border-orange-500/30",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/LaLiga_logo_2023.svg/800px-LaLiga_logo_2023.svg.png"
            };
            case "Serie A": return { 
                bg: "from-cyan-800 to-slate-900", 
                icon: "fa-shield", 
                color: "text-cyan-400", 
                border: "border-cyan-500/30",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Serie_A_logo_2019.svg/800px-Serie_A_logo_2019.svg.png"
            };
            case "Bundesliga": return { 
                bg: "from-red-800 to-slate-900", 
                icon: "fa-person-running", 
                color: "text-red-400", 
                border: "border-red-500/30",
                logo: "https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg" 
            };
            case "Ligue 1": return { 
                bg: "from-lime-800 to-slate-900", 
                icon: "fa-certificate", 
                color: "text-lime-400", 
                border: "border-lime-500/30",
                logo: "https://upload.wikimedia.org/wikipedia/en/c/c2/Ligue_1_Logo.svg" 
            };
            case "MLS": return { 
                bg: "from-indigo-800 to-slate-900", 
                icon: "fa-flag-usa", 
                color: "text-indigo-400", 
                border: "border-indigo-500/30",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/MLS_crest_logo_RGB_gradient.svg/800px-MLS_crest_logo_RGB_gradient.svg.png"
            };
            default: return { bg: "from-slate-800 to-slate-900", icon: "fa-trophy", color: "text-slate-400", border: "border-slate-700", logo: null };
        }
    };

    return (
        <div className="flex overflow-x-auto no-scrollbar gap-4 px-6 mb-8 mt-2 snap-x">
            {leagues.map((league, idx) => {
                const config = getLeagueConfig(league.name);
                const bgClass = config.bg.startsWith('from-') ? `bg-gradient-to-br ${config.bg}` : config.bg;
                const fullConfig = { ...config, bg: bgClass };

                let linkUrl = null;
                if (league.name === "Champions League") linkUrl = "https://www.uefa.com/uefachampionsleague/";
                if (league.name === "Premier League") linkUrl = "https://www.premierleague.com/en/";
                if (league.name === "La Liga") linkUrl = "https://www.laliga.com/en-GB";
                if (league.name === "Serie A") linkUrl = "https://www.legaseriea.it/en";
                if (league.name === "Bundesliga") linkUrl = "https://www.bundesliga.com/en/bundesliga/table";
                if (league.name === "Ligue 1") linkUrl = "https://ligue1.com/en";
                if (league.name === "MLS") linkUrl = "https://www.mlssoccer.com/schedule/scores#competition=all&club=all&date=2025-11-30";

                return (
                    <LeagueItem 
                        key={idx}
                        league={league}
                        config={fullConfig}
                        href={linkUrl}
                    />
                );
            })}
        </div>
    );
};

const LiveTab = () => {
    return (
        <div className="pb-24 animate-fade-in">
            {/* Stream Player */}
            <StreamPlayer match={null} />

            {/* League Mini Apps */}
            <div className="mt-8">
                <h3 className="px-6 text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Competitions</h3>
                <LeagueMiniApps leagues={competitions} />
            </div>
        </div>
    );
};

const NewsTab = () => (
    <div className="h-full flex flex-col animate-fade-in p-6 pb-24 pt-24">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-display font-bold text-white">Headlines</h2>
        </div>

        {/* Featured News Link Card */}
        <div className="flex-1 relative rounded-3xl overflow-hidden group border border-slate-800 bg-slate-900">
            {/* Background Image */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504305754058-2f08ccd89a07?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="mb-auto pt-4 flex justify-end">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Live Feed
                    </span>
                </div>

                <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                            <i className="fa-brands fa-google text-slate-900 text-2xl"></i>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">Powered by</span>
                             <span className="text-lg font-display font-bold text-white leading-none">Google News</span>
                         </div>
                    </div>
                    
                    <h3 className="text-4xl font-display font-bold text-white leading-none drop-shadow-lg">
                        World Football<br/>
                        <span className="text-[var(--primary-color)]">News Hub</span>
                    </h3>
                    
                    <p className="text-slate-200 text-sm max-w-xs mb-4 font-medium drop-shadow-md">
                        Get breaking stories, live transfer updates, and in-depth match analysis from top sources around the globe.
                    </p>

                    <button
                        onClick={() => window.open("https://news.google.com/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNREoyZURRU0JXVnVMVWRDS0FBUAE?hl=en-ET&gl=ET&ceid=ET%3Aen", "_blank")}
                        className="w-full bg-[var(--primary-color)] text-black font-black font-display text-lg uppercase tracking-wider py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-3"
                    >
                        <span>Open News Feed</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const OptaTab = () => (
    <div className="h-full flex flex-col animate-fade-in p-6 pb-24 pt-24">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-display font-bold text-white">Statistics</h2>
        </div>

        {/* Featured Stats Link Card */}
        <div className="flex-1 relative rounded-3xl overflow-hidden group border border-slate-800 bg-slate-900">
            {/* Background Image - Data/Tech Theme */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-50 mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-blue-900/30 to-transparent"></div>
            
            {/* Animated Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-30"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="mb-auto pt-4 flex justify-end">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20 text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <i className="fa-solid fa-chart-line"></i>
                        Real-time Data
                    </span>
                </div>

                <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                            <i className="fa-solid fa-chart-pie text-black text-2xl"></i>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">Powered by</span>
                             <span className="text-lg font-display font-bold text-white leading-none">The Analyst</span>
                         </div>
                    </div>
                    
                    <h3 className="text-4xl font-display font-bold text-white leading-none drop-shadow-lg">
                        Elite Football<br/>
                        <span className="text-cyan-400">Intelligence</span>
                    </h3>
                    
                    <p className="text-slate-200 text-sm max-w-xs mb-4 font-medium drop-shadow-md">
                        Deep dive into advanced player metrics, team performance data, and predictive models across all major leagues.
                    </p>

                    <button
                        onClick={() => window.open("https://theanalyst.com/competition/premier-league", "_blank")}
                        className="w-full bg-cyan-500 text-black font-black font-display text-lg uppercase tracking-wider py-4 rounded-xl hover:bg-cyan-400 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-3"
                    >
                        <span>Launch Dashboard</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const App = () => {
    const [activeTab, setActiveTab] = useState<"live" | "news" | "opta" | "settings">("live");
    const [activeTheme, setActiveTheme] = useState(THEMES[0]);

    // Apply the selected theme to CSS variables on the root element
    useEffect(() => {
        document.documentElement.style.setProperty('--primary-color', activeTheme.color);
        document.documentElement.style.setProperty('--primary-rgb', activeTheme.rgb);
    }, [activeTheme]);

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Top Bar (Universal - Adaptive Style) */}
            <div className={`fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center transition-all duration-300 ${activeTab === 'live' ? 'bg-gradient-to-b from-black/90 to-transparent' : 'bg-black/90 backdrop-blur-md border-b border-white/5'}`}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[var(--primary-color)] rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">
                        <span className="text-black font-black font-display text-xl italic">O</span>
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight drop-shadow-md">OPTA<span className="text-[var(--primary-color)]">TV</span></span>
                </div>
                <button 
                    onClick={() => window.open('https://www.livescore.com/en/', '_blank')}
                    className="w-10 h-10 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-[var(--primary-color)] hover:text-black hover:border-[var(--primary-color)] transition-all duration-300 shadow-lg group relative"
                >
                    <i className="fa-solid fa-bell text-lg group-hover:scale-110 transition-transform"></i>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
            </div>

            {/* Main Content */}
            <main className="h-screen overflow-y-auto no-scrollbar">
                {activeTab === "live" && <LiveTab />}
                {activeTab === "news" && <NewsTab />}
                {activeTab === "opta" && <OptaTab />}
                {activeTab === "settings" && <SettingsTab currentTheme={activeTheme.name} onThemeChange={setActiveTheme} />}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 px-6 py-4 z-50">
                <div className="flex justify-between items-center max-w-lg mx-auto">
                    <button 
                        onClick={() => setActiveTab("live")}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "live" ? "text-[var(--primary-color)]" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <i className="fa-solid fa-tv text-xl"></i>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab("news")}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "news" ? "text-[var(--primary-color)]" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <i className="fa-regular fa-newspaper text-xl"></i>
                        <span className="text-[10px] font-bold uppercase tracking-wider">News</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab("opta")}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "opta" ? "text-[var(--primary-color)]" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <i className="fa-solid fa-chart-simple text-xl"></i>
                        <span className="text-[10px] font-bold uppercase tracking-wider">OPTA</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab("settings")}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "settings" ? "text-[var(--primary-color)]" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <i className="fa-solid fa-gear text-xl"></i>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);