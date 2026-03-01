import './globals.css';
import { Inter, Rye } from 'next/font/google';
import Sidebar from '../components/Sidebar';

// 1. Standard font for easy reading
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// 2. Pirate-themed font for headings and titles!
const pirateFont = Rye({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pirate',
});

export const metadata = {
  title: "The Grand Line Logbook | Raushan's Dev Blog",
  description: 'My journey to conquering system design and software engineering.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* THEME UPDATE:
        1. Injected the font variables.
        2. Changed bg to amber-50 (parchment).
        3. Changed text highlight selection to Luffy Red/Pink.
      */}
      <body className={`${inter.variable} ${pirateFont.variable} font-sans flex min-h-screen bg-amber-50 text-slate-800 antialiased selection:bg-red-200 selection:text-red-900`}>

        {/* Render the Sidebar permanently */}
        <Sidebar />

        {/* 1. Kept your exact md:ml-72 to push content past the fixed sidebar.
          2. Kept min-w-0 and max-h-screen for proper scrolling.
        */}
        <main className="flex-1 min-w-0 md:ml-72 overflow-y-auto max-h-screen p-8 md:p-12 flex flex-col">

          <div className="flex-1">
            {children}
          </div>

          {/* PIRATE-THEMED DEVELOPER FOOTER */}
          <footer className="mt-20 pt-8 border-t border-amber-200/60 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-amber-700/70 pb-8">
            <p>&copy; {new Date().getFullYear()} Raushan. All rights reserved.</p>
            <div className="flex gap-6 font-bold tracking-wider">
              <a href="https://github.com/raushank007" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">GitHub</a>
              <a href="https://www.linkedin.com/in/newleaf007" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">LinkedIn</a>
              <a href="https://leetcode.com/u/raushankumarcse137" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">LeetCode</a>
            </div>
          </footer>

        </main>
      </body>
    </html>
  );
}