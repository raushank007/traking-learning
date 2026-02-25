import './globals.css';
import Sidebar from '../components/Sidebar';

// This metadata automatically generates <title> and <meta> tags for SEO
export const metadata = {
  title: 'Daily Learning Log',
  description: 'Tracking my daily technical learnings, notes, and code snippets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* The body uses Flexbox to place the Sidebar on the left
        and the main content area (children) on the right.
      */}
      <body className="flex min-h-screen bg-white text-gray-900 antialiased">

        {/* The Sidebar component we built earlier */}
        <Sidebar />

        {/* The main content area where your pages will render */}
        <main className="flex-1 overflow-y-auto max-h-screen p-8 md:p-12">
          {children}
        </main>

      </body>
    </html>
  );
}