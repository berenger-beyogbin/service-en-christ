import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Phone, MapPin, Mail, Settings, Shield, ShieldAlert, Award, ArrowRight } from 'lucide-react';

export const MonProfil: React.FC = () => {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 px-4">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-accent mx-auto" />
          <h2 className="text-xl font-bold text-text">Session requise</h2>
          <p className="text-sm text-muted max-w-xs">
            Veuillez vous connecter pour accéder à votre profil personnel.
          </p>
          <div className="pt-2">
            <Link to="/auth/connexion" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white font-semibold px-6 shadow-sm">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 pt-5 pb-10 space-y-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Mon Profil Personnel</h1>
        <p className="text-xs text-muted">Gérez vos informations de compte et l'accès prestataire</p>
      </div>

      {/* Main Profile Info Card */}
      <div className="card bg-white p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
          <img 
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.prenom || ''}%20${profile?.nom || ''}`} 
            alt="Avatar"
            className="h-20 w-20 rounded-full object-cover border-4 border-primary/5 shadow-inner"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-3 flex-1">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-text">
                  {profile?.prenom} {profile?.nom}
                </h2>
                {profile?.is_admin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-accent border border-amber-200">
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </span>
                )}
                {profile?.is_provider && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-primary border border-sky-200">
                    <Award className="h-3.5 w-3.5" />
                    Prestataire
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">Statut du compte : <span className="font-semibold text-emerald-600 capitalize">{profile?.statut_compte}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-sm text-text">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>{profile?.telephone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5 col-span-1 md:col-span-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{profile?.ville}{profile?.quartier ? `, ${profile?.quartier}` : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Links */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-3 justify-center sm:justify-end">
          <Link 
            to="/profil/modifier" 
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-xs font-semibold text-text hover:bg-gray-50 cursor-pointer"
          >
            <Settings className="h-4 w-4 mr-1.5 text-muted" />
            Modifier mes infos
          </Link>
          <Link 
            to="/profil/securite" 
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-xs font-semibold text-text hover:bg-gray-50 cursor-pointer"
          >
            Sécurité du compte
          </Link>
        </div>
      </div>

      {/* Provider Promotion Banner / Workspace Entry */}
      <div className="card border-primary/20 bg-gradient-to-br from-white to-sky-50/20 p-6">
        {profile?.is_provider ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-primary text-base">Votre Espace Prestataire est actif</h3>
              <p className="text-xs text-muted">Suivez vos statistiques de contact direct et mettez à jour vos prestations.</p>
            </div>
            <div className="pt-2">
              <Link 
                to="/prestataire/tableau-de-bord" 
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary px-5 shadow-xs gap-1.5 cursor-pointer"
              >
                Accéder au tableau de bord
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-primary text-base">Vous souhaitez proposer vos services ?</h3>
              <p className="text-xs text-muted">Créez votre profil de prestataire dans notre annuaire de confiance et touchez directement la communauté en Côte d'Ivoire.</p>
            </div>
            <div className="pt-2">
              <Link 
                to="/prestataire/creer" 
                className="inline-flex h-11 items-center justify-center rounded-lg bg-accent text-white text-sm font-semibold hover:bg-amber-600 px-5 shadow-xs gap-1.5 cursor-pointer"
              >
                Devenir prestataire
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
export default MonProfil;
