import './globals.css';
import { Inter, Rye } from 'next/font/google';
import Sidebar from '../components/Sidebar';
import { getAllPosts } from '../lib/markdown'; // 🌟 1. Added this import

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
  // 🌟 2. Fetch all posts on the server side
  const allPosts = getAllPosts();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${pirateFont.variable} font-sans flex min-h-screen bg-amber-50 text-slate-800 antialiased selection:bg-red-200 selection:text-red-900`}>

        {/* 🌟 3. Pass the posts down to the Sidebar as a prop */}
        <Sidebar posts={allPosts} />

        {/* New: Small padding on mobile (p-4), large on desktop (md:p-12) */}
        <main className="flex-1 min-w-0 overflow-y-auto max-h-screen p-4 sm:p-6 md:p-12 flex flex-col transition-all duration-300 ease-in-out relative">

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