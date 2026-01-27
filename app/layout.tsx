import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { CharacterProvider } from '@/contexts/CharacterContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeKingdom',
  description: 'Learn to code through interactive games',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <CharacterProvider>
            {children}
          </CharacterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
