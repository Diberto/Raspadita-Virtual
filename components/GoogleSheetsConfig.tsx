'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Check,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  LogOut,
  Sparkles,
  Lock,
  Database
} from 'lucide-react';
import { signInWithGoogleSheets, signOutGoogleSheets, createSheetsDocument } from '../lib/googleSheets';

interface GoogleSheetsConfigProps {
  shopName: string;
  googleToken: string | null;
  setGoogleToken: (token: string | null) => void;
  spreadsheetId: string;
  setSpreadsheetId: (id: string) => void;
  tabName: string;
  setTabName: (name: string) => void;
  sheetsFeedback: { type: 'success' | 'error' | null; message: string };
  setSheetsFeedback: (feedback: { type: 'success' | 'error' | null; message: string }) => void;
  persistState: (key: string, val: string) => void;
}

export default function GoogleSheetsConfig({
  shopName,
  googleToken,
  setGoogleToken,
  spreadsheetId,
  setSpreadsheetId,
  tabName,
  setTabName,
  sheetsFeedback,
  setSheetsFeedback,
  persistState,
}: GoogleSheetsConfigProps) {
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Sign In with Google
  const handleConnect = async () => {
    setIsConnecting(true);
    setSheetsFeedback({ type: null, message: '' });
    try {
      const result = await signInWithGoogleSheets();
      if (result) {
        setGoogleToken(result.token);
        setGoogleUser(result.user);
        setSheetsFeedback({
          type: 'success',
          message: `¡Cuenta vinculada con éxito! Conectado como ${result.user.displayName || result.user.email}`,
        });
        persistState('raspa_sheetsConnected', 'true');
      }
    } catch (error: any) {
      setSheetsFeedback({
        type: 'error',
        message: `Error al conectar con Google: ${error.message || 'Error desconocido'}`,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Sign Out from Google
  const handleDisconnect = async () => {
    try {
      await signOutGoogleSheets();
      setGoogleToken(null);
      setGoogleUser(null);
      setSheetsFeedback({
        type: 'success',
        message: 'Sesión de Google Sheets cerrada.',
      });
      persistState('raspa_sheetsConnected', 'false');
    } catch (error) {
      console.error(error);
    }
  };

  // Automatically Create a Google Sheets document on behalf of the user
  const handleAutoCreate = async () => {
    if (!googleToken) {
      setSheetsFeedback({
        type: 'error',
        message: 'Primero debes conectar tu cuenta de Google.',
      });
      return;
    }

    setIsCreating(true);
    setSheetsFeedback({ type: null, message: '' });

    const docName = `${shopName || 'Carnicería'} - Registro de Participantes`;
    const defaultTab = 'Participantes';

    try {
      const generatedSpreadsheetId = await createSheetsDocument(googleToken, docName, defaultTab);
      if (generatedSpreadsheetId) {
        setSpreadsheetId(generatedSpreadsheetId);
        setTabName(defaultTab);
        persistState('raspa_spreadsheetId', generatedSpreadsheetId);
        persistState('raspa_tabName', defaultTab);

        setSheetsFeedback({
          type: 'success',
          message: `¡Planilla creada con éxito! ID de Hoja asignado automáticamente. Ya puedes recibir registros en tiempo real.`,
        });
      }
    } catch (error: any) {
      setSheetsFeedback({
        type: 'error',
        message: `Error creando documento: ${error.message || 'Asegúrate de haber otorgado los permisos necesarios.'}`,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Explicit settings save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    persistState('raspa_spreadsheetId', spreadsheetId);
    persistState('raspa_tabName', tabName);
    setSheetsFeedback({
      type: 'success',
      message: 'Configuración de Google Sheets guardada con éxito.',
    });
  };

  return (
    <div style={{
      marginTop: '2rem',
      backgroundColor: '#121212',
      border: '2px solid #27272a',
      borderRadius: '6px',
      padding: '1.5rem',
      boxShadow: '4px 4px 0px rgba(0,0,0,0.8)'
    }} id="google-sheets-integration-panel">
      
      {/* Panel Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px dashed #27272a',
        paddingBottom: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet size={20} style={{ color: '#22c55e' }} />
          <h3 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.05rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            color: '#ffffff'
          }}>
            Integración con Google Sheets
          </h3>
        </div>
        <span style={{
          fontSize: '0.65rem',
          fontFamily: "'JetBrains Mono', monospace",
          padding: '2px 8px',
          borderRadius: '3px',
          backgroundColor: googleToken ? 'rgba(34,197,94,0.15)' : 'rgba(161,161,170,0.1)',
          color: googleToken ? '#4ade80' : '#a1a1aa',
          border: googleToken ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(161,161,170,0.15)'
        }}>
          {googleToken ? 'CONECTADO' : 'DESCONECTADO'}
        </span>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '1.25rem', lineHeight: '1.4' }}>
        Envia de manera automática e instantánea los datos recolectados en el formulario de la raspadita (Nombre, Celular, Email y Premio asignado) directamente como una nueva fila en una hoja de Google Sheets.
      </p>

      {/* Auth Status Block */}
      {!googleToken ? (
        <div style={{
          padding: '1rem',
          backgroundColor: '#161618',
          border: '1px solid #27272a',
          borderRadius: '4px',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#d4d4d8', marginBottom: '0.85rem' }}>
            Vincular la cuenta del Administrador para habilitar el guardado en la nube:
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={isConnecting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontWeight: '700',
              fontSize: '0.75rem',
              gap: '8px',
              padding: '0.65rem 1.25rem',
              border: '2px solid #ffffff',
              transition: 'all 0.15s ease'
            }}
          >
            {isConnecting ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Conectando...
              </>
            ) : (
              <>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '15px', height: '15px' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                Iniciar Sesión con Google
              </>
            )}
          </button>
        </div>
      ) : (
        <div style={{
          padding: '0.85rem 1rem',
          backgroundColor: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.18)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {googleUser?.photoURL ? (
              <img
                src={googleUser.photoURL}
                alt="Google Avatar"
                referrerPolicy="no-referrer"
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            ) : (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--theme-primary)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                G
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>
                {googleUser?.displayName || 'Google sheets'}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#a1a1aa' }}>
                {googleUser?.email || 'Conexión activa'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDisconnect}
            style={{
              background: 'none',
              border: 'none',
              color: '#f87171',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.65rem',
              fontWeight: '600',
              padding: '4px 8px',
              borderRadius: '3px',
              backgroundColor: 'rgba(239,68,68,0.08)'
            }}
          >
            <LogOut size={12} /> Desconectar
          </button>
        </div>
      )}

      {/* Sheets Settings form */}
      <form onSubmit={handleSaveSettings}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>ID de la Hoja de Google (Spreadsheet ID)</label>
              
              {googleToken && (
                <button
                  type="button"
                  onClick={handleAutoCreate}
                  disabled={isCreating}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#22c55e',
                    cursor: 'pointer',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textTransform: 'uppercase'
                  }}
                >
                  <Sparkles size={11} /> {isCreating ? 'Creando...' : 'Crear Planilla en Drive ✨'}
                </button>
              )}
            </div>

            <input
              type="text"
              className="form-input"
              value={spreadsheetId}
              onChange={(e) => {
                setSpreadsheetId(e.target.value);
                persistState('raspa_spreadsheetId', e.target.value);
              }}
              placeholder="Ej: 1A2b3C4d... (Dejar en blanco para simulación offline)"
              style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nombre de Pestaña (Tab ID)</label>
              <input
                type="text"
                className="form-input"
                value={tabName}
                onChange={(e) => {
                  setTabName(e.target.value);
                  persistState('raspa_tabName', e.target.value);
                }}
                placeholder="Ej: Participantes"
                style={{ fontSize: '0.75rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Documento Planilla</label>
              <div style={{
                height: '35px',
                backgroundColor: '#161618',
                border: '1px solid #27272a',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 0.75rem',
                fontSize: '0.65rem',
                color: '#a1a1aa',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <Database size={11} style={{ marginRight: '6px', color: '#22c55e' }} />
                {shopName || 'Carnicería'} - Leads Sorteo
              </div>
            </div>
          </div>

          {/* Quick link button to check the connected Sheet live */}
          {spreadsheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.7rem',
                color: '#22c55e',
                fontWeight: '700',
                padding: '0.45rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(34,197,94,0.06)',
                border: '1px dashed rgba(34,197,94,0.25)',
                textDecoration: 'none',
                marginTop: '3px',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
              className="hover:bg-green-950"
            >
              Abrir Hoja de Cálculo en Google Drive <ExternalLink size={12} />
            </a>
          )}

          {/* Action Feedbacks */}
          {sheetsFeedback.type && (
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: '600',
              lineHeight: '1.3',
              backgroundColor: sheetsFeedback.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: sheetsFeedback.type === 'success' ? '#4ade80' : '#f87171',
              border: `1px solid ${sheetsFeedback.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              {sheetsFeedback.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              type="submit"
              className="btn btn-secondary text-xs"
              style={{ width: '100%', padding: '0.55rem' }}
            >
              Guardar Identidad de Hoja
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
