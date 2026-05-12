import './globals.css';

export const metadata = {
  title: 'Vir Medicina Capilar — Restauración capilar premium',
  description: 'Trasplante capilar de alta gama. Diagnóstico con IA, resultados permanentes y naturales. Hecho por especialistas, entregado con discreción.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
