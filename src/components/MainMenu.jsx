import React from 'react';
import { Circle, Swords, ArrowRight, Sparkles } from 'lucide-react';

export default function MainMenu({ onSelectMode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pb-12 p-4">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-fuchsia-500/20 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-3xl w-full z-10 glass-panel p-8 md:p-12 rounded-3xl border border-white/20 shadow-2xl animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-xl mb-6 shadow-indigo-500/30">
            <Circle className="w-10 h-10 text-white animate-rotate-slow" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight mb-4">
            Perfect Circle
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Choose your competition mode
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 relative z-10">
          {/* Challenge Mode Button */}
          <button 
            onClick={() => onSelectMode('challenge')}
            className="group relative flex flex-col items-start p-6 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-2 border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-500 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl mb-4 group-hover:scale-110 transition-transform shadow-inner">
              <Circle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Grand Prix Challenge</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow">A multi-round endurance test. Accumulate the lowest average error over several draws to win.</p>
            <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              Start Mode <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Bracket Mode Button */}
          <button 
            onClick={() => onSelectMode('bracket')}
            className="group relative flex flex-col items-start p-6 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-2 border-slate-200/50 dark:border-slate-700/50 hover:border-amber-500 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl mb-4 group-hover:scale-110 transition-transform shadow-inner">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Head-to-Head Bracket</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow">A single-elimination tournament. Face off 1v1 and advance through the bracket to claim victory!</p>
            <div className="flex items-center text-amber-600 dark:text-amber-400 font-bold text-sm">
              Start Mode <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
