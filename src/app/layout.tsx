import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'School Result Management System',
  description: 'A comprehensive school result management system for teachers and students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
