import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { BridgePage } from '@/pages/BridgePage';
import { StakePage } from '@/pages/StakePage';
import { YieldPage } from '@/pages/YieldPage';
import './index.css';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Router>
        <div className="min-h-screen bg-background">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/bridge" element={<BridgePage />} />
              <Route path="/stake" element={<StakePage />} />
              <Route path="/yield" element={<YieldPage />} />
            </Routes>
          </Layout>
          <Toaster richColors position="top-right" />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;