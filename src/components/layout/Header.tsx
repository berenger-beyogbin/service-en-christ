import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Church, Search, User, LogOut, Shield, Briefcase, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white shadow-xs">
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo / Branding */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform group-hover:scale-105">
            <Church className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="h-5 w-px bg-gray-300" />
          <span className="font-sans font-bold text-[15px] md:text-base tracking-tight text-primary">Service en Christ</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <Link
            to="/recherche"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text hover:text-primary transition-colors"
          >
            <Search className="h-4 w-4" />
            Rechercher
          </Link>

          {user ? (
            <>
              <div className="h-4 w-px bg-gray-200 mx-0.5" />

              {profile?.is_admin && (
                <>
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-accent hover:text-amber-600 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Administration
                  </Link>
                  <div className="h-4 w-px bg-gray-200 mx-0.5" />
                </>
              )}

              <Link
                to="/prestataire/tableau-de-bord"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text hover:text-primary transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                Mon Espace
              </Link>

              <div className="h-4 w-px bg-gray-200 mx-0.5" />

              <Link
                to="/profil"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text hover:text-primary transition-colors"
              >
                <User className="h-4 w-4" />
                Mon Profil
              </Link>

              <div className="h-4 w-px bg-gray-200 mx-0.5" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-danger hover:text-red-700 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <div className="h-4 w-px bg-gray-200 mx-0.5" />

              <Link
                to="/prestataire/creer"
                className="px-3 py-2 text-sm font-medium text-text hover:text-primary transition-colors"
              >
                Devenir prestataire
              </Link>

              <div className="h-4 w-px bg-gray-200 mx-0.5" />

              <Link
                to="/auth/connexion"
                className="px-3 py-2 text-sm font-medium text-text hover:text-primary transition-colors"
              >
                Connexion
              </Link>

              <div className="h-4 w-px bg-gray-200 mx-0.5" />

              <Link
                to="/auth/inscription"
                className="ml-2 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-secondary transition-colors shadow-xs"
              >
                S'inscrire
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-text md:hidden hover:bg-gray-100 rounded-lg cursor-pointer"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 shadow-md space-y-1 absolute top-14 md:top-16 left-0 w-full animate-fade-in">
          <Link
            to="/recherche"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-text hover:bg-gray-50"
          >
            <Search className="h-5 w-5 text-muted" />
            Rechercher
          </Link>

          {user ? (
            <>
              {profile?.is_admin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-accent hover:bg-amber-50"
                >
                  <Shield className="h-5 w-5" />
                  Espace Administration
                </Link>
              )}
              <Link
                to="/prestataire/tableau-de-bord"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-text hover:bg-gray-50"
              >
                <Briefcase className="h-5 w-5" />
                Mon Espace
              </Link>
              <Link
                to="/profil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-text hover:bg-gray-50"
              >
                <User className="h-5 w-5" />
                Mon Profil Personnel
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-danger hover:bg-red-50 text-left cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/prestataire/creer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-primary hover:bg-sky-50"
              >
                <Briefcase className="h-5 w-5" />
                Devenir prestataire
              </Link>
              <div className="grid grid-cols-2 gap-3 pt-3">
                <Link
                  to="/auth/connexion"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-lg border border-border text-center text-sm font-medium text-text hover:bg-gray-50"
                >
                  Connexion
                </Link>
                <Link
                  to="/auth/inscription"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-lg bg-primary text-center text-sm font-semibold text-white hover:bg-secondary shadow-xs"
                >
                  S'inscrire
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
