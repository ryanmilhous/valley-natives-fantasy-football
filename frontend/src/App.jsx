import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Seasons from './pages/Seasons';
import Matchups from './pages/Matchups';
import HeadToHead from './pages/HeadToHead';
import Teams from './pages/Teams';
import Records from './pages/Records';
import Draft from './pages/Draft';
import Rosters from './pages/Rosters';
import Trades from './pages/Trades';

function NavLink({ to, children, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-[var(--vn-gold-500)]/20 text-[var(--vn-text-primary)] shadow-lg'
          : 'text-[var(--vn-text-secondary)] hover:text-[var(--vn-text-primary)] hover:bg-[var(--vn-surface-700)]/70'
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="vn-shell min-h-screen bg-gradient-to-br from-[var(--vn-bg-900)] via-[var(--vn-bg-800)] to-[var(--vn-bg-900)] text-[var(--vn-text-primary)]">
        {/* Navigation */}
        <nav className="vn-nav sticky top-0 z-50 border-b border-[var(--vn-gold-500)]/20 bg-gradient-to-r from-[var(--vn-surface-700)]/95 via-[var(--vn-redwood-600)]/85 to-[var(--vn-surface-700)]/95 backdrop-blur-lg shadow-2xl">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-200">🏈</div>
                <div>
                  <div className="text-base sm:text-xl font-bold text-[var(--vn-text-primary)] tracking-tight">
                    Valley Natives
                  </div>
                  <div className="text-xs text-[var(--vn-text-secondary)] font-medium hidden sm:block">Fantasy Football</div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-2">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/records">Records</NavLink>
                <NavLink to="/seasons">Seasons</NavLink>
                <NavLink to="/draft">Draft</NavLink>
                <NavLink to="/trades">Trades</NavLink>
                <NavLink to="/head-to-head">H2H</NavLink>
                <NavLink to="/matchups">Matchups</NavLink>
                <NavLink to="/rosters">Rosters</NavLink>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[var(--vn-text-primary)] hover:bg-[var(--vn-surface-700)]/70 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden pb-4 space-y-2">
                <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
                <NavLink to="/records" onClick={() => setMobileMenuOpen(false)}>Records</NavLink>
                <NavLink to="/seasons" onClick={() => setMobileMenuOpen(false)}>Seasons</NavLink>
                <NavLink to="/draft" onClick={() => setMobileMenuOpen(false)}>Draft</NavLink>
                <NavLink to="/trades" onClick={() => setMobileMenuOpen(false)}>Trades</NavLink>
                <NavLink to="/head-to-head" onClick={() => setMobileMenuOpen(false)}>H2H</NavLink>
                <NavLink to="/matchups" onClick={() => setMobileMenuOpen(false)}>Matchups</NavLink>
                <NavLink to="/rosters" onClick={() => setMobileMenuOpen(false)}>Rosters</NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="/matchups" element={<Matchups />} />
            <Route path="/head-to-head" element={<HeadToHead />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/records" element={<Records />} />
            <Route path="/draft" element={<Draft />} />
            <Route path="/rosters" element={<Rosters />} />
            <Route path="/trades" element={<Trades />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="vn-footer mt-20 border-t border-[var(--vn-gold-500)]/20 bg-[var(--vn-bg-800)]/75 backdrop-blur-lg py-8">
          <div className="container mx-auto px-6 text-center">
            <p className="font-medium text-[var(--vn-text-primary)]">Valley Natives Fantasy Football</p>
            <p className="mt-2 text-sm text-[var(--vn-text-secondary)]">Historical Data Explorer • 2007-2025</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
