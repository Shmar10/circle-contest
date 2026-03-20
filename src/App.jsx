import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import ChallengeMode from './components/ChallengeMode';
import BracketMode from './components/BracketMode';
import Certificate from './components/Certificate';

export default function App() {
  const [view, setView] = useState('menu'); // 'menu', 'challenge', 'bracket'

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('view') === 'certificate') {
    return (
      <Certificate 
        winnerName={urlParams.get('name')} 
        score={urlParams.get('score') !== 'null' ? urlParams.get('score') : null} 
        onClose={() => window.close()} 
      />
    );
  }

  return (
    <>
      {view === 'menu' && <MainMenu onSelectMode={(mode) => setView(mode)} />}
      {view === 'challenge' && <ChallengeMode onBackToMenu={() => setView('menu')} />}
      {view === 'bracket' && <BracketMode onBackToMenu={() => setView('menu')} />}
    </>
  );
}
