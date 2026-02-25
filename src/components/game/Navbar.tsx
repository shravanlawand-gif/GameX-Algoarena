import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50"
      style={{ background: "hsl(220 50% 5% / 0.85)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <motion.button
          onClick={() => navigate("/")}
          className="font-display text-lg text-primary tracking-widest"
          style={{ textShadow: "0 0 20px hsl(195 100% 50% / 0.3)" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          CODE ARENA
        </motion.button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Home", path: "/" },
            { label: "Play", path: "/game" },
            { label: "Profile", path: "/profile" },
          ].map(item => (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-1.5 rounded-lg font-display text-xs uppercase tracking-wider transition-all duration-300 ${
                location.pathname === item.path
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {item.label}
              {location.pathname === item.path && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-primary"
                  style={{ boxShadow: "0 0 8px hsl(195 100% 50% / 0.5)" }}
                />
              )}
            </motion.button>
          ))}

          {/* Profile avatar */}
          <div className="relative ml-3">
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-sm hover:border-primary transition-colors overflow-hidden"
              whileHover={{ scale: 1.1, boxShadow: "0 0 12px hsl(195 100% 50% / 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              👤
            </motion.button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50"
                    style={{ boxShadow: "0 10px 40px hsl(0 0% 0% / 0.5), 0 0 20px hsl(195 100% 50% / 0.05)" }}
                  >
                    {[
                      { icon: "👤", label: "Profile", action: () => { navigate("/profile"); setMenuOpen(false); } },
                      { icon: "📊", label: "Game History", action: () => setMenuOpen(false) },
                      { icon: "⚙️", label: "Settings", action: () => setMenuOpen(false) },
                    ].map((item, i) => (
                      <motion.button
                        key={item.label}
                        onClick={item.action}
                        className="w-full px-4 py-2.5 text-left text-sm font-body text-foreground hover:bg-primary/5 transition-colors flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ x: 4 }}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </motion.button>
                    ))}
                    <div className="border-t border-border" />
                    <motion.button
                      onClick={() => setMenuOpen(false)}
                      className="w-full px-4 py-2.5 text-left text-sm font-body text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors flex items-center gap-2"
                      whileHover={{ x: 4 }}
                    >
                      🚪 Sign In
                    </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5">
          <motion.span animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block w-5 h-0.5 bg-foreground" />
          <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="block w-5 h-0.5 bg-foreground" />
          <motion.span animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block w-5 h-0.5 bg-foreground" />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border bg-card"
          >
            <div className="p-4 space-y-1">
              {[
                { label: "🏠 Home", path: "/" },
                { label: "🎮 Play", path: "/game" },
                { label: "👤 Profile", path: "/profile" },
                { label: "🏆 Leaderboard", path: "/" },
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  onClick={() => { navigate(item.path); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg font-body text-sm text-foreground hover:bg-primary/5 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="border-t border-border pt-2">
                <motion.button
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-3 py-2.5 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ x: 4 }}
                >
                  🚪 Sign In
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
