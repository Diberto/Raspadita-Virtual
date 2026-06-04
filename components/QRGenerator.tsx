'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { QrCode, Printer, Check, Copy, RefreshCw, Sparkles, Download, Info } from 'lucide-react';

interface QRGeneratorProps {
  shopName: string;
  shopDescription: string;
  campaignName: string;
  defaultUrl: string;
  themeSelected: string;
}

export default function QRGenerator({
  shopName,
  shopDescription,
  campaignName,
  defaultUrl,
  themeSelected
}: QRGeneratorProps) {
  const [qrUrl, setQrUrl] = useState(defaultUrl);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [centerLogo, setCenterLogo] = useState('🥩'); // 🥩, 🔥, 🏆, 🎁, 🎟️, none
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [copied, setCopied] = useState(false);
  const [flyerStyle, setFlyerStyle] = useState<'brutalist' | 'classic' | 'neon'>('brutalist');
  const [qrSize, setQrSize] = useState(250);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Auto-update URL when defaultUrl changes (e.g. host loading)
  useEffect(() => {
    if (defaultUrl) {
      const timer = setTimeout(() => {
        setQrUrl(defaultUrl);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [defaultUrl]);

  // Synchronize base dark color with themeSelected when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (themeSelected === 'prime') {
        setDarkColor('#ff3b30');
      } else if (themeSelected === 'wood') {
        setDarkColor('#b45309');
      } else if (themeSelected === 'organic') {
        setDarkColor('#10b981');
      } else {
        setDarkColor('#000000');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [themeSelected]);

  // Helper to generate dynamic QR canvas wrapped in useCallback
  const generateQRCode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(
      canvas,
      qrUrl || 'https://example.com',
      {
        width: qrSize,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      },
      (error) => {
        if (error) {
          console.error('QR placement error:', error);
          return;
        }

        // Draw custom logo in the center if selected
        if (centerLogo !== 'none') {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const size = canvas.width;
            
            // Draw a rounded background badge in the center
            const badgeSize = Math.floor(size * 0.24);
            const badgeX = (size - badgeSize) / 2;
            const badgeY = (size - badgeSize) / 2;
            
            ctx.fillStyle = lightColor;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            
            // Rounded rectangle
            const radius = Math.floor(badgeSize * 0.3);
            ctx.beginPath();
            ctx.moveTo(badgeX + radius, badgeY);
            ctx.lineTo(badgeX + badgeSize - radius, badgeY);
            ctx.quadraticCurveTo(badgeX + badgeSize, badgeY, badgeX + badgeSize, badgeY + radius);
            ctx.lineTo(badgeX + badgeSize, badgeY + badgeSize - radius);
            ctx.quadraticCurveTo(badgeX + badgeSize, badgeY + badgeSize, badgeX + badgeSize - radius, badgeY + badgeSize);
            ctx.lineTo(badgeX + radius, badgeY + badgeSize);
            ctx.quadraticCurveTo(badgeX, badgeY + badgeSize, badgeX, badgeY + badgeSize - radius);
            ctx.lineTo(badgeX, badgeY + radius);
            ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
            ctx.closePath();
            ctx.fill();

            // Reset shadow to avoid drawing shadows on inner emojis
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Draw border around badge
            ctx.strokeStyle = darkColor;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Draw center logo / emoji
            ctx.font = `bold ${Math.floor(badgeSize * 0.65)}px -apple-system, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(centerLogo, size / 2, size / 2 + (centerLogo === '🏆' ? -1 : 1));
          }
        }

        // Capture data URL for easy download or layout inclusion
        try {
          setQrDataUrl(canvas.toDataURL('image/png'));
        } catch (e) {
          console.error('Could not extract QR Data URL:', e);
        }
      }
    );
  }, [qrUrl, darkColor, lightColor, centerLogo, errorCorrection, qrSize]);

  // Regeneration trigger on options modification
  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulated Direct Flyer Printing with standard CSS print layout injection
  const handlePrintFlyer = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permite ventanas emergentes para poder imprimir el volante.');
      return;
    }

    // Capture styling parameters according to selected flyer preset
    let flyerBg = '#ffffff';
    let flyerText = '#000000';
    let flyerAccent = darkColor;
    let flyerBorder = '4px solid #000000';
    let flyerSubText = '#555555';

    if (flyerStyle === 'brutalist') {
      flyerBg = '#fbfbfb';
      flyerText = '#000000';
      flyerAccent = '#FF3B30';
      flyerBorder = '8px solid #000000';
    } else if (flyerStyle === 'classic') {
      flyerBg = '#ffffff';
      flyerText = '#1c1917';
      flyerAccent = darkColor;
      flyerBorder = '2px solid rgba(0,0,0,0.15)';
    } else if (flyerStyle === 'neon') {
      flyerBg = '#0d0d0f';
      flyerText = '#ffffff';
      flyerAccent = '#00ff66';
      flyerBorder = '6px solid #1a1a24';
      flyerSubText = '#a1a1aa';
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Volante Campaña - ${shopName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@700&display=swap');
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #f0f0f0;
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .flyer-card {
              width: 480px;
              background-color: ${flyerBg};
              color: ${flyerText};
              border: ${flyerBorder};
              padding: 40px;
              text-align: center;
              box-shadow: 15px 15px 0px rgba(0,0,0,0.15);
              position: relative;
              box-sizing: border-box;
            }
            .header-badge {
              display: inline-block;
              background-color: ${flyerAccent};
              color: ${flyerStyle === 'neon' ? '#000' : '#fff'};
              padding: 6px 16px;
              font-family: 'Space Grotesk', sans-serif;
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-bottom: 24px;
            }
            .shop-name {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 20px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: -0.02em;
              margin-bottom: 8px;
            }
            .campaign-title {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 34px;
              font-weight: 900;
              line-height: 1.05;
              text-transform: uppercase;
              letter-spacing: -0.04em;
              margin: 12px 0 24px 0;
            }
            .qr-wrapper {
              display: inline-block;
              background-color: #ffffff;
              padding: 20px;
              border: 3px solid ${flyerText};
              box-shadow: 8px 8px 0px ${flyerText === '#ffffff' ? '#111' : 'rgba(0,0,0,0.1)'};
              margin-bottom: 30px;
            }
            .qr-wrapper img {
              width: 240px;
              height: 240px;
              display: block;
            }
            .instructions {
              font-size: 14px;
              font-weight: 600;
              line-height: 1.4;
              color: ${flyerSubText};
              margin-bottom: 20px;
            }
            .footer-detail {
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              color: ${flyerSubText};
              border-top: 2px dashed ${flyerStyle === 'neon' ? '#222' : '#ddd'};
              padding-top: 15px;
              margin-top: 20px;
              word-break: break-all;
            }
            @media print {
              body {
                background-color: transparent;
                min-height: auto;
              }
              .flyer-card {
                box-shadow: none;
                border: ${flyerStyle === 'neon' ? '4px solid #000' : flyerBorder};
                margin: 0 auto;
              }
              .print-btn {
                display: none !important;
              }
            }
            .print-btn {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: #ff3b30;
              color: white;
              border: 2px solid #000;
              padding: 12px 24px;
              font-family: 'Space Grotesk', sans-serif;
              font-weight: 900;
              text-transform: uppercase;
              font-size: 13px;
              cursor: pointer;
              box-shadow: 4px 4px 0px #000;
              z-index: 9999;
            }
            .print-btn:hover {
              background-color: #e02e24;
            }
          </style>
        </head>
        <body>
          <button class="print-btn" onclick="window.print()">Imprimir Volante 🖨️</button>
          
          <div class="flyer-card">
            <div class="header-badge">🥩 ¡ESCANEA Y JUGÁ! 🥩</div>
            <div class="shop-name">${shopName}</div>
            <div class="campaign-title">${campaignName.replace(/🥩/g, '').trim()}</div>
            
            <div class="qr-wrapper">
              <img src="${qrDataUrl}" alt="Código QR de Campaña" />
            </div>
            
            <div class="instructions">
              Enfocá tu cámara en el código para revelar tu premio instantáneo.<br>
              ¡Todos los códigos tienen premios o beneficios especiales!
            </div>
            
            <div class="footer-detail">
              CAMPAÑA DIGITAL: ${qrUrl}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#121212', border: '2px solid #222', borderRadius: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid #222', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        <QrCode size={22} style={{ color: 'var(--theme-primary)' }} />
        <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', margin: 0 }}>
          Generador de QR Dinámico de Campaña
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Left config side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#fff' }}>URL Específica de Destino</label>
            <p style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
              Los clientes usarán este enlace para acceder al raspador digital de tu negocio.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
                placeholder="https://tudominio.com/..."
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                onClick={handleCopyUrl}
                className="btn btn-secondary text-xs"
                style={{ minWidth: '46px', padding: '0.5rem' }}
                title="Copiar Enlace"
              >
                {copied ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Símbolo en el Centro (Logo)</label>
              <select
                className="form-select"
                value={centerLogo}
                onChange={(e) => setCenterLogo(e.target.value)}
              >
                <option value="🥩">🥩 Solomillo / Carne</option>
                <option value="🔥">🔥 Fuego / Asado</option>
                <option value="🏆">🏆 Copa Premium</option>
                <option value="🎁">🎁 Regalo de Bienvenida</option>
                <option value="🎟️">🎟️ Boleto Virtual</option>
                <option value="none">Sin ícono (Estándar)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Color del Código</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  style={{ width: '42px', height: '38px', padding: '2px', backgroundColor: '#151515', border: '2px solid #222', borderRadius: '4px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          {/* Quick info tip and preset selection */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #222', padding: '0.75rem', borderRadius: '4px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Info size={14} style={{ color: 'var(--theme-primary)', marginTop: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '0.7rem', color: '#a1a1aa', margin: 0, lineHeight: 1.3 }}>
              <strong>Tolerancia de errores extrema (nivel High H):</strong> El logotipo se dibuja encima sin romper la lectura. Tus clientes podrán escanear este código con total soltura.
            </p>
          </div>

          {/* Printable Flyer Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Estilo de Volante Imprimible</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setFlyerStyle('brutalist')}
                className="btn text-xs"
                style={{
                  backgroundColor: flyerStyle === 'brutalist' ? 'rgba(255,59,48,0.15)' : '#151515',
                  borderColor: flyerStyle === 'brutalist' ? '#ff3b30' : '#222',
                  color: flyerStyle === 'brutalist' ? '#fff' : '#888',
                  boxShadow: 'none'
                }}
              >
                Brutalismo Rojo
              </button>
              <button
                type="button"
                onClick={() => setFlyerStyle('classic')}
                className="btn text-xs"
                style={{
                  backgroundColor: flyerStyle === 'classic' ? 'rgba(255,255,255,0.08)' : '#151515',
                  borderColor: flyerStyle === 'classic' ? '#ffcc00' : '#222',
                  color: flyerStyle === 'classic' ? '#fff' : '#888',
                  boxShadow: 'none'
                }}
              >
                Estilo Sobrio
              </button>
              <button
                type="button"
                onClick={() => setFlyerStyle('neon')}
                className="btn text-xs"
                style={{
                  backgroundColor: flyerStyle === 'neon' ? 'rgba(0,255,100,0.08)' : '#151515',
                  borderColor: flyerStyle === 'neon' ? '#00ff66' : '#222',
                  color: flyerStyle === 'neon' ? '#fff' : '#888',
                  boxShadow: 'none'
                }}
              >
                Moderna Cemento
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview QR & Print flyer side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#09090b', padding: '1rem', border: '2px solid #222', borderRadius: '4px' }}>
          <span style={{ fontSize: '0.65rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Vista de Generación
          </span>
          <div style={{ padding: '0.75rem', background: '#fff', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #000', boxShadow: '4px 4px 0px #000', marginBottom: '1.25rem' }}>
            <canvas ref={canvasRef} style={{ width: '180px', height: '180px', display: 'block' }} />
          </div>

          <button
            type="button"
            className="btn btn-primary text-xs w-full"
            onClick={handlePrintFlyer}
            style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
          >
            <Printer size={13} />
            Imprimir Volante 🖨️
          </button>
          
          <span style={{ fontSize: '0.6rem', color: '#555', marginTop: '0.5rem', textAlign: 'center' }}>
            Genera un documento PDF listo para exhibir en tu carnicería
          </span>
        </div>
      </div>

      {/* Printable Codes Display Area */}
      <div style={{ marginTop: '2.5rem', borderTop: '2.5px dashed #222', paddingTop: '1.5rem' }}>
        <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} style={{ color: '#ffcc00' }} /> Muestrario de Códigos de Mesa
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '1.25rem' }}>
          A continuación podés previsualizar la composición del cartel físico que irá pegado en el sector de cajas o en las mesas de tu local para que los clientes comiencen a raspar.
        </p>

        {/* Outer Frame Wrapper mimicking the printed flyer */}
        <div 
          style={{ 
            maxWidth: '420px', 
            margin: '0 auto', 
            background: flyerStyle === 'neon' ? '#0d0d0f' : (flyerStyle === 'brutalist' ? '#fbfbfb' : '#ffffff'),
            color: flyerStyle === 'neon' ? '#ffffff' : '#1c1917',
            border: flyerStyle === 'brutalist' ? '6px solid #000000' : (flyerStyle === 'neon' ? '6px solid #1a1a24' : '2px solid rgba(0,0,0,0.1)'),
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '10px 10px 0px rgba(0,0,0,0.4)',
            borderRadius: flyerStyle === 'classic' ? '4px' : '0px',
            position: 'relative'
          }}
        >
          <div 
            style={{ 
              display: 'inline-block',
              backgroundColor: flyerStyle === 'neon' ? '#00ff66' : (flyerStyle === 'brutalist' ? '#FF3B30' : darkColor),
              color: flyerStyle === 'neon' || flyerStyle === 'brutalist' ? '#000' : '#fff',
              padding: '4px 12px',
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '10px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1rem',
              borderRadius: '2px'
            }}
          >
            🥩 ESCANEÁ Y GANÁ AL INSTANTE 🥩
          </div>
          
          <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            {shopName}
          </div>
          
          <div 
            style={{ 
              fontFamily: '"Space Grotesk", sans-serif', 
              fontSize: '1.85rem', 
              fontWeight: 950, 
              lineHeight: 1.1, 
              textTransform: 'uppercase', 
              letterSpacing: '-0.04em',
              marginTop: '0.25rem',
              marginBottom: '1.5rem',
              color: flyerStyle === 'neon' ? '#ff3b30' : (flyerStyle === 'classic' ? darkColor : '#000')
            }}
          >
            {campaignName.replace(/🥩/g, '').trim()}
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem', display: 'inline-block', border: '2px solid #000', boxShadow: '4px 4px 0px #000', marginBottom: '1.5rem' }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Campaña" style={{ width: '130px', height: '130px', display: 'block' }} />
            ) : (
              <div style={{ width: '130px', height: '130px', background: '#ddd' }} />
            )}
          </div>

          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: flyerStyle === 'neon' ? '#a1a1aa' : '#555', margin: '0 0 1rem 0', lineHeight: 1.35 }}>
            Apuntá la cámara de tu celular al código QR para participar del juego interactivo y reclamar fabulosos premios en nuestro local.
          </p>

          <div style={{ borderTop: '1.5px dashed #ccc', paddingTop: '0.85rem', fontFamily: 'monospace', fontSize: '0.62rem', color: flyerStyle === 'neon' ? '#666' : '#999', wordBreak: 'break-all' }}>
            CÓDIGO DIGITAL: {qrUrl}
          </div>
        </div>
      </div>
    </div>
  );
}
