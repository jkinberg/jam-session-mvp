import React, { useState, useEffect } from 'react';

const HostScreenMockup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Simulate playhead movement
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 16);
    }, 250); // Slower for demo visibility
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Mock data for each instrument
  const instruments = {
    drums: {
      name: "Drums",
      emoji: "🥁",
      player: "Julius",
      color: "#ef4444",
      bgColor: "#fef2f2",
      pattern: [
        { step: 0, sound: "K" },
        { step: 4, sound: "K" },
        { step: 8, sound: "K" },
        { step: 12, sound: "K" },
        { step: 2, sound: "S" },
        { step: 6, sound: "S" },
        { step: 10, sound: "S" },
        { step: 14, sound: "S" },
        { step: 7, sound: "H" },
        { step: 11, sound: "H" },
        { step: 15, sound: "H" },
      ]
    },
    percussion: {
      name: "Percussion",
      emoji: "🎵",
      player: null,
      color: "#f59e0b",
      bgColor: "#fffbeb",
      pattern: []
    },
    bass: {
      name: "Bass",
      emoji: "🎸",
      player: "Jovelle",
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
      pattern: [
        { step: 0, note: "C", duration: 4 },
        { step: 4, note: "G", duration: 4 },
        { step: 8, note: "F", duration: 2 },
        { step: 10, note: "E", duration: 3 },
        { step: 13, note: "G", duration: 3 },
      ]
    },
    chords: {
      name: "Chords",
      emoji: "🎹",
      player: "Jordan",
      color: "#06b6d4",
      bgColor: "#ecfeff",
      pattern: [
        { step: 0, chord: "Am", duration: 4 },
        { step: 4, chord: "F", duration: 4 },
        { step: 8, chord: "C", duration: 4 },
        { step: 12, chord: "G", duration: 4 },
      ]
    }
  };

  // Check if a step is within a sustained note
  const isStepInNote = (pattern, step, isSustained = false) => {
    if (!isSustained) {
      return pattern.find(p => p.step === step);
    }
    return pattern.find(p => step >= p.step && step < p.step + p.duration);
  };

  // Get the note/chord at a step (for sustained instruments)
  const getNoteAtStep = (pattern, step) => {
    const note = pattern.find(p => step >= p.step && step < p.step + p.duration);
    return note;
  };

  // Check if step is the start of a note
  const isNoteStart = (pattern, step) => {
    return pattern.find(p => p.step === step);
  };

  const InstrumentRow = ({ instrument, data }) => {
    const isActive = data.player !== null;
    const isSustained = instrument === 'bass' || instrument === 'chords';
    
    return (
      <div 
        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
          isActive ? 'bg-white shadow-lg' : 'bg-gray-100 opacity-60'
        }`}
        style={{
          borderLeft: isActive ? `4px solid ${data.color}` : '4px solid #d1d5db'
        }}
      >
        {/* QR Code placeholder */}
        <div className="flex-shrink-0 w-20 h-20 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-800 rounded p-1">
            <div className="w-full h-full grid grid-cols-4 gap-0.5">
              {[...Array(16)].map((_, i) => (
                <div key={i} className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-800'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Instrument info */}
        <div className="flex-shrink-0 w-28">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{data.emoji}</span>
            <span className="font-bold text-gray-800">{data.name}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {data.player || "Scan to join"}
          </div>
        </div>

        {/* Sequence grid */}
        <div className="flex-1 flex gap-1">
          {[...Array(16)].map((_, step) => {
            const hit = isStepInNote(data.pattern, step, isSustained);
            const isNoteBegin = isNoteStart(data.pattern, step);
            const isCurrentStep = currentStep === step;
            const noteData = isSustained ? getNoteAtStep(data.pattern, step) : null;
            
            // For sustained notes, check if this is part of a note
            const isInSustain = isSustained && hit;
            const isPlaying = isCurrentStep && hit;
            
            // Determine if this cell should show the note label
            const showLabel = isSustained ? isNoteBegin : hit;
            const label = hit ? (hit.sound || hit.note || hit.chord) : '';

            // Calculate if this is start, middle, or end of sustain
            const isStart = isSustained && isNoteBegin;
            const noteEnd = noteData ? noteData.step + noteData.duration - 1 : step;
            const isEnd = isSustained && hit && step === noteEnd;
            const isMiddle = isSustained && hit && !isStart && !isEnd;

            return (
              <div
                key={step}
                className={`
                  relative h-12 flex items-center justify-center text-xs font-bold
                  transition-all duration-100
                  ${step % 4 === 0 ? 'ml-1' : ''}
                  ${!isSustained ? 'w-10 rounded-md' : 'flex-1 min-w-6'}
                  ${isInSustain ? (
                    isStart ? 'rounded-l-md' : 
                    isEnd ? 'rounded-r-md' : ''
                  ) : 'rounded-md'}
                `}
                style={{
                  backgroundColor: hit ? (
                    isPlaying ? data.color : `${data.color}40`
                  ) : (
                    isCurrentStep ? '#f3f4f6' : '#f9fafb'
                  ),
                  color: hit ? (isPlaying ? 'white' : data.color) : '#9ca3af',
                  boxShadow: isPlaying ? `0 0 20px ${data.color}80` : 'none',
                  transform: isPlaying ? 'scale(1.05)' : 'scale(1)',
                  borderRight: isMiddle || isStart && !isEnd ? 'none' : undefined,
                  borderLeft: isMiddle || isEnd && !isStart ? 'none' : undefined,
                }}
              >
                {showLabel && label}
                {/* Beat marker */}
                {step % 4 === 0 && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-gray-300" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">JAM SESSION</h1>
          <p className="text-gray-400">Room: <span className="font-mono text-cyan-400">XK7M</span></p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-mono text-white">2:45</div>
          <div className="text-gray-400">remaining</div>
        </div>
      </div>

      {/* Instrument rows */}
      <div className="space-y-4">
        {Object.entries(instruments).map(([key, data]) => (
          <InstrumentRow key={key} instrument={key} data={data} />
        ))}
      </div>

      {/* Footer controls */}
      <div className="mt-8 flex justify-center">
        <div className="bg-white/10 backdrop-blur rounded-2xl px-8 py-4 flex items-center gap-8">
          {/* Beat indicator */}
          <div className="flex gap-2">
            {[0, 1, 2, 3].map(beat => (
              <div
                key={beat}
                className={`w-3 h-3 rounded-full transition-all duration-100 ${
                  Math.floor(currentStep / 4) === beat 
                    ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* BPM */}
          <div className="text-white">
            <span className="text-2xl font-mono">120</span>
            <span className="text-gray-400 ml-1">BPM</span>
          </div>

          {/* Play/Pause for demo */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          {/* End Session */}
          <button className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors">
            End Session
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mt-4 text-center text-gray-500 text-sm">
        Step {currentStep + 1} of 16
      </div>
    </div>
  );
};

export default HostScreenMockup;
