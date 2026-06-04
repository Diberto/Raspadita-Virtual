'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App gracefully (no duplicate initialization error)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let cachedToken: string | null = null;
let isSigningIn = false;

// Authenticate with Google and get Sheets Token
export const signInWithGoogleSheets = async (): Promise<{ user: User; token: string } | null> => {
  if (isSigningIn) return null;
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google Sheets access token.');
    }
    cachedToken = credential.accessToken;
    return {
      user: result.user,
      token: credential.accessToken,
    };
  } catch (error) {
    console.error('Error during Google Sheets Sign-In:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign Out
export const signOutGoogleSheets = async (): Promise<void> => {
  try {
    await signOut(auth);
    cachedToken = null;
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

// Create a new Spreadsheet and structure it with custom headers
export const createSheetsDocument = async (
  token: string,
  docName: string,
  tabName: string
): Promise<string> => {
  try {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        properties: {
          title: docName || 'Campaña de Fidelización Virtual',
        },
        sheets: [
          {
            properties: {
              title: tabName || 'Participantes',
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al crear la hoja de cálculo');
    }

    const data = await response.json();
    const spreadsheetId = data.spreadsheetId;

    // Append Header Row instantly to provide ready template structure
    await appendLeadToSheets(token, spreadsheetId, tabName, [
      'Fecha y Hora',
      'Nombre de Participante',
      'Celular / WhatsApp',
      'Email',
      'Premio Asignado',
      'Código de Cupón',
      'Estado de Canje',
    ]);

    return spreadsheetId;
  } catch (error) {
    console.error('Error in createSheetsDocument:', error);
    throw error;
  }
};

// Append a new registration lead dynamically
export const appendLeadToSheets = async (
  token: string,
  spreadsheetId: string,
  tabName: string,
  rowData: string[]
): Promise<boolean> => {
  try {
    const formattedRange = encodeURIComponent(`${tabName || 'Participantes'}!A1`);
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formattedRange}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sheets Append details error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to append row to Google Sheets:', error);
    return false;
  }
};
