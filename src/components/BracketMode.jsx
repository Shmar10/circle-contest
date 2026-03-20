import React, { useState } from 'react';
import { ArrowLeft, Swords, Trophy, Users, Plus, Circle, Award } from 'lucide-react';
import { calculateScore } from '../utils/scoring';

export default function BracketMode({ onBackToMenu }) {
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState('');
  
  const [isSetup, setIsSetup] = useState(true);
  const [matches, setMatches] = useState([]);
  const [activeMatchPos, setActiveMatchPos] = useState(null);

  const [p1Inputs, setP1Inputs] = useState({ m1: '', m2: '', m3: '', m4: '', grade: 'None' });
  const [p2Inputs, setP2Inputs] = useState({ m1: '', m2: '', m3: '', m4: '', grade: 'None' });
  const [error, setError] = useState('');

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    setPlayers([...players, { id: crypto.randomUUID(), name: playerName.trim() }]);
    setPlayerName('');
    setError('');
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const startTournament = () => {
    if (players.length < 2) {
      setError('Please add at least 2 players to start a tournament.');
      return;
    }
    
    const numPlayers = players.length;
    const numRounds = Math.max(1, Math.ceil(Math.log2(numPlayers)));
    const nextPowerOf2 = Math.pow(2, numRounds);
    const numMatchesRound1 = nextPowerOf2 / 2;

    const shuffled = [...players].sort(() => Math.random() - 0.5);
    
    const initialMatches = [];
    
    // Setup Round 1
    const round1Matches = [];
    for (let i = 0; i < numMatchesRound1; i++) {
        const p1 = shuffled[i];
        const p2Index = numMatchesRound1 + i;
        const p2 = p2Index < numPlayers ? shuffled[p2Index] : null;

        round1Matches.push({
            id: `r0m${i}`, roundIndex: 0, matchIndex: i,
            p1, p2,
            p1Score: null, p2Score: null,
            winner: p2 === null ? p1 : null // BYE handling
        });
    }
    initialMatches.push(round1Matches);

    // Setup subsequent rounds
    for (let r = 1; r < numRounds; r++) {
      const roundMatches = [];
      const numMatchesInRound = nextPowerOf2 / Math.pow(2, r + 1);
      
      for (let m = 0; m < numMatchesInRound; m++) {
        // If from the previous round BOTH matches were byes (which shouldn't happen with our logic), propagate winners
        const prevMatch1 = initialMatches[r-1][m * 2];
        const prevMatch2 = initialMatches[r-1][m * 2 + 1];

        // Ensure byes cascade through setup if needed
        const p1 = prevMatch1.winner; 
        const p2 = prevMatch2.winner;

        roundMatches.push({
          id: `r${r}m${m}`, roundIndex: r, matchIndex: m,
          p1, p2,
          p1Score: null, p2Score: null,
          winner: (p1 !== null && p2 === null) ? p1 : (p2 !== null && p1 === null) ? p2 : null
        });
      }
      initialMatches.push(roundMatches);
    }
    
    setMatches(initialMatches);

    // Find first active match
    let firstActive = null;
    for (let r = 0; r < numRounds; r++) {
      for (let m = 0; m < initialMatches[r].length; m++) {
        const match = initialMatches[r][m];
        if (match.p1 && match.p2 && match.winner === null) {
          firstActive = { r, m };
          break;
        }
      }
      if (firstActive) break;
    }

    setActiveMatchPos(firstActive);
    setIsSetup(false);
    setError('');
  };

  const handleMatchSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const p1Vals = [p1Inputs.m1, p1Inputs.m2, p1Inputs.m3, p1Inputs.m4];
    const p2Vals = [p2Inputs.m1, p2Inputs.m2, p2Inputs.m3, p2Inputs.m4];
    
    if (p1Vals.some(v => !v || isNaN(v) || v <= 0) || p2Vals.some(v => !v || isNaN(v) || v <= 0)) {
      setError('Please enter valid positive numbers for all 8 measurements.');
      return;
    }

    const p1Score = calculateScore(p1Inputs.m1, p1Inputs.m2, p1Inputs.m3, p1Inputs.m4, p1Inputs.grade);
    const p2Score = calculateScore(p2Inputs.m1, p2Inputs.m2, p2Inputs.m3, p2Inputs.m4, p2Inputs.grade);

    const currentMatch = matches[activeMatchPos.r][activeMatchPos.m];
    const winner = p1Score <= p2Score ? currentMatch.p1 : currentMatch.p2;

    const newMatches = [...matches].map(round => [...round].map(m => ({...m})));
    
    newMatches[activeMatchPos.r][activeMatchPos.m].p1Score = p1Score;
    newMatches[activeMatchPos.r][activeMatchPos.m].p2Score = p2Score;
    newMatches[activeMatchPos.r][activeMatchPos.m].winner = winner;

    // Advance winner
    const nextR = activeMatchPos.r + 1;
    const numRounds = matches.length;
    
    if (nextR < numRounds) {
      const nextM = Math.floor(activeMatchPos.m / 2);
      const isP1 = activeMatchPos.m % 2 === 0;
      if (isP1) {
        newMatches[nextR][nextM].p1 = winner;
      } else {
        newMatches[nextR][nextM].p2 = winner;
      }
      // Check if new match has a Bye opponent. If so, auto-advance.
      const updatedNext = newMatches[nextR][nextM];
      if (updatedNext.p1 && updatedNext.p2 === null) updatedNext.winner = updatedNext.p1;
      if (updatedNext.p2 && updatedNext.p1 === null) updatedNext.winner = updatedNext.p2;
    }

    // Cascade any auto-advances
    for (let cascadeR = nextR; cascadeR < numRounds - 1; cascadeR++) {
      for (let cascadeM = 0; cascadeM < newMatches[cascadeR].length; cascadeM++) {
         const mObj = newMatches[cascadeR][cascadeM];
         if (mObj.winner) { // It auto advanced
            const nR = cascadeR + 1;
            const nM = Math.floor(cascadeM / 2);
            const isP1 = cascadeM % 2 === 0;
            if (isP1) newMatches[nR][nM].p1 = mObj.winner;
            else newMatches[nR][nM].p2 = mObj.winner;
            
            const upN = newMatches[nR][nM];
            if ((upN.p1 && !upN.p2) || (upN.p2 && !upN.p1)) {
              if (upN.p1 && upN.p2 === null) upN.winner = upN.p1;
              if (upN.p2 && upN.p1 === null) upN.winner = upN.p2;
            }
         }
      }
    }

    setMatches(newMatches);

    // Find next active match
    let nextMatchPos = null;
    for (let r = 0; r < numRounds; r++) {
      for (let m = 0; m < newMatches[r].length; m++) {
        const match = newMatches[r][m];
        if (match.p1 && match.p2 && match.winner === null) {
          nextMatchPos = { r, m };
          break;
        }
      }
      if (nextMatchPos) break;
    }

    setActiveMatchPos(nextMatchPos);
    
    setP1Inputs({ m1: '', m2: '', m3: '', m4: '', grade: 'None' });
    setP2Inputs({ m1: '', m2: '', m3: '', m4: '', grade: 'None' });
  };

  const getTournamentWinner = () => {
    if (matches.length === 0) return null;
    const finalMatch = matches[matches.length - 1][0];
    return finalMatch.winner;
  };

  const renderPlayerInputRow = (playerLabel, playerObj, inputs, setInputs) => {
    return (
      <div className="bg-white/40 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner mb-4">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-slate-800 dark:text-white">
          <Circle className="w-4 h-4 text-indigo-500" />
          {playerObj?.name || playerLabel}
        </h3>
        {/* Improved spacing and labels for D1-D4 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {['m1', 'm2', 'm3', 'm4'].map((field, idx) => (
            <div key={field} className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider ml-1">
                D{idx+1}
              </label>
              <input 
                type="number" step="any" required
                value={inputs[field]} onChange={e => setInputs({...inputs, [field]: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium shadow-sm"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-500 mr-1">Grade:</span>
          {['None', 'A', 'B', 'C', 'D'].map(g => (
            <button 
              key={g} type="button" onClick={() => setInputs({...inputs, grade: g})}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${inputs.grade === g ? 'bg-indigo-500 text-white border-indigo-600 shadow-md transform scale-105' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const numRounds = matches.length;
  // Calculate power of 2 size for layout consistency
  const handleOpenCertificate = () => {
    const winner = getTournamentWinner();
    const url = `/?view=certificate&name=${encodeURIComponent(winner.name)}&score=null`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const bracketSize = Math.pow(2, numRounds);

  return (
    <div className="min-h-screen relative overflow-hidden pb-12 p-4">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/20 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      
      <header className="max-w-7xl mx-auto flex items-center justify-between gap-4 mb-8 relative z-10 glass-panel p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-4">
            <button 
            onClick={onBackToMenu}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300"
            title="Back to Menu"
            >
            <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400">
                <Swords className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tournament Bracket</h1>
            </div>
        </div>
        
        {/* Restart Button */}
        {!isSetup && (
            <button 
            onClick={() => { setIsSetup(true); setPlayers([]); setError(''); }}
            className="text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors hidden sm:block"
            >
                Reset Tournament
            </button>
        )}
      </header>
      
      <main className="max-w-7xl mx-auto relative z-10 animate-slide-up stagger-2">
        {error && (
          <div className="mb-6 p-3 bg-red-50/90 dark:bg-red-900/20 backdrop-blur-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center gap-3 rounded-xl shadow-lg">
            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full font-bold">!</div>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {isSetup ? (
          <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white"><Users className="w-6 h-6 text-amber-500"/> Tournament Setup</h2>
            
            <div className="mb-8">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                Dynamic Bracket Entry
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Add 2 or more players. If the player count isn't a power of 2 (e.g., 4, 8, 16), the tournament will automatically schedule "Byes" to balance the bracket fairly.
              </p>
              
              <form onSubmit={handleAddPlayer} className="flex gap-2 mb-6">
                <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Player Name"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-amber-500 outline-none font-medium text-slate-800 dark:text-slate-200 shadow-inner"
                />
                <button type="submit" disabled={!playerName.trim()} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none transition-all flex items-center gap-2">
                  <Plus className="w-5 h-5"/> Add
                </button>
              </form>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                {players.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-800 group">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate pr-2"><span className="text-amber-500 mr-2">{i+1}.</span> {p.name}</span>
                    <button onClick={() => removePlayer(p.id)} className="text-slate-400 hover:text-red-500 p-1 bg-slate-100 dark:bg-slate-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-4 h-4 rotate-45"/></button>
                  </div>
                ))}
                {players.length === 0 && (
                    <div className="sm:col-span-2 text-center py-8 text-slate-400 font-medium border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                        No players added yet.
                    </div>
                )}
              </div>
            </div>

            <button 
              onClick={startTournament} 
              disabled={players.length < 2} 
              className={players.length >= 2 
                ? "w-full py-4 rounded-xl font-black text-lg transition-all flex justify-center items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 hover:-translate-y-1 active:translate-y-0"
                : "w-full py-4 rounded-xl font-black text-lg transition-all flex justify-center items-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed"
              }
            >
              <Trophy className="w-6 h-6" /> Start Tournament!
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* The Bracket Visualization */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 overflow-x-auto border border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                <Trophy className="w-5 h-5 text-amber-500"/> Match Tree <span className="text-sm font-semibold text-slate-400 ml-2">({players.length} Players)</span>
              </h2>
              
              <div className="flex justify-between min-w-[700px] gap-6">
                {matches.map((round, r) => {
                  const roundDesc = r === numRounds - 1 ? 'Final' : r === numRounds - 2 ? 'Semifinals' : r === numRounds - 3 ? 'Quarterfinals' : `Round ${r+1}`;
                  return (
                  <div key={r} className="flex-1 flex flex-col justify-around gap-4 relative">
                    <div className="text-center font-bold text-xs text-slate-400 uppercase tracking-widest mb-4 absolute -top-8 w-full">
                      {roundDesc}
                    </div>
                    {round.map((match, m) => (
                      <div key={match.id} className={`bg-white/80 dark:bg-slate-800/80 border rounded-xl p-2.5 shadow-sm relative z-10 transition-all group
                        ${activeMatchPos?.r === r && activeMatchPos?.m === m ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/20 scale-105' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}
                      `}>
                        <div className={`text-sm font-bold truncate p-1.5 rounded-lg mb-1 flex justify-between items-center transition-colors ${match.winner?.id && match.winner?.id === match.p1?.id ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          <span>{match.p1 ? match.p1.name : <span className="text-slate-400 italic">TBD</span>}</span>
                          {match.p1Score !== null && <span className="font-mono text-[10px] bg-white/50 dark:bg-black/20 px-1.5 rounded">{match.p1Score}%</span>}
                        </div>
                        <div className="h-px w-full bg-slate-200/50 dark:bg-slate-700/50 my-1"></div>
                        <div className={`text-sm font-bold truncate p-1.5 rounded-lg flex justify-between items-center transition-colors ${match.winner?.id && match.winner?.id === match.p2?.id ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          <span>{match.p2 ? match.p2.name : <span className="text-slate-400 italic">BYE</span>}</span>
                          {match.p2Score !== null && <span className="font-mono text-[10px] bg-white/50 dark:bg-black/20 px-1.5 rounded">{match.p2Score}%</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )})}
                
                {/* Winner Display */}
                <div className="flex-1 flex flex-col justify-center relative pl-6">
                   <div className="text-center font-bold text-xs text-amber-500 uppercase tracking-widest mb-4 absolute -top-8 w-full">
                      Champion
                   </div>
                   <div className="bg-gradient-to-tr from-amber-400 to-orange-500 p-1.5 rounded-2xl shadow-xl shadow-amber-500/20">
                     <div className="bg-white/95 dark:bg-slate-900/95 rounded-xl p-6 text-center shadow-inner">
                       <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                       <div className="font-black text-xl text-slate-800 dark:text-white truncate">
                         {getTournamentWinner() ? getTournamentWinner().name : <span className="text-slate-400 font-normal italic">???</span>}
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Active Match Action Panel */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col border border-slate-200/50 dark:border-slate-700/50">
              {activeMatchPos ? (
                <>
                  <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-lg text-amber-600 dark:text-amber-400"><Swords className="w-4 h-4"/></div>
                    Active Match
                  </h2>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 text-center border border-amber-200 dark:border-amber-800/50">
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-2">
                      {activeMatchPos.r === numRounds - 1 ? 'Championship Final' : `Round ${activeMatchPos.r + 1} • Match ${activeMatchPos.m + 1}`}
                    </div>
                    <div className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3">
                      <span className="truncate">{matches[activeMatchPos.r][activeMatchPos.m].p1.name}</span>
                      <span className="text-amber-500 font-normal italic text-sm">vs</span>
                      <span className="truncate">{matches[activeMatchPos.r][activeMatchPos.m].p2.name}</span>
                    </div>
                  </div>

                  <form onSubmit={handleMatchSubmit} className="flex-grow flex flex-col justify-between">
                    <div>
                      {renderPlayerInputRow('Player 1', matches[activeMatchPos.r][activeMatchPos.m].p1, p1Inputs, setP1Inputs)}
                      {renderPlayerInputRow('Player 2', matches[activeMatchPos.r][activeMatchPos.m].p2, p2Inputs, setP2Inputs)}
                    </div>
                    
                    <button type="submit" className="w-full mt-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-lg shadow-xl shadow-slate-900/20 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                      <Swords className="w-5 h-5" /> Calculate Winner
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 h-full min-h-[400px]">
                  <div className="w-28 h-28 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/40 mb-8 animate-bounce">
                    <Trophy className="w-14 h-14 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-3">Tournament Complete!</h2>
                  <p className="text-slate-500 font-medium mb-10 text-lg">
                    Congratulations to <span className="text-amber-500 font-bold">{getTournamentWinner()?.name}</span> for taking the crown!
                  </p>
                  <button onClick={handleOpenCertificate} className="px-8 py-4 mb-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                    <Award className="w-5 h-5"/> Print Winner's Certificate
                  </button>
                  <button onClick={() => { setIsSetup(true); setPlayers([]); }} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5"/> Start New Tournament
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
