import React, { useState, useEffect } from 'react';
import { 
  Circle, 
  Trophy, 
  Plus, 
  Flag, 
  Download, 
  Printer, 
  RotateCcw, 
  Trash2, 
  Medal,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [participants, setParticipants] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [m1, setM1] = useState('');
  const [m2, setM2] = useState('');
  const [m3, setM3] = useState('');
  const [m4, setM4] = useState('');
  const [grade, setGrade] = useState('A');
  const [error, setError] = useState('');

  // Calculate score based on Average Absolute Deviation as a percentage
  const calculateScore = (d1, d2, d3, d4, selectedGrade) => {
    const measurements = [d1, d2, d3, d4].map(Number);
    const mean = measurements.reduce((a, b) => a + b, 0) / 4;
    
    if (mean === 0) return 0; // Prevent division by zero
    
    // Find how much each measurement deviates from the average
    const totalDeviation = measurements.reduce((sum, val) => sum + Math.abs(val - mean), 0);
    const avgDeviation = totalDeviation / 4;
    
    // Calculate the error as a percentage of the mean (Lower is better, 0 is perfect)
    let errorPercentage = (avgDeviation / mean) * 100;

    // Apply visual grade penalty/bonus
    switch (selectedGrade) {
      case 'A': errorPercentage -= 0.5; break;
      case 'B': errorPercentage += 0.5; break;
      case 'C': errorPercentage += 1.0; break;
      case 'D': errorPercentage += 1.5; break;
      default: break;
    }

    // Prevent negative error scores (a perfect circle is 0%)
    errorPercentage = Math.max(0, errorPercentage);

    return Number(errorPercentage.toFixed(2));
  };

  const handleAddParticipant = (e) => {
    e.preventDefault();
    setError('');

    // Validation
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
      measurements: measurements.map(Number),
      grade: grade,
      score: score,
      timestamp: Date.now()
    };

    setParticipants([...participants, newParticipant]);
    
    // Reset form
    setName('');
    setM1('');
    setM2('');
    setM3('');
    setM4('');
    setGrade('A');
  };

  const handleDelete = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleFinish = () => {
    if (participants.length === 0) {
      setError('Add at least one participant before finishing.');
      return;
    }
    
    // Sort by score ascending (lowest error wins)
    const sorted = [...participants].sort((a, b) => a.score - b.score);
    setParticipants(sorted);
    setIsFinished(true);
    setError('');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start a new competition? All current data will be lost.')) {
      setParticipants([]);
      setIsFinished(false);
      setName('');
      setM1('');
      setM2('');
      setM3('');
      setM4('');
      setGrade('A');
      setError('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = "Rank,Participant Name,Measurement 1,Measurement 2,Measurement 3,Measurement 4,Visual Grade,Final Error %\n";
    const rows = participants.map((p, index) => 
      `${index + 1},"${p.name}",${p.measurements[0]},${p.measurements[1]},${p.measurements[2]},${p.measurements[3]},${p.grade},${p.score}%`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "perfect_circle_results.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      
      {/* Decorative Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-fuchsia-500/20 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/20 shadow-sm print:hidden animate-slide-up stagger-1">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 group cursor-pointer">
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
                <Sparkles className="w-3 h-3" /> Challenge
              </p>
            </div>
          </div>
          
          {isFinished && (
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={handlePrint} 
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 rounded-xl transition-all shadow-sm hover:shadow-md text-sm font-semibold backdrop-blur-sm"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button 
                onClick={handleExportCSV} 
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 dark:hover:from-indigo-800/50 dark:hover:to-purple-800/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-700/50 rounded-xl transition-all shadow-sm hover:shadow-md text-sm font-semibold"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10 w-full animate-slide-up stagger-2">
        
        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50/90 dark:bg-red-900/20 backdrop-blur-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center gap-3 rounded-xl shadow-lg shadow-red-500/5 print:hidden animate-slide-up">
            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            </div>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Input Section - Hidden when finished */}
        {!isFinished && (
          <div className="glass-panel rounded-2xl p-6 md:p-8 mb-10 print:hidden relative overflow-hidden group">
            {/* Subtle highlight border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                New Participant
              </h2>
            </div>
            
            <form onSubmit={handleAddParticipant} className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Participant Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Leonardo da Vinci"
                  className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Diameters (cm or inches)</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'D1: Horizontal', val: m1, setter: setM1, placeholder: 'D1' },
                    { label: 'D2: Vertical', val: m2, setter: setM2, placeholder: 'D2' },
                    { label: 'D3: Diagonal 1', val: m3, setter: setM3, placeholder: 'D3' },
                    { label: 'D4: Diagonal 2', val: m4, setter: setM4, placeholder: 'D4' }
                  ].map((field, idx) => (
                    <div key={idx} className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-xs font-bold uppercase tracking-wider">
                        {field.placeholder}
                      </div>
                      <input 
                        type="number" 
                        step="any"
                        value={field.val}
                        onChange={(e) => field.setter(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium shadow-inner hover:bg-white dark:hover:bg-slate-900"
                        title={field.label}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Visual Smoothness Grade</label>
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                  {[
                    { g: 'A', desc: '-0.5% (Bonus)', col: 'green' },
                    { g: 'B', desc: '+0.5% (Penalty)', col: 'blue' },
                    { g: 'C', desc: '+1.0% (Penalty)', col: 'yellow' },
                    { g: 'D', desc: '+1.5% (Penalty)', col: 'red' }
                  ].map(({g, desc, col}) => {
                    const isSelected = grade === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        className={`relative flex flex-col items-center justify-center p-3 md:py-4 rounded-xl font-bold transition-all border-2 overflow-hidden
                          ${isSelected 
                            ? `border-${col}-500 bg-${col}-50/80 dark:bg-${col}-900/20 text-${col}-700 dark:text-${col}-400 shadow-[0_0_15px_rgba(0,0,0,0.05)] shadow-${col}-500/20 scale-[1.02] z-10` 
                            : 'bg-white/40 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                      >
                        {isSelected && <div className={`absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5`}></div>}
                        <span className="text-2xl md:text-3xl relative z-10">{g}</span>
                        <span className={`text-[10px] md:text-xs mt-1 font-medium relative z-10 hidden sm:block ${isSelected ? `text-${col}-600 dark:text-${col}-300` : 'opacity-60'}`}>{desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-slate-700/50 relative">
                <button 
                  type="submit" 
                  className="relative overflow-hidden group/btn bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-xl font-semibold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Calculate Score
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Results / Leaderboard Section */}
        <div className={`rounded-2xl shadow-xl border overflow-hidden transition-all duration-700 animate-slide-up stagger-3
          ${isFinished 
            ? 'glass-panel border-white/40 dark:border-slate-700/40 ring-1 ring-black/5 dark:ring-white/5' 
            : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative z-0'
          }`}
        >
          {isFinished && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>
          )}
          
          <div className="px-6 py-6 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-wrap gap-4 items-center justify-between relative bg-white/40 dark:bg-slate-800/40 backdrop-blur-md">
            <h2 className={`text-2xl font-bold flex items-center gap-3 tracking-tight
              ${isFinished ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>
              <div className={`p-2 rounded-xl shadow-inner ${isFinished ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Trophy className={`w-6 h-6 ${isFinished ? 'text-amber-500' : 'text-slate-400'}`} />
              </div>
              {isFinished ? 'Final Leaderboard' : 'Live Standings'}
            </h2>
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-lg shadow-inner">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 px-3 py-1">
                {participants.length} Entry{participants.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-700/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 w-20">Rank</th>
                  <th className="px-6 py-4">Participant</th>
                  <th className="px-6 py-4 hidden md:table-cell">Measurements</th>
                  <th className="px-6 py-4 text-center">Grade</th>
                  <th className="px-6 py-4 text-right">Error Rate</th>
                  {!isFinished && <th className="px-6 py-4 w-16 text-right print:hidden"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-slate-50/30 dark:bg-slate-900/30"></div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 mb-4 rounded-full border-4 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center animate-rotate-slow">
                          <Circle className="w-8 h-8 text-slate-400 opacity-50" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Waiting for the first masterpiece...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  participants.map((p, index) => {
                    // Pre-sort visually even if not finished, to show live standings accurately
                    const sortedIndex = [...participants].sort((a,b) => a.score - b.score).findIndex(x => x.id === p.id);
                    const displayRank = isFinished ? index : sortedIndex;
                    
                    return (
                    <tr 
                      key={p.id} 
                      className={`group transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-800/40
                        ${isFinished && index === 0 ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''}
                      `}
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                         <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                          {displayRank === 0 ? <Medal className="w-6 h-6 text-amber-500 drop-shadow-sm" /> :
                           displayRank === 1 ? <Medal className="w-6 h-6 text-slate-400 drop-shadow-sm" /> :
                           displayRank === 2 ? <Medal className="w-6 h-6 text-orange-600 drop-shadow-sm" /> :
                           <span className="ml-1 w-6 text-center text-slate-400 dark:text-slate-500 opacity-70">#{displayRank + 1}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-900 dark:text-white lg:text-lg">
                        {p.name}
                        {isFinished && index === 0 && (
                          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 uppercase tracking-wider animate-pulse-slow">
                            Winner
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {p.measurements.map((m, i) => (
                            <span key={i} className="px-2 py-1 text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold shadow-inner 
                          bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          {p.grade}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className={`inline-flex items-center justify-center px-3 md:px-4 py-1.5 rounded-full font-black text-sm md:text-base tracking-tight shadow-sm border
                            ${p.score <= 2 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 
                              p.score <= 5 ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' : 
                              p.score <= 10 ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-800' : 
                              'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'}`}
                          >
                            {p.score.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      {!isFinished && (
                        <td className="px-6 py-5 text-right print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all p-2 rounded-lg"
                            title="Remove participant"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex justify-center print:hidden animate-slide-up stagger-4">
          {!isFinished ? (
            <button 
              onClick={handleFinish}
              disabled={participants.length === 0}
              className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 text-white px-10 py-4 rounded-full font-bold text-lg shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] disabled:shadow-none hover:shadow-[0_10px_40px_-5px_rgba(16,185,129,0.6)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed group"
            >
              <Flag className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Reveal Final Results
            </button>
          ) : (
            <button 
              onClick={handleReset}
              className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              <RotateCcw className="w-6 h-6" />
              Start New Challenge
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 w-full text-center text-slate-400 dark:text-slate-600 text-xs font-medium tracking-wide">
        Perfect Circle Challenge Engine &bull; Developed by Shmar10
      </footer>
      
      {/* Print Footer */}
      <div className="hidden print:block fixed bottom-0 left-0 w-full text-center py-4 text-slate-500 text-xs font-mono font-medium border-t border-slate-200 mt-8">
        Official Results &bull; Generated on {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
