'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface ScratchCardProps {
  prizeName: string;
  isWinner: boolean;
  prizeIcon: React.ReactNode;
  onScratchComplete: () => void;
  isPlayed: boolean;
  onReset: () => void;
  themeColorClass: string;
}

const drawScratchLayer = (ctx: CanvasRenderingContext2D, width: number, height: number, themeColorClass: string) => {
  // Clear canvas
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, width, height);

  // Create a metallic gradient for the scratch surface
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  if (themeColorClass === 'theme-prime') {
    gradient.addColorStop(0, '#991b1b'); // Dark red crimson
    gradient.addColorStop(0.5, '#ef4444'); // Lighter red
    gradient.addColorStop(1, '#7f1d1d');
  } else if (themeColorClass === 'theme-wood') {
    gradient.addColorStop(0, '#451a03'); // Dark brown
    gradient.addColorStop(0.5, '#b45309'); // Golden brown
    gradient.addColorStop(1, '#78350f');
  } else if (themeColorClass === 'theme-organic') {
    gradient.addColorStop(0, '#064e3b'); // Dark green
    gradient.addColorStop(0.5, '#10b981'); // Rich green
    gradient.addColorStop(1, '#065f46');
  } else {
    // theme-charcoal or default
    gradient.addColorStop(0, '#1f2937'); // Slate
    gradient.addColorStop(0.5, '#4b5563'); // Platinum grey
    gradient.addColorStop(1, '#111827');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw stylish pattern over the metallic coat
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 4;
  for (let i = -100; i < width + 100; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 100, height);
    ctx.stroke();
  }

  // Add a stylish border shadow
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, width, height);

  // Add Text instructions to scratching zone
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw "¡RASPÁ AQUÍ!" Display text
  ctx.font = 'bold 20px -apple-system, system-ui';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;
  ctx.fillText('🥩 ¡RASPÁ ACÁ! 🥩', width / 2, height / 2 - 10);

  // Second smaller instruction line
  ctx.font = '600 11px -apple-system, system-ui';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.shadowBlur = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillText('Develá tu premio exclusivo', width / 2, height / 2 + 18);
};

export default function ScratchCard({
  prizeName,
  isWinner,
  prizeIcon,
  onScratchComplete,
  isPlayed,
  onReset,
  themeColorClass,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [revealTriggered, setRevealTriggered] = useState(false);
  const strokeCountRef = useRef(0);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Reset indicator
    setRevealTriggered(false);
    setScratchProgress(0);

    // Draw scratch layer
    drawScratchLayer(ctx, canvas.width, canvas.height, themeColorClass);
  }, [isPlayed, themeColorClass]);

  // Handle Scratch logic
  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !isScratching) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw circle brush
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check transparency metrics periodically to speed up calculations
    strokeCountRef.current++;
    if (strokeCountRef.current % 12 === 0) {
      calculateProgress(ctx, canvas.width, canvas.height);
    }
  };

  const calculateProgress = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let cleared = 0;
    
    // Check every 16th pixel to speed up calculation drastically
    const step = 64; 
    let totalChecked = 0;
    
    for (let i = 3; i < data.length; i += step) {
      totalChecked++;
      if (data[i] === 0) {
        cleared++;
      }
    }

    const ratio = cleared / totalChecked;
    setScratchProgress(ratio * 100);

    // Clear completely when scratched > 38%
    if (ratio > 0.38 && !revealTriggered) {
      setRevealTriggered(true);
      revealAllAndComplete(ctx, width, height);
    }
  };

  const revealAllAndComplete = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    setScratchProgress(100);
    onScratchComplete();
  };

  // Pointer events hook (Supports both Desktop and Mobile touch inputs cleanly)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPlayed) return;
    setIsScratching(true);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setPointerCapture(e.pointerId);
    }
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsScratching(false);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }

    // Force progress calculation on release
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        calculateProgress(ctx, canvas.width, canvas.height);
      }
    }
  };

  return (
    <div className="scratch-card-box" id="interactive-scratch-card">
      <div className="scratch-canvas-container" ref={containerRef}>
        {/* Underlay Prize Layer */}
        <div className={`reveal-prize-layer ${isWinner ? 'won' : ''}`}>
          <div className="reveal-prize-icon">
            {prizeIcon}
          </div>
          <div className="reveal-prize-status">
            {isWinner ? '🎁 ¡CUPÓN GANADO! 🎁' : '🤞 SEGUÍ INTENTANDO 🤞'}
          </div>
          <div className="reveal-prize-title">
            {prizeName}
          </div>
          <p className="reveal-prize-instructions">
            {isWinner 
              ? 'Presentá el código generado abajo en caja' 
              : '¡No te preocupes! Tenés otra oportunidad mañana'}
          </p>
          
          {isWinner && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '3px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--theme-primary)', animation: 'pulse 1.5s infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--theme-accent)', animation: 'pulse 1.5s infinite 0.5s' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--theme-primary)', animation: 'pulse 1.5s infinite 1s' }} />
            </div>
          )}
        </div>

        {/* Scratch Surface Canvas Layer */}
        {!isPlayed && (
          <canvas
            ref={canvasRef}
            className="scratch-canvas-element"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        )}
      </div>

      <div className="scratch-prompt" id="scratch-prompt-tag">
        {isPlayed ? (
          <button className="btn btn-secondary text-xs" onClick={onReset} style={{ padding: '0.4rem 0.8rem' }} id="reset-scratch-button">
            <RefreshCw size={12} /> Jugar de nuevo (Demo admin override)
          </button>
        ) : (
          <>
            <Sparkles size={12} style={{ color: 'var(--theme-accent)', animation: 'spin 4s linear infinite' }} />
            <span>Usá tu dedo o mouse para raspar la tarjeta</span>
          </>
        )}
      </div>
    </div>
  );
}
