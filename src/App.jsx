import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import ChallengeMode from './components/ChallengeMode';
import BracketMode from './components/BracketMode';

export default function App() {
  const [view, setView] = useState('menu');

  if (view === 'challenge') {
    return <ChallengeMode onBackToMenu={() => setView('menu')} />;
  }

  if (view === 'bracket') {
    return <BracketMode onBackToMenu={() => setView('menu')} />;
  }

  return <MainMenu onSelectMode={setView} />;
}
