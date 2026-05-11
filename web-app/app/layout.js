import './globals.css';
import { Poppins, Montserrat } from 'next/font/google';
import FloatingActions from '../components/FloatingActions';
import { LocalizationProvider } from '@/lib/currency';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-montserrat',
});

export const metadata = {
  title: 'DRIVE Mauritius | Premium Car Rental Marketplace',
  description: 'Ridiculously simple car rentals in Mauritius. Search, book, and drive with total transparency and 24/7 support.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${montserrat.variable} font-sans antialiased`}>
        <LocalizationProvider>
          <div className="min-h-screen flex flex-col">
            {children}
            <FloatingActions />
          </div>
        </LocalizationProvider>
      </body>
    </html>
  );
}