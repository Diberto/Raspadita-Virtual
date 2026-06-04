import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Carnicería Raspadita Virtual',
  description: 'Fidelización de Clientes para Carnicería - Raspá y Ganá con Panel de Administración',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
