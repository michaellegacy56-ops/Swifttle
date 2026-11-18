export const metadata = {
  title: 'Swifttle',
  description: 'Campus shuttle app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
