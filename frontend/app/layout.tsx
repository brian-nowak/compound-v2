import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { UserProvider } from '@/app/lib/user-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
