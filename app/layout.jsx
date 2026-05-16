import Navigation from '../components/Navigation';
import Cursor from '../components/Cursor';
import ClientScripts from '../components/ClientScripts';
import Loader from '../components/Loader';
import AmbientOrbs from '../components/AmbientOrbs';
import ScrollProgress from '../components/ScrollProgress';
import PageTransition from '../components/PageTransition';
import Chapters from '../components/Chapters';
import { Space_Mono, Syne } from 'next/font/google';
import './globals.css';
import './rhlz-effects.css';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-mono',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
});

export const metadata = {
  title: 'Raheel Hosmani - AI/ML Engineer',
  description: 'Portfolio describing experiments, work and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${syne.variable}`}>
      <body>
        <Loader />
        <AmbientOrbs />
        <ScrollProgress />
        <Cursor />
        <Navigation />
        <Chapters />
        <PageTransition>
          {children}
          <footer>
            <div className="footer-left">(c) 2026 Raheel Hosmani - Hubli, Karnataka, India</div>
            <div className="footer-right">Built with intent &middot; <span>No templates used</span></div>
          </footer>
        </PageTransition>
        <ClientScripts />
      </body>
    </html>
  );
}
