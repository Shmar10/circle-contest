import React, { useState } from 'react';
import { calculateScore, getAverageScore } from '../utils/scoring';
import { 
  Circle, Trophy, Plus, Flag, Download, Printer, RotateCcw, 
  Trash2, Medal, AlertCircle, Sparkles, ArrowRight, ArrowLeft, Award
} from 'lucide-react';

export default function ChallengeMode({ onBackToMenu }) {
  const [participants, setParticipants] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  
  const [name, setName] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [m1, setM1] = useState('');
  const [m2, setM2] = useState('');
  const [m3, setM3] = useState('');
  const [m4, setM4] = useState('');
  const [grade, setGrade] = useState('None');
  const [error, setError] = useState('');

  const handleAddParticipant = (e) => {
    e.preventDefault();
    setError('');

    if (currentRound === 1 && !name.trim()) {
      setError('Please enter a participant name.');
      return;
    }
    if (currentRound > 1 && !selectedParticipantId) {
      setError('Please select a participant.');
      return;
    }
    
    const measurements = [m1, m2, m3, m4];
    if (measurements.some(m => !m || isNaN(m) || Number(m) <= 0)) {
      setError('Please enter valid positive numbers for all 4 measurements.');
      return;
    }

    const score = calculateScore(m1, m2, m3, m4, grade);
    const newRoundData = {
      measurements: measurements.map(Number),
      grade: grade,
      score: score
    };

    if (currentRound === 1) {
      const newParticipant = {
        id: crypto.randomUUID(),
        name: name.trim(),
        rounds: [newRoundData],
        timestamp: Date.now()
      };
      setParticipants([...participants, newParticipant]);
    } else {
      setParticipants(participants.map(p => {
        if (p.id === selectedParticipantId) {
          return { ...p, rounds: [...p.rounds, newRoundData] };
        }
        return p;
      }));
    }
    
    setName('');
    setSelectedParticipantId('');
    setM1(''); setM2(''); setM3(''); setM4('');
    setGrade('None');
  };

  const handleDelete = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleFinish = () => {
    if (participants.length === 0) {
      setError('Add at least one participant before finishing.');
      return;
    }
    setIsFinished(true);
    setError('');
  };

  const handleNextRound = () => {
    setCurrentRound(prev => prev + 1);
    setSelectedParticipantId('');
    setM1(''); setM2(''); setM3(''); setM4(''); setGrade('None'); setError('');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start a new challenge? All current data will be lost.')) {
      setParticipants([]);
      setIsFinished(false);
      setCurrentRound(1);
      setName('');
      setSelectedParticipantId('');
      setM1(''); setM2(''); setM3(''); setM4('');
      setGrade('None');
      setError('');
    }
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    let headers = "Rank,Participant Name,";
    for (let i = 1; i <= currentRound; i++) {
       headers += `R${i} Error %,`;
    }
    headers += "Average Error %\n";

    const sortedParticipants = [...participants].sort((a, b) => getAverageScore(a.rounds) - getAverageScore(b.rounds));
    const rows = sortedParticipants.map((p, index) => {
      let row = `${index + 1},"${p.name}",`;
      for (let i = 0; i < currentRound; i++) {
        row += p.rounds[i] ? `${p.rounds[i].score}%` + "," : ",";
      }
      row += `${getAverageScore(p.rounds).toFixed(2)}%`;
      return row;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "perfect_circle_results.csv";
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedParticipants = [...participants].sort((a,b) => getAverageScore(a.rounds) - getAverageScore(b.rounds));
  const participantsNeedingScores = participants.filter(p => p.rounds.length < currentRound);
  const allCompletedCurrentRound = participants.length > 0 && participantsNeedingScores.length === 0;

  const handleOpenCertificate = () => {
    const winner = sortedParticipants[0];
    const score = getAverageScore(winner.rounds);
    const url = `/?view=certificate&name=${encodeURIComponent(winner.name)}&score=${encodeURIComponent(score)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-12">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-fuchsia-500/20 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <header className="sticky top-0 z-50 glass-panel border-b border-white/20 shadow-sm print:hidden animate-slide-up stagger-1">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
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
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-xl text-white shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <Circle className="w-6 h-6 animate-rotate-slow" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
                  Perfect Circle
                </h1>
                <p className="text-xs font-semibold text-indigo-500 flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Challenge Mode
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <div className="mr-4 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
              Round {currentRound}
            </div>
            {isFinished && (
              <>
                <button onClick={handleOpenCertificate} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl transition-all shadow-sm text-sm font-bold">
                  <Award className="w-4 h-4" /> Certificate
                </button>
                <button onClick={handlePrint} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 rounded-xl transition-all shadow-sm text-sm font-semibold">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={handleExportCSV} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl transition-all shadow-sm text-sm font-semibold">
                  <Download className="w-4 h-4" /> Export
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 relative z-10 w-full animate-slide-up stagger-2">
        {error && (
          <div className="mb-6 p-3 bg-red-50/90 dark:bg-red-900/20 backdrop-blur-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center gap-3 rounded-xl shadow-lg print:hidden animate-slide-up">
            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {!isFinished && (
          <div className="glass-panel rounded-2xl p-5 md:p-6 mb-8 print:hidden relative overflow-hidden group">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg">
                  <Plus className="w-4 h-4" />
                </div>
                {currentRound === 1 ? 'New Participant' : `Enter Score - Round ${currentRound}`}
              </h2>
              {currentRound > 1 && participantsNeedingScores.length > 0 && (
                <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                  {participantsNeedingScores.length} remaining
                </span>
              )}
            </div>
            
            {currentRound > 1 && participantsNeedingScores.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                All participants have completed Round {currentRound}!<br/>
                Reveal the final results or start the next round below.
              </div>
            ) : (
              <form onSubmit={handleAddParticipant} className="space-y-5">
                <div>
                  {currentRound === 1 ? (
                    <>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Participant Name</label>
                      <input 
                        type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Leonardo"
                        className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                      />
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Select Participant</label>
                      <select 
                        value={selectedParticipantId} onChange={(e) => setSelectedParticipantId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-300 appearance-none"
                      >
                        <option value="">-- Choose Participant --</option>
                        {participantsNeedingScores.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Diameters (cm or inches)</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'D1: Horizontal', val: m1, setter: setM1, placeholder: 'D1' },
                      { label: 'D2: Vertical', val: m2, setter: setM2, placeholder: 'D2' },
                      { label: 'D3: Diagonal 1', val: m3, setter: setM3, placeholder: 'D3' },
                      { label: 'D4: Diagonal 2', val: m4, setter: setM4, placeholder: 'D4' }
                    ].map((field, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-xs font-bold uppercase">{field.placeholder}</div>
                        <input type="number" step="any" value={field.val} onChange={(e) => field.setter(e.target.value)} className="w-full pl-12 pr-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Visual Smoothness Grade <span className="font-normal">(Optional)</span></label>
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
                  <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Calculate Score
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className={`rounded-2xl shadow-xl overflow-hidden transition-all ${isFinished ? 'glass-panel ring-1 ring-black/5' : 'bg-white/80 border shadow-sm'}`}>
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {isFinished ? 'Final Leaderboard' : 'Live Standings'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3 w-16">Rank</th>
                  <th className="px-5 py-3">Participant</th>
                  {Array.from({ length: currentRound }).map((_, i) => (
                     <th key={i} className="px-4 py-3 text-center">R{i + 1}</th>
                  ))}
                  <th className="px-5 py-3 text-right">Avg Error</th>
                  {!isFinished && currentRound === 1 && <th className="px-5 py-3 w-12 text-right opacity-0 hover:opacity-100 transition-opacity"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.length === 0 ? (
                  <tr><td colSpan={4 + currentRound} className="px-5 py-8 text-center text-slate-500">Waiting for players...</td></tr>
                ) : (
                  sortedParticipants.map((p, index) => {
                    const avgScore = getAverageScore(p.rounds);
                    return (
                    <tr key={p.id} className={`${isFinished && index === 0 ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-5 py-3 font-bold text-slate-700">#{index + 1}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{p.name}</td>
                      {Array.from({ length: currentRound }).map((_, i) => (
                        <td key={i} className="px-4 py-3 text-center">
                          {p.rounds[i] ? (
                            <span className="px-2 py-0.5 rounded-md font-mono text-xs border bg-slate-50 text-slate-700">
                              {p.rounds[i].score.toFixed(2)}%
                            </span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                      ))}
                      <td className="px-5 py-3 text-right">
                        <span className="px-2.5 py-1 rounded-full font-black text-sm shadow-sm border bg-slate-50 text-slate-700">
                          {avgScore.toFixed(2)}%
                        </span>
                      </td>
                      {!isFinished && currentRound === 1 && (
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      )}
                    </tr>
                  )}))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          {!isFinished ? (
            <>
              {allCompletedCurrentRound && (
                <button onClick={handleNextRound} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all">
                  Start Round {currentRound + 1} <ArrowRight className="w-5 h-5 inline" />
                </button>
              )}
              <button disabled={participants.length === 0} onClick={handleFinish} className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all">
                <Flag className="w-5 h-5 inline mr-2" /> Reveal Final Results
              </button>
            </>
          ) : (
            <button onClick={handleReset} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all">
              <RotateCcw className="w-5 h-5 inline mr-2" /> Start New Challenge
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
