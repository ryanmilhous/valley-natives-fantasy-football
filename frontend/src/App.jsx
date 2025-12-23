import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Seasons from './pages/Seasons';
import Matchups from './pages/Matchups';
import HeadToHead from './pages/HeadToHead';
import Teams from './pages/Teams';
import Playoffs from './pages/Playoffs';
import Records from './pages/Records';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-white/20 text-white shadow-lg'
          : 'text-white/80 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-lg shadow-2xl sticky top-0 z-50 border-b border-white/10">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-200">🏈</div>
                <div>
                  <div className="text-xl font-bold text-white tracking-tight">
                    Valley Natives
                  </div>
                  <div className="text-xs text-white/70 font-medium">Fantasy Football</div>
                </div>
              </Link>
              <div className="flex items-center space-x-2">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/seasons">Seasons</NavLink>
                <NavLink to="/matchups">Matchups</NavLink>
                <NavLink to="/head-to-head">H2H</NavLink>
                <NavLink to="/teams">Teams</NavLink>
                <NavLink to="/playoffs">Playoffs</NavLink>
                <NavLink to="/records">Records</NavLink>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="/matchups" element={<Matchups />} />
            <Route path="/head-to-head" element={<HeadToHead />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/playoffs" element={<Playoffs />} />
            <Route path="/records" element={<Records />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900/50 backdrop-blur-lg border-t border-white/10 py-8 mt-20">
          <div className="container mx-auto px-6 text-center">
            <p className="text-white/80 font-medium">Valley Natives Fantasy Football</p>
            <p className="text-sm text-white/50 mt-2">Historical Data Explorer • 2020-2025</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
