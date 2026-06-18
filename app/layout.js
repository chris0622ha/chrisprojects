export const metadata = {
  title: "ChrisProjects — AccuratKey & TrivQuic",
  description: "ChrisProjects by chris0622ha — AccuratKey typing trainer and TrivQuic trivia app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#08080f", color: "#e0e0ff", fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
