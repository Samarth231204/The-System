import './globals.css';
import { theme, rootStyle } from '@/theme/tokens';
import Background from '@/components/arcade/Background';

export const metadata = {
  title: 'The System',
  description: 'Clear quests, earn XP from an AI judge, and spend it on the targets you care about.',
};

export const viewport = {
  themeColor: '#04050b',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={rootStyle()}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={theme.fonts.googleHref} />
      </head>
      <body>
        <Background />
        {children}
      </body>
    </html>
  );
}
