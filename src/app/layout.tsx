import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: "Raushan's Dev Blog",
  description: 'Technical learnings, system design, and software engineering.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">

        {/* Render the Sidebar permanently */}
        <Sidebar />

        {/* THE FIX:
          1. Added `md:ml-72` to push the content past the 72-width fixed sidebar.
          2. Added `min-w-0` to prevent flexbox from overflowing the screen.
          3. Removed `w-full` to prevent horizontal scrolling.
        */}
        <main className="flex-1 min-w-0 md:ml-72 overflow-y-auto max-h-screen p-8 md:p-12 flex flex-col">

          <div className="flex-1">
            {children}
          </div>

          {/* PUBLIC DEVELOPER FOOTER */}
          <footer className="mt-20 pt-8 border-t border-slate-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 pb-8">
            <p>&copy; {new Date().getFullYear()} Raushan. All rights reserved.</p>
            <div className="flex gap-6 font-medium">
              <a href="https://github.com/raushank007" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">GitHub</a>
              <a href="https://www.linkedin.com/in/newleaf007" className="hover:text-slate-900 transition-colors">LinkedIn</a>
              <a href="https://leetcode.com/u/raushankumarcse137" className="hover:text-slate-900 transition-colors">LeetCode</a>
            </div>
          </footer>

        </main>
      </body>
    </html>
  );
}