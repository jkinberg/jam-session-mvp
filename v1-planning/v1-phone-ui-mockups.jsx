import React, { useState } from 'react';

// ============================================
// DRUMS UI
// ============================================
const DrumsUI = () => {
  const [selectedSound, setSelectedSound] = useState('kick');
  const [pattern, setPattern] = useState([
    { step: 0, sound: 'kick' },
    { step: 4, sound: 'kick' },
    { step: 8, sound: 'kick' },
    { step: 12, sound: 'kick' },
    { step: 2, sound: 'snare' },
    { step: 6, sound: 'snare' },
    { step: 10, sound: 'snare' },
    { step: 14, sound: 'snare' },
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  const sounds = [
    { id: 'kick', label: 'KICK', short: 'K', color: '#ef4444' },
    { id: 'snare', label: 'SNARE', short: 'S', color: '#f97316' },
    { id: 'hihat', label: 'HAT', short: 'H', color: '#eab308' },
    { id: 'clap', label: 'CLAP', short: 'C', color: '#ec4899' },
  ];

  const toggleStep = (step) => {
    const existing = pattern.find(p => p.step === step);
    if (existing) {
      if (existing.sound === selectedSound) {
        setPattern(pattern.filter(p => p.step !== step));
      } else {
        setPattern(pattern.map(p => p.step === step ? { ...p, sound: selectedSound } : p));
      }
    } else {
      setPattern([...pattern, { step, sound: selectedSound }]);
    }
  };

  const getStepSound = (step) => pattern.find(p => p.step === step);
  const getSoundColor = (soundId) => sounds.find(s => s.id === soundId)?.color || '#ccc';
  const getSoundShort = (soundId) => sounds.find(s => s.id === soundId)?.short || '';

  // Simulate playhead
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 16);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-80 bg-gray-900 rounded-3xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥁</span>
          <span className="text-white font-bold text-lg">DRUMS</span>
        </div>
        <div className="text-gray-400 text-sm font-mono">Room: XK7M</div>
      </div>

      {/* Sound selector */}
      <div className="mb-4">
        <div className="text-gray-400 text-xs mb-2">Select sound:</div>
        <div className="grid grid-cols-4 gap-2">
          {sounds.map(sound => (
            <button
              key={sound.id}
              onClick={() => setSelectedSound(sound.id)}
              className={`py-3 rounded-xl font-bold text-sm transition-all ${
                selectedSound === sound.id 
                  ? 'text-white scale-105 shadow-lg' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              style={{
                backgroundColor: selectedSound === sound.id ? sound.color : undefined,
                boxShadow: selectedSound === sound.id ? `0 4px 20px ${sound.color}60` : undefined
              }}
            >
              {sound.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step grid */}
      <div className="mb-4">
        <div className="text-gray-400 text-xs mb-2">Tap grid to place sounds:</div>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, step) => {
            const hit = getStepSound(step);
            const isCurrentStep = currentStep === step;
            return (
              <button
                key={step}
                onClick={() => toggleStep(step)}
                className={`aspect-square rounded-xl font-bold text-lg transition-all ${
                  hit ? 'text-white' : 'bg-gray-800 text-gray-600 hover:bg-gray-700'
                } ${isCurrentStep ? 'ring-2 ring-cyan-400' : ''}`}
                style={{
                  backgroundColor: hit ? getSoundColor(hit.sound) : undefined,
                  boxShadow: hit && isCurrentStep ? `0 0 20px ${getSoundColor(hit.sound)}` : undefined,
                  transform: hit && isCurrentStep ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {hit ? getSoundShort(hit.sound) : step + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear button */}
      <button 
        onClick={() => setPattern([])}
        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
      >
        CLEAR ALL
      </button>

      {/* Status */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="flex gap-1">
          {[0,1,2,3].map(beat => (
            <div key={beat} className={`w-2 h-2 rounded-full ${
              Math.floor(currentStep / 4) === beat ? 'bg-cyan-400' : 'bg-gray-700'
            }`} />
          ))}
        </div>
        <div className="text-green-400 font-medium">● Live</div>
      </div>
    </div>
  );
};

// ============================================
// PERCUSSION UI
// ============================================
const PercussionUI = () => {
  const [selectedSound, setSelectedSound] = useState('cowbell');
  const [pattern, setPattern] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const sounds = [
    { id: 'cowbell', label: 'COWBELL', short: 'CW', color: '#f59e0b' },
    { id: 'tamb', label: 'TAMB', short: 'TB', color: '#10b981' },
    { id: 'shaker', label: 'SHAKER', short: 'SH', color: '#6366f1' },
    { id: 'conga', label: 'CONGA', short: 'CG', color: '#f43f5e' },
  ];

  const toggleStep = (step) => {
    const existing = pattern.find(p => p.step === step);
    if (existing) {
      if (existing.sound === selectedSound) {
        setPattern(pattern.filter(p => p.step !== step));
      } else {
        setPattern(pattern.map(p => p.step === step ? { ...p, sound: selectedSound } : p));
      }
    } else {
      setPattern([...pattern, { step, sound: selectedSound }]);
    }
  };

  const getStepSound = (step) => pattern.find(p => p.step === step);
  const getSoundColor = (soundId) => sounds.find(s => s.id === soundId)?.color || '#ccc';
  const getSoundShort = (soundId) => sounds.find(s => s.id === soundId)?.short || '';

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 16);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-80 bg-gray-900 rounded-3xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="text-white font-bold text-lg">PERCUSSION</span>
        </div>
        <div className="text-gray-400 text-sm font-mono">Room: XK7M</div>
      </div>

      {/* Sound selector */}
      <div className="mb-4">
        <div className="text-gray-400 text-xs mb-2">Select sound:</div>
        <div className="grid grid-cols-4 gap-2">
          {sounds.map(sound => (
            <button
              key={sound.id}
              onClick={() => setSelectedSound(sound.id)}
              className={`py-3 rounded-xl font-bold text-xs transition-all ${
                selectedSound === sound.id 
                  ? 'text-white scale-105 shadow-lg' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              style={{
                backgroundColor: selectedSound === sound.id ? sound.color : undefined,
                boxShadow: selectedSound === sound.id ? `0 4px 20px ${sound.color}60` : undefined
              }}
            >
              {sound.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step grid */}
      <div className="mb-4">
        <div className="text-gray-400 text-xs mb-2">Tap grid to place sounds:</div>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, step) => {
            const hit = getStepSound(step);
            const isCurrentStep = currentStep === step;
            return (
              <button
                key={step}
                onClick={() => toggleStep(step)}
                className={`aspect-square rounded-xl font-bold text-sm transition-all ${
                  hit ? 'text-white' : 'bg-gray-800 text-gray-600 hover:bg-gray-700'
                } ${isCurrentStep ? 'ring-2 ring-cyan-400' : ''}`}
                style={{
                  backgroundColor: hit ? getSoundColor(hit.sound) : undefined,
                  boxShadow: hit && isCurrentStep ? `0 0 20px ${getSoundColor(hit.sound)}` : undefined,
                  transform: hit && isCurrentStep ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {hit ? getSoundShort(hit.sound) : step + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear button */}
      <button 
        onClick={() => setPattern([])}
        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
      >
        CLEAR ALL
      </button>

      {/* Status */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="flex gap-1">
          {[0,1,2,3].map(beat => (
            <div key={beat} className={`w-2 h-2 rounded-full ${
              Math.floor(currentStep / 4) === beat ? 'bg-cyan-400' : 'bg-gray-700'
            }`} />
          ))}
        </div>
        <div className="text-green-400 font-medium">● Live</div>
      </div>
    </div>
  );
};

// ============================================
// CHORDS UI
// ============================================
const ChordsUI = () => {
  const [slots, setSlots] = useState(['Am', 'F', 'C', 'G']);
  const [sentSlots, setSentSlots] = useState(['Am', 'Am', 'F', 'G']);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(0);

  const chordOptions = ['Am', 'F', 'C', 'G'];
  const chordColors = {
    'Am': '#8b5cf6',
    'F': '#ec4899',
    'C': '#06b6d4',
    'G': '#10b981'
  };

  const cycleChord = (slotIndex) => {
    const currentChord = slots[slotIndex];
    const currentIndex = chordOptions.indexOf(currentChord);
    const nextIndex = (currentIndex + 1) % chordOptions.length;
    const newSlots = [...slots];
    newSlots[slotIndex] = chordOptions[nextIndex];
    setSlots(newSlots);
    setHasChanges(true);
  };

  const sendToMix = () => {
    setSentSlots([...slots]);
    setHasChanges(false);
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlot(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-80 bg-gray-900 rounded-3xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎹</span>
          <span className="text-white font-bold text-lg">CHORDS</span>
        </div>
        <div className="text-gray-400 text-sm font-mono">Room: XK7M</div>
      </div>

      {/* Instructions */}
      <div className="text-gray-400 text-xs mb-3">Build your progression:</div>

      {/* Chord slots */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {slots.map((chord, index) => {
          const isPlaying = currentSlot === index;
          return (
            <button
              key={index}
              onClick={() => cycleChord(index)}
              className={`aspect-square rounded-2xl font-bold text-2xl transition-all flex flex-col items-center justify-center ${
                isPlaying ? 'scale-105' : ''
              }`}
              style={{
                backgroundColor: chordColors[chord],
                boxShadow: isPlaying ? `0 0 30px ${chordColors[chord]}80` : `0 4px 15px ${chordColors[chord]}40`
              }}
            >
              <span className="text-white">{chord}</span>
              <span className="text-white/60 text-xs mt-1">
                {index === 0 ? '1-4' : index === 1 ? '5-8' : index === 2 ? '9-12' : '13-16'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tap instruction */}
      <div className="text-gray-500 text-xs text-center mb-4">
        Tap to cycle: Am → F → C → G → Am...
      </div>

      {/* Send button */}
      <button 
        onClick={sendToMix}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          hasChanges 
            ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/30' 
            : 'bg-gray-800 text-gray-500'
        }`}
      >
        🔊 SEND TO MIX
      </button>

      {/* Current in mix */}
      <div className="mt-4 text-center">
        <div className="text-gray-500 text-xs mb-1">In mix:</div>
        <div className="text-gray-300 font-mono">
          {sentSlots.join(' - ')}
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="flex gap-1">
          {[0,1,2,3].map(beat => (
            <div key={beat} className={`w-2 h-2 rounded-full ${
              currentSlot === beat ? 'bg-cyan-400' : 'bg-gray-700'
            }`} />
          ))}
        </div>
        <div className={`font-medium ${hasChanges ? 'text-yellow-400' : 'text-gray-500'}`}>
          {hasChanges ? '● Draft' : '● Synced'}
        </div>
      </div>
    </div>
  );
};

// ============================================
// BASS UI (Piano Roll)
// ============================================
const BassUI = () => {
  const [notes, setNotes] = useState([
    { step: 0, note: 'C', duration: 3 },
    { step: 4, note: 'G', duration: 4 },
    { step: 9, note: 'F', duration: 2 },
    { step: 12, note: 'E', duration: 3 },
  ]);
  const [sentNotes, setSentNotes] = useState([]);
  const [hasChanges, setHasChanges] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const noteRows = ['A', 'G', 'F', 'E', 'D', 'C'];
  const noteColors = {
    'C': '#8b5cf6',
    'D': '#6366f1',
    'E': '#3b82f6',
    'F': '#06b6d4',
    'G': '#10b981',
    'A': '#f59e0b'
  };

  const getNoteAtCell = (note, step) => {
    return notes.find(n => n.note === note && step >= n.step && step < n.step + n.duration);
  };

  const isNoteStart = (note, step) => {
    return notes.find(n => n.note === note && n.step === step);
  };

  const toggleNote = (note, step, panelOffset = 0) => {
    const actualStep = step + panelOffset;
    const existing = getNoteAtCell(note, actualStep);
    if (existing) {
      setNotes(notes.filter(n => n !== existing));
    } else {
      setNotes([...notes, { step: actualStep, note, duration: 1 }]);
    }
    setHasChanges(true);
  };

  const sendToMix = () => {
    setSentNotes([...notes]);
    setHasChanges(false);
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 16);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const PianoRollPanel = ({ startStep, label }) => (
    <div className="mb-3">
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className="bg-gray-800 rounded-xl p-2">
        {noteRows.map(note => (
          <div key={note} className="flex items-center gap-1 mb-1 last:mb-0">
            <div className="w-6 text-xs text-gray-400 font-mono">{note}</div>
            <div className="flex-1 flex gap-0.5">
              {[...Array(8)].map((_, i) => {
                const step = startStep + i;
                const noteData = getNoteAtCell(note, step);
                const isStart = isNoteStart(note, step);
                const isCurrentStep = currentStep === step;
                const isPlaying = isCurrentStep && noteData;
                
                return (
                  <button
                    key={i}
                    onClick={() => toggleNote(note, i, startStep)}
                    className={`h-6 flex-1 rounded-sm transition-all text-xs font-bold ${
                      i % 4 === 0 ? 'ml-0.5' : ''
                    }`}
                    style={{
                      backgroundColor: noteData 
                        ? (isPlaying ? noteColors[note] : `${noteColors[note]}60`)
                        : (isCurrentStep ? '#4b5563' : '#374151'),
                      boxShadow: isPlaying ? `0 0 10px ${noteColors[note]}` : undefined,
                      transform: isPlaying ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {isStart && <span className="text-white/80">{note}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {/* Step numbers */}
        <div className="flex items-center gap-1 mt-1">
          <div className="w-6" />
          <div className="flex-1 flex gap-0.5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`flex-1 text-center text-xs text-gray-600 ${i % 4 === 0 ? 'ml-0.5' : ''}`}>
                {startStep + i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-gray-900 rounded-3xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎸</span>
          <span className="text-white font-bold text-lg">BASS</span>
        </div>
        <div className="text-gray-400 text-sm font-mono">Room: XK7M</div>
      </div>

      {/* Instructions */}
      <div className="text-gray-400 text-xs mb-2">Tap to add notes, tap again to remove:</div>

      {/* Piano roll panels */}
      <PianoRollPanel startStep={0} label="Steps 1-8" />
      <PianoRollPanel startStep={8} label="Steps 9-16" />

      {/* Action buttons */}
      <div className="flex gap-2 mb-3">
        <button 
          onClick={() => { setNotes([]); setHasChanges(true); }}
          className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
        >
          CLEAR
        </button>
        <button 
          onClick={sendToMix}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            hasChanges 
              ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/30' 
              : 'bg-gray-800 text-gray-500'
          }`}
        >
          🔊 SEND TO MIX
        </button>
      </div>

      {/* Status */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex gap-1">
          {[0,1,2,3].map(beat => (
            <div key={beat} className={`w-2 h-2 rounded-full ${
              Math.floor(currentStep / 4) === beat ? 'bg-cyan-400' : 'bg-gray-700'
            }`} />
          ))}
        </div>
        <div className={`font-medium ${hasChanges ? 'text-yellow-400' : 'text-gray-500'}`}>
          {hasChanges ? '● Draft' : '● Synced'}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP - Shows all UIs
// ============================================
const PhoneUIMockups = () => {
  const [activeTab, setActiveTab] = useState('drums');

  const tabs = [
    { id: 'drums', label: '🥁 Drums' },
    { id: 'percussion', label: '🎵 Perc' },
    { id: 'bass', label: '🎸 Bass' },
    { id: 'chords', label: '🎹 Chords' },
  ];

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <h1 className="text-2xl font-bold text-white text-center mb-6">Phone UI Mockups</h1>
      
      {/* Tab navigation */}
      <div className="flex justify-center gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-cyan-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active UI */}
      <div className="flex justify-center">
        {activeTab === 'drums' && <DrumsUI />}
        {activeTab === 'percussion' && <PercussionUI />}
        {activeTab === 'bass' && <BassUI />}
        {activeTab === 'chords' && <ChordsUI />}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-gray-400 text-sm">
        {activeTab === 'drums' && "Tap sound buttons to select, then tap grid to place. Tap filled cell to remove."}
        {activeTab === 'percussion' && "Same as drums - select sound, tap grid to place."}
        {activeTab === 'bass' && "Tap cells to add single notes. Future: drag to create sustained notes."}
        {activeTab === 'chords' && "Tap slots to cycle through chords. Press Send to Mix when ready."}
      </div>
    </div>
  );
};

export default PhoneUIMockups;
