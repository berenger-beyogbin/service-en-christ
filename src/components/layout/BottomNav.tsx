import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Search, Briefcase, User, Shield } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 z-40 h-16 w-full border-t border-border bg-white md:hidden flex items-center justify-around px-2 shadow-lg">
      
      {/* Home Link */}
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center gap-1 text-[11px] font-medium w-16 h-full transition-colors ${
            isActive ? 'text-primary' : 'text-muted hover:text-text'
          }`
        }
      >
        <Home className="h-5 w-5" />
        <span>Accueil</span>
      </NavLink>

      {/* Search Link */}
      <NavLink 
        to="/recherche" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center gap-1 text-[11px] font-medium w-16 h-full transition-colors ${
            isActive ? 'text-primary' : 'text-muted hover:text-text'
          }`
        }
      >
        <Search className="h-5 w-5" />
        <span>Rechercher</span>
      </NavLink>

      {/* Space Link (Provider Dashboard or Devenir Prestataire) */}
      {user ? (
        profile?.is_provider ? (
          <NavLink 
            to="/prestataire/tableau-de-bord" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center gap-1 text-[11px] font-medium w-16 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted hover:text-text'
              }`
            }
          >
            <Briefcase className="h-5 w-5" />
            <span>Mon Espace</span>
          </NavLink>
        ) : (
          <NavLink 
            to="/prestataire/creer" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center gap-1 text-[11px] font-medium w-16 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted hover:text-text'
              }`
            }
          >
            <Briefcase className="h-5 w-5" />
            <span>S'inscrire Pro</span>
          </NavLink>
        )
      ) : (
        <NavLink 
          to="/auth/connexion" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center gap-1 text-[11px] font-medium w-16 h-full transition-colors ${
              isActive ? 'text-primary' : 'text-muted hover:text-text'
            }`
          }
        >
          <Briefcase className="h-5 w-5" />
          <span>Espace Pro</span>
        </NavLink>
      )}

      {/* Admin Panel Link */}
      {profile?.is_admin && (
        <NavLink 
          to="/admin" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center gap-1 text-[11px] font-semibold w-16 h-full transition-colors ${
              isActive ? 'text-accent' : 'text-muted hover:text-text'
            }`
          }
        >
          <Shield className="h-5 w-5" />
          <span>Admin</span>
        </NavLink>
      )}

      {/* Profile/Account Link */}
      <NavLink 
        to="/profil" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center gap-1 text-[11px] font-medium w-16 h-full transition-colors ${
            isActive ? 'text-primary' : 'text-muted hover:text-text'
          }`
        }
      >
        <User className="h-5 w-5" />
        <span>Mon Profil</span>
      </NavLink>

    </nav>
  );
};
