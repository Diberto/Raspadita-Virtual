'use client';

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DailyTrend {
  date: string;
  wins: number;
  unclaimed: number;
}

interface Prize {
  id: string;
  name: string;
  probability: number;
  stock: number;
  claimed: number;
  redeemed: number;
  icon: string;
}

interface WinningChartsProps {
  winningHistory: DailyTrend[];
  prizes: Prize[];
  themeSelected: string;
}

const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'prime':
      return { primary: '#FF3B30', accent: '#FFD700', primaryLight: 'rgba(255, 59, 48, 0.15)' };
    case 'charcoal':
      return { primary: '#FFFFFF', accent: '#FF3B30', primaryLight: 'rgba(255, 255, 255, 0.15)' };
    case 'wood':
      return { primary: '#b45309', accent: '#F59E0B', primaryLight: 'rgba(180, 83, 9, 0.15)' };
    case 'organic':
      return { primary: '#10b981', accent: '#34d399', primaryLight: 'rgba(16, 185, 129, 0.15)' };
    default:
      return { primary: '#FF3B30', accent: '#FFD700', primaryLight: 'rgba(255, 59, 48, 0.15)' };
  }
};

export default function WinningCharts({ winningHistory, prizes, themeSelected }: WinningChartsProps) {
  const lineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pieCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartInstanceRef = useRef<Chart | null>(null);
  const pieChartInstanceRef = useRef<Chart | null>(null);

  const colors = getThemeColors(themeSelected);

  // Totals for the Pie / Doughnut Chart
  const totalStock = prizes.reduce((sum, p) => sum + p.stock, 0);
  const totalRedeemed = prizes.reduce((sum, p) => sum + p.redeemed, 0);
  const totalUnredeemed = prizes.reduce((sum, p) => sum + Math.max(0, p.claimed - p.redeemed), 0);

  // Ref-based dynamic updates to prevent memory leaks and handle hot-switching
  useEffect(() => {
    if (!lineCanvasRef.current) return;

    if (lineChartInstanceRef.current) {
      lineChartInstanceRef.current.destroy();
    }

    const ctx = lineCanvasRef.current.getContext('2d');
    if (ctx) {
      lineChartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: winningHistory.map(item => item.date),
          datasets: [
            {
              label: 'Premios Ganados',
              data: winningHistory.map(item => item.wins),
              borderColor: colors.primary,
              backgroundColor: colors.primaryLight,
              borderWidth: 2.5,
              tension: 0.35,
              fill: true,
              pointBackgroundColor: colors.primary,
              pointBorderColor: '#121214',
              pointBorderWidth: 1.5,
              pointRadius: 4,
              pointHoverRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#121214',
              titleColor: '#fff',
              bodyColor: '#a1a1aa',
              borderColor: '#27272a',
              borderWidth: 1,
              titleFont: { family: 'Space Grotesk', size: 11, weight: 'bold' },
              bodyFont: { family: 'Inter', size: 11 },
              padding: 10,
              displayColors: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#71717a',
                font: { family: 'Space Grotesk', size: 9, weight: 'bold' }
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.04)'
              },
              ticks: {
                color: '#71717a',
                font: { family: 'JetBrains Mono', size: 9 },
                precision: 0
              },
              border: {
                dash: [4, 4]
              }
            }
          }
        }
      });
    }

    return () => {
      if (lineChartInstanceRef.current) {
        lineChartInstanceRef.current.destroy();
      }
    };
  }, [winningHistory, colors]);

  useEffect(() => {
    if (!pieCanvasRef.current) return;

    if (pieChartInstanceRef.current) {
      pieChartInstanceRef.current.destroy();
    }

    const ctx = pieCanvasRef.current.getContext('2d');
    if (ctx) {
      pieChartInstanceRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Stock Disponible', 'Premios Entregados', 'Ganados Pendientes'],
          datasets: [
            {
              data: [totalStock, totalRedeemed, totalUnredeemed],
              backgroundColor: [
                colors.accent,       // Stock Disponible
                colors.primary,      // Premios Entregados (Canjeados)
                'rgba(113, 113, 122, 0.4)' // Ganados pero pendientes
              ],
              borderColor: '#121214',
              borderWidth: 2,
              hoverOffset: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#121214',
              titleColor: '#fff',
              bodyColor: '#a1a1aa',
              borderColor: '#27272a',
              borderWidth: 1,
              titleFont: { family: 'Space Grotesk', size: 11, weight: 'bold' },
              bodyFont: { family: 'Inter', size: 11 },
              padding: 10,
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0) as number;
                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                  return ` ${label}: ${value} u. (${percentage}%)`;
                }
              }
            }
          },
          cutout: '65%'
        }
      });
    }

    return () => {
      if (pieChartInstanceRef.current) {
        pieChartInstanceRef.current.destroy();
      }
    };
  }, [prizes, colors, totalStock, totalRedeemed, totalUnredeemed]);

  return (
    <div 
      className="card-panel" 
      style={{ 
        background: '#121214', 
        border: '1px solid #222', 
        borderRadius: '6px', 
        padding: '1.25rem', 
        marginTop: '1.5rem',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '0.5rem' }}>
        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', margin: '0', textTransform: 'uppercase', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.5px' }}>
            📊 Centro de Estadísticas y Control de Inventario
          </h4>
          <p style={{ fontSize: '0.65rem', color: '#888', margin: '2px 0 0' }}>Análisis en tiempo real de actividad y distribución de premios</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.65rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, backgroundColor: colors.primary, borderRadius: '50%' }} />
            Canjeados: <b>{totalRedeemed} u.</b>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, backgroundColor: colors.accent, borderRadius: '50%' }} />
            Stock Disponible: <b>{totalStock} u.</b>
          </span>
          {totalUnredeemed > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 8, height: 8, backgroundColor: 'rgba(113, 113, 122, 0.4)', borderRadius: '50%' }} />
              Ganados Pendientes: <b>{totalUnredeemed} u.</b>
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', width: '100%' }}>
        {/* Line Chart Panel */}
        <div style={{ flex: '1 1 340px', minWidth: '280px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.625rem', color: '#71717a', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '0.35rem', display: 'block' }}>
            📈 Histórico de Ganadores (Ganados x Día)
          </span>
          <div style={{ height: '170px', position: 'relative', width: '100%', backgroundColor: '#09090b', border: '1px solid #1c1c1f', borderRadius: '4px', padding: '0.5rem' }}>
            <canvas ref={lineCanvasRef} />
          </div>
        </div>

        {/* Pie/Doughnut Chart Panel */}
        <div style={{ flex: '1 1 220px', minWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.625rem', color: '#71717a', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '0.35rem', display: 'block', width: '100%', textAlign: 'left' }}>
            🍩 Distribución de Inventario
          </span>
          <div style={{ display: 'flex', width: '100%', gap: '0.75rem', alignItems: 'center', backgroundColor: '#09090b', border: '1px solid #1c1c1f', borderRadius: '4px', padding: '0.5rem 0.75rem', height: '170px' }}>
            <div style={{ width: '110px', height: '110px', position: 'relative' }}>
              <canvas ref={pieCanvasRef} />
            </div>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.65rem' }}>
                <span style={{ color: '#71717a', display: 'block' }}>Stock Total:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fff', fontFamily: '"Space Grotesk", sans-serif' }}>
                  {totalStock + totalRedeemed + totalUnredeemed} u.
                </span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#1e1e24' }} />
              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.6rem', color: '#a1a1aa' }}>
                  <span style={{ width: 6, height: 6, backgroundColor: colors.accent, borderRadius: '50%' }} />
                  {totalStock} u. Libres
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.6rem', color: '#a1a1aa', marginTop: '2px' }}>
                  <span style={{ width: 6, height: 6, backgroundColor: colors.primary, borderRadius: '50%' }} />
                  {totalRedeemed} u. Entregados
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
