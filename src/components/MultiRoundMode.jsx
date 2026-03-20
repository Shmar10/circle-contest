import React, { useState } from 'react';
import { calculateScore } from '../utils/scoring';
import { 
  Circle, Trophy, Plus, Flag, Printer, RotateCcw, 
  Trash2, AlertCircle, Sparkles, ArrowRight, ArrowLeft, Award, Crown
} from 'lucide-react';

export default function MultiRoundMode({ onBackToMenu }) {
  const [completedRounds, setCompletedRounds] = useState([]);
  const [currentRoundParticipants, setCurrentRoundParticipants] = useState([]);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [isFinalResultsRevealed, setIsFinalResultsRevealed] = useState(false);
  
  const [name, setName] = useState('');
  const [m1, setM1] = useState('');
  const [m2, setM2] = useState('');
  const [m3, setM3] = useState('');
  const [m4, setM4] = useState('');
  const [grade, setGrade] = useState('None');
  const [error, setError] = useState('');

  const handleAddParticipant = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a participant name.');
      return;
    }
    
    const measurements = [m1, m2, m3, m4];
    if (measurements.some(m => !m || isNaN(m) || Number(m) <= 0)) {
      setError('Please enter valid positive numbers for all 4 measurements.');
      return;
    }

    const score = calculateScore(m1, m2, m3, m4, grade);
    
    const newParticipant = {
      id: crypto.randomUUID(),
      name: name.trim(),
      score: score,
      timestamp: Date.now()
    };
    
    setCurrentRoundParticipants([...currentRoundParticipants, newParticipant]);
    
    setName('');
    setM1(''); setM2(''); setM3(''); setM4('');
    setGrade('None');
  };

  const handleDeleteParticipant = (id) => {
    setCurrentRoundParticipants(currentRoundParticipants.filter(p => p.id !== id));
  };

  const handleEndRound = () => {
    if (currentRoundParticipants.length === 0) {
       setError('You need at least one participant to end a round.');
       return;
    }
    
    const sorted = [...currentRoundParticipants].sort((a, b) => a.score - b.score);
    const winner = sorted[0];

    const newRound = {
      roundNumber: currentRoundNumber,
      participants: sorted,
      winner: winner
    };

    setCompletedRounds([...completedRounds, newRound]);
    setCurrentRoundParticipants([]);
    setCurrentRoundNumber(currentRoundNumber + 1);
    setError('');
  };

  const handleRevealFinalResults = () => {
    if (completedRounds.length === 0 && currentRoundParticipants.length === 0) {
      setError('No rounds have been completed yet!');
      return;
    }

    // Auto-commit the current round if it has participants
    if (currentRoundParticipants.length > 0) {
      const sorted = [...currentRoundParticipants].sort((a, b) => a.score - b.score);
      const winner = sorted[0];
      const newRound = {
        roundNumber: currentRoundNumber,
        participants: sorted,
        winner: winner
      };
      setCompletedRounds([...completedRounds, newRound]);
      setCurrentRoundParticipants([]);
    }

    setIsFinalResultsRevealed(true);
    setError('');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start a new event? All current data will be lost.')) {
      setCompletedRounds([]);
      setCurrentRoundParticipants([]);
      setCurrentRoundNumber(1);
      setIsFinalResultsRevealed(false);
      setName('');
      setM1(''); setM2(''); setM3(''); setM4('');
      setGrade('None');
      setError('');
    }
  };

  const handlePrint = () => window.print();

  const handleOpenCertificate = (winnerName, score) => {
    const url = `/?view=certificate&name=${encodeURIComponent(winnerName)}&score=${encodeURIComponent(score)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Compute Grand Champion
  let grandChampion = null;
  if (isFinalResultsRevealed && completedRounds.length > 0) {
    let allParticipants = [];
    completedRounds.forEach(r => allParticipants.push(...r.participants));
    allParticipants.sort((a, b) => a.score - b.score);
    grandChampion = allParticipants[0];
  }

  const currentRoundSorted = [...currentRoundParticipants].sort((a, b) => a.score - b.score);

  return (
    <div className="min-h-screen relative overflow-hidden pb-12">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-teal-500/20 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <header className="sticky top-0 z-50 glass-panel border-b border-white/20 shadow-sm print:hidden animate-slide-up stagger-1">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToMenu}
              className="p-2 mr-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300"
              title="Back to Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="group cursor-pointer flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-tr from-emerald-600 to-teal-600 p-2.5 rounded-xl text-white shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 animate-rotate-slow" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
                  Perfect Circle
                </h1>
                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
                  <Trophy className="w-3 h-3" /> Classroom Event
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto items-center">
            {!isFinalResultsRevealed && (
               <div className="mr-4 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 inline-flex items-center gap-2">
                 Round {currentRoundNumber}
               </div>
            )}
            {isFinalResultsRevealed && (
              <>
                {grandChampion && (
                  <button onClick={() => handleOpenCertificate(grandChampion.name, grandChampion.score)} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl transition-all shadow-sm text-sm font-bold">
                    <Award className="w-4 h-4" /> Grand Champion Certificate
                  </button>
                )}
                <button onClick={handlePrint} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 rounded-xl transition-all shadow-sm text-sm font-semibold">
                  <Printer className="w-4 h-4" /> Print Results
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10 w-full animate-slide-up stagger-2">
        {error && (
          <div className="mb-6 p-3 bg-red-50/90 dark:bg-red-900/20 backdrop-blur-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center gap-3 rounded-xl shadow-lg print:hidden animate-slide-up">
            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {isFinalResultsRevealed ? (
          /* ==================================
             FINAL RESULTS VIEW
             ================================== */
          <div className="space-y-8 animate-slide-up stagger-3">
             {grandChampion && (
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-1 shadow-2xl scale-[1.02] transform transition-transform">
                  <div className="bg-white dark:bg-slate-900 rounded-[22px] px-8 py-10 text-center relative overflow-hidden h-full flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-400/10 to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                      <Crown className="w-20 h-20 text-amber-500 mx-auto mb-4 drop-shadow-md animate-bounce-slow" />
                      <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-amber-600 mb-2">Overall Grand Champion</h2>
                      <h3 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 mb-4 truncate max-w-[90vw]">
                        {grandChampion.name}
                      </h3>
                      <p className="text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto">
                        Achieved the absolute lowest error margin across all rounds!
                      </p>
                      <div className="mt-6 inline-block bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-8 py-3 shadow-inner">
                        <span className="text-sm font-bold tracking-widest text-amber-700 dark:text-amber-500 uppercase block mb-1">Winning Score</span>
                        <span className="text-4xl font-mono font-black text-amber-600">{grandChampion.score.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
             )}

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedRounds.map((round) => (
                  <div key={round.roundNumber} className="glass-panel p-6 rounded-2xl relative border-2 border-emerald-500/20 hover:border-emerald-500/50 shadow-lg">
                    <h3 className="text-lg font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-4 border-b-2 border-emerald-100 dark:border-emerald-900/50 pb-2">
                      Round {round.roundNumber} Winner
                    </h3>
                    <div className="flex flex-col gap-2">
                       <span className="text-3xl font-bold text-slate-800 dark:text-white truncate" title={round.winner.name}>
                          {round.winner.name}
                       </span>
                       <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Error: {round.winner.score.toFixed(2)}%</span>
                    </div>
                    
                    <button 
                       onClick={() => handleOpenCertificate(round.winner.name, round.winner.score)}
                       className="mt-6 w-full py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-800 transition-colors rounded-xl flex justify-center items-center gap-2 font-semibold text-sm"
                    >
                      <Award className="w-4 h-4" /> Class Certificate
                    </button>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                       <details className="text-sm text-slate-500 cursor-pointer marker:text-emerald-500">
                          <summary className="font-semibold hover:text-slate-700 dark:hover:text-slate-300">Show All {round.participants.length} Participants</summary>
                          <div className="mt-2 max-h-40 overflow-y-auto pr-2 space-y-1">
                             {round.participants.map((p, i) => (
                               <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                  <span className="truncate pr-2"><span className="text-xs text-slate-400 mr-2 md:mr-1">#{i+1}</span>{p.name}</span>
                                  <span className="font-mono">{p.score.toFixed(2)}%</span>
                               </div>
                             ))}
                          </div>
                       </details>
                    </div>
                  </div>
                ))}
             </div>

             <div className="flex justify-center mt-12 print:hidden pb-12">
               <button onClick={handleReset} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center gap-2">
                 <RotateCcw className="w-5 h-5" /> Start New Classroom Event
               </button>
             </div>
          </div>
        ) : (
          /* ==================================
             ACTIVE ROUND ENTRY VIEW
             ================================== */
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Left Column: Entry Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel rounded-2xl p-5 md:p-6 print:hidden">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-lg">
                      <Plus className="w-4 h-4" />
                    </div>
                    New Participant (Round {currentRoundNumber})
                  </h2>
                </div>
                
                <form onSubmit={handleAddParticipant} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Participant Name</label>
                    <input 
                      type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Leonardo"
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Diameters</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'D1: Horizontal', val: m1, setter: setM1, placeholder: 'D1' },
                        { label: 'D2: Vertical', val: m2, setter: setM2, placeholder: 'D2' },
                        { label: 'D3: Diagonal 1', val: m3, setter: setM3, placeholder: 'D3' },
                        { label: 'D4: Diagonal 2', val: m4, setter: setM4, placeholder: 'D4' }
                      ].map((field, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold uppercase">{field.placeholder}</div>
                          <input type="number" step="any" value={field.val} onChange={(e) => field.setter(e.target.value)} className="w-full pl-10 pr-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Smoothness Grade</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { g: 'None', desc: 'No Grade', col: 'slate' },
                        { g: 'A', desc: '-0.5%', col: 'green' },
                        { g: 'B', desc: '+0.5%', col: 'blue' },
                        { g: 'C', desc: '+1.0%', col: 'yellow' },
                        { g: 'D', desc: '+1.5%', col: 'red' }
                      ].map(({g, desc, col}) => {
                        const isSelected = grade === g;
                        return (
                          <button key={g} type="button" onClick={() => setGrade(g)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all 
                              ${isSelected ? `border-${col}-500 bg-${col}-50 text-${col}-700 scale-[1.02]` : 'border-slate-200 hover:bg-white text-slate-500'}`}
                          >
                            <span className="text-xl font-bold">{g === 'None' ? '—' : g}</span>
                            <span className="text-[10px] sm:block hidden">{desc}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-200/50 mt-4">
                    <button type="submit" className="bg-slate-900 text-white w-full py-3 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" /> Add Score
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Right Column: Leaderboards */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Leaderboard for Current Round */}
              <div className="bg-white/80 border shadow-sm rounded-2xl overflow-hidden shadow-xl flex flex-col flex-1 max-h-[500px]">
                <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live Standings - Round {currentRoundNumber}
                  </h2>
                </div>
                <div className="overflow-y-auto flex-1 p-0">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="px-5 py-3 w-16 text-center">Rank</th>
                        <th className="px-5 py-3">Participant</th>
                        <th className="px-5 py-3 text-right">Margin of Error</th>
                        <th className="px-5 py-3 w-12 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentRoundParticipants.length === 0 ? (
                        <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500 italic">No one has competed in this round yet...</td></tr>
                      ) : (
                        currentRoundSorted.map((p, index) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className={`px-5 py-3 font-bold text-center ${index === 0 ? 'text-amber-500 text-xl' : 'text-slate-600'}`}>
                              {index === 0 ? '1' : index + 1}
                            </td>
                            <td className="px-5 py-3 font-bold text-slate-900">{p.name}</td>
                            <td className="px-5 py-3 text-right">
                              <span className={`px-2.5 py-1 rounded-full font-black text-sm shadow-sm border ${index === 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-700 border-slate-200'}`}>
                                {p.score.toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => handleDeleteParticipant(p.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4"/></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Round Controls */}
                <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between gap-4">
                   <button 
                     onClick={handleEndRound} 
                     disabled={currentRoundParticipants.length === 0}
                     className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
                   >
                     End Round & Start Next <ArrowRight className="w-5 h-5 inline" />
                   </button>
                   
                   <button 
                     onClick={handleRevealFinalResults}
                     disabled={completedRounds.length === 0 && currentRoundParticipants.length === 0}
                     className="flex-1 border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                   >
                     <Flag className="w-5 h-5 inline mr-1" /> End Event & Reveal Winners
                   </button>
                </div>
              </div>

              {/* Summary of Completed Rounds (Preview) */}
              {completedRounds.length > 0 && (
                 <div className="glass-panel rounded-2xl p-5 shadow-sm border border-slate-200/50 flex flex-col pt-4 pb-0">
                    <h3 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-3 border-b border-slate-200 pb-2">Completed Rounds ({completedRounds.length})</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                       {completedRounds.map((r, i) => (
                          <div key={i} className="min-w-[160px] max-w-[200px] flex-shrink-0 bg-white/60 p-3 rounded-xl border border-slate-200 flex flex-col gap-1">
                            <span className="text-xs font-bold text-emerald-600 uppercase">Round {r.roundNumber}</span>
                            <span className="font-bold text-slate-800 truncate" title={r.winner.name}>{r.winner.name}</span>
                            <span className="text-xs font-mono font-medium text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">({r.winner.score.toFixed(2)}%)</span>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
