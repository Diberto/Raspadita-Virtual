'use client';

import React, { useState } from 'react';

interface HeatmapDataPoint {
  day: string;
  hour: number;
  count: number;
}

interface PeakActivityHeatmapProps {
  data: HeatmapDataPoint[];
  themeSelected: string;
}

export default function PeakActivityHeatmap({ data, themeSelected }: PeakActivityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; count: number } | null>(null);

  const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  const HOUR_BLOCKS = [8, 10, 12, 14, 16, 18, 20, 22];

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'prime':
        return '255, 59, 48'; // Red
      case 'charcoal':
        return '255, 255, 255'; // White
      case 'wood':
        return '180, 83, 9'; // Amber/Brown
      case 'organic':
        return '16, 185, 129'; // Green
      default:
        return '251, 191, 36'; // Gold/Amber
    }
  };

  const colorRGB = getThemeColor(themeSelected);

  // Find max count to scale opacity
  let maxCount = 0;
  DAYS.forEach(day => {
    HOUR_BLOCKS.forEach(hour => {
      const match = data.find(p => p.day === day && p.hour === hour);
      if (match && match.count > maxCount) {
        maxCount = match.count;
      }
    });
  });
  if (maxCount === 0) maxCount = 1;

  const getCellOpacityAndBg = (count: number) => {
    if (count === 0) return '#161618'; // Empty / Low active
    const ratio = count / maxCount;
    const opacity = 0.15 + ratio * 0.85;
    return `rgba(${colorRGB}, ${opacity})`;
  };

  return (
    <div style={{
      background: '#121214',
      border: '1px solid #222',
      borderRadius: '6px',
      padding: '1.25rem',
      marginTop: '1.5rem',
      fontFamily: '"Inter", sans-serif'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', margin: '0', textTransform: 'uppercase', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.5px' }}>
          🔥 Mapa de Calor de Actividad Horaria (Peak Activity Times)
        </h4>
        <p style={{ fontSize: '0.65rem', color: '#888', margin: '2px 0 0' }}>Análisis interactivo de días y horarios de mayor raspe de tarjetas por los participantes.</p>
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <div style={{ minWidth: '450px', padding: '0.5rem 0' }}>
          {/* Header Hour Labels */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            {/* Corner spacer */}
            <div style={{ width: '45px', fontSize: '0.65rem', color: '#71717a', fontWeight: 'bold', textAlign: 'center' }}>Día</div>
            <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
              {HOUR_BLOCKS.map(hour => (
                <div key={hour} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: '#71717a', fontWeight: 'bold', fontFamily: '"JetBrains Mono", monospace' }}>
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Grid Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {DAYS.map(day => (
              <div key={day} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Day label */}
                <div style={{ width: '45px', fontSize: '0.7rem', color: '#fff', fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif', textTransform: 'uppercase' }}>
                  {day}
                </div>

                {/* Grid cells */}
                <div style={{ display: 'flex', flex: 1, gap: '4px' }}>
                  {HOUR_BLOCKS.map(hour => {
                    const matched = data.find(p => p.day === day && p.hour === hour);
                    const count = matched ? matched.count : 0;
                    const cellBg = getCellOpacityAndBg(count);
                    const isHovered = hoveredCell && hoveredCell.day === day && hoveredCell.hour === hour;

                    return (
                      <div
                        key={hour}
                        onMouseEnter={() => setHoveredCell({ day, hour, count })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          flex: 1,
                          height: '28px',
                          borderRadius: '3px',
                          backgroundColor: cellBg,
                          border: isHovered ? '2px solid #fff' : '1px solid rgba(255, 255, 255, 0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          color: count > (maxCount * 0.5) ? '#000' : '#fff',
                          fontWeight: 'bold',
                          fontFamily: '"JetBrains Mono", monospace'
                        }}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footnotes and Tooltips detail */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid #222', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.65rem', color: '#a1a1aa' }}>
              {hoveredCell ? (
                <span>
                  📍 <b>{hoveredCell.day} a las {hoveredCell.hour.toString().padStart(2, '0')}:00 hrs:</b> <span style={{ color: `rgb(${colorRGB})`, fontWeight: 'bold' }}>{hoveredCell.count} raspadas registradas</span>
                </span>
              ) : (
                <span>💡 Posicioná el cursor sobre los recuadros para ver los detalles de actividad.</span>
              )}
            </div>

            {/* Legend scale */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.6rem', color: '#71717a' }}>Menos</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <div style={{ width: 10, height: 10, backgroundColor: '#161618', borderRadius: '1px' }} />
                <div style={{ width: 10, height: 10, backgroundColor: `rgba(${colorRGB}, 0.25)`, borderRadius: '1px' }} />
                <div style={{ width: 10, height: 10, backgroundColor: `rgba(${colorRGB}, 0.5)`, borderRadius: '1px' }} />
                <div style={{ width: 10, height: 10, backgroundColor: `rgba(${colorRGB}, 0.75)`, borderRadius: '1px' }} />
                <div style={{ width: 10, height: 10, backgroundColor: `rgba(${colorRGB}, 1.0)`, borderRadius: '1px' }} />
              </div>
              <span style={{ fontSize: '0.6rem', color: '#71717a' }}>Más</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
