import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ProviderProfile } from '../../types';
import { Toast } from '../../components/ui/Toast';
import { 
  BarChart3, Phone, Mail, Award, AlertCircle, 
  MapPin, Clock, Edit2, ShieldAlert, Sparkles, User, ExternalLink
} from 'lucide-react';

export const MonTableauBord: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProviderData = async () => {
      try {
        // Fetch provider profile
        const { data: pProfs, error: pErr } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', user.id);

        if (!pErr && pProfs && pProfs.length > 0) {
          const prof = pProfs[0];
          setProviderProfile(prof);

          // Fetch contact events counts
          const { data: events } = await supabase
            .from('contact_events')
            .select('*')
            .eq('provider_profile_id', prof.id);

          if (events) setContacts(events);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 px-4">
        <p className="text-sm text-muted">Veuillez vous connecter pour accéder à votre tableau de bord.</p>
      </div>
    );
  }

  // Calculate contact event totals
  const totalCalls = contacts.filter(c => c.type_contact === 'appel').length;
  const totalWhatsApp = contacts.filter(c => c.type_contact === 'whatsapp').length;
  const totalEmails = contacts.filter(c => c.type_contact === 'email').length;
  const totalContacts = contacts.length;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-5 pb-10 space-y-8">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Mon Espace Prestataire</h1>
          <p className="text-xs text-muted">Gérez vos prestations et suivez vos statistiques d'audience</p>
        </div>
        {providerProfile && (
          <Link 
            to={`/prestataire/${providerProfile.id}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white text-xs font-semibold text-text hover:bg-gray-50 px-4 gap-1.5 cursor-pointer shadow-xs"
          >
            Voir ma fiche publique
            <ExternalLink className="h-4 w-4" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="h-64 bg-white rounded-2xl border border-border animate-pulse" />
      ) : !providerProfile ? (
        <div className="card bg-white p-10 text-center space-y-4 border border-border rounded-3xl max-w-xl mx-auto">
          <Award className="h-14 w-14 text-primary mx-auto opacity-70" />
          <h2 className="text-lg font-bold text-text">Vous n'avez pas encore de profil prestataire</h2>
          <p className="text-sm text-muted">
            Pour commencer à proposer vos services et être visible à Abidjan et partout en Côte d'Ivoire, créez votre profil en quelques minutes.
          </p>
          <div className="pt-2">
            <Link 
              to="/prestataire/creer" 
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white font-semibold px-6 shadow-xs cursor-pointer"
            >
              Créer mon profil professionnel
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* STATS OVERVIEW CARDS (Left/Span 2) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Validation Banner Indicator */}
            {providerProfile.statut_validation === 'en_attente' && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3 text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5.5 w-5.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Profil en attente d'audit</h4>
                    <p className="text-xs leading-relaxed">
                      Votre profil a été soumis avec succès ! Notre équipe d'administration est en cours d'analyse pour vérifier la cohérence des détails de l'offre par rapport à notre charte chrétienne. Cette validation prend généralement moins de 24 heures.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {providerProfile.statut_validation === 'rejete' && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 space-y-3 text-rose-900">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5.5 w-5.5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Profil rejeté ou suspendu</h4>
                    <p className="text-xs leading-relaxed">
                      Votre profil de prestation de services a été désapprouvé par un modérateur pour le motif suivant :
                    </p>
                    <p className="text-xs font-semibold bg-white p-3 rounded-xl border border-rose-150 text-rose-800 italic mt-2">
                      {providerProfile.motif_rejet || "Non respect de la charte chrétienne ou informations incomplètes."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {providerProfile.statut_validation === 'valide' && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3 text-emerald-900">
                <div className="flex items-start gap-3">
                  <Award className="h-5.5 w-5.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">✓ Profil validé et actif !</h4>
                    <p className="text-xs leading-relaxed text-emerald-800">
                      Félicitations, votre profil de confiance chrétienne est actuellement visible publiquement pour toute personne recherchant un prestataire. Veillez à honorer vos interventions avec rigueur et intégrité.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Contact Stats */}
            <div className="card bg-white p-6 space-y-4">
              <h3 className="font-bold text-text text-sm flex items-center gap-1.5 uppercase tracking-wide">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
                Statistiques de contacts directs
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Calls */}
                <div className="border border-border p-4 rounded-xl text-center space-y-1 bg-gray-50/20">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted block font-medium">Appels téléphoniques</span>
                  <span className="text-2xl font-black text-text block">{totalCalls}</span>
                </div>

                {/* WhatsApp */}
                <div className="border border-border p-4 rounded-xl text-center space-y-1 bg-gray-50/20">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted block font-medium">Ouvertures WhatsApp</span>
                  <span className="text-2xl font-black text-text block">{totalWhatsApp}</span>
                </div>

                {/* Email */}
                <div className="border border-border p-4 rounded-xl text-center space-y-1 bg-gray-50/20">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted block font-medium">Emails reçus</span>
                  <span className="text-2xl font-black text-text block">{totalEmails}</span>
                </div>

              </div>

              <div className="rounded-xl bg-gray-50 p-4 flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Total des contacts reçus :</span>
                <span className="font-bold text-text text-sm">{totalContacts} contacts</span>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE DETAILS COLUMN */}
          <div className="h-full">

            {/* Quick Profile Snapshot Card */}
            <div className="card bg-white p-5 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-text text-xs uppercase tracking-wide">Aperçu de la fiche</h3>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                  providerProfile.statut_validation === 'valide' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  providerProfile.statut_validation === 'en_attente' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                  'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                  {providerProfile.statut_validation}
                </span>
              </div>

              <div className="space-y-3 text-sm text-text flex-1 mt-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">Intitulé</span>
                  <span className="font-bold text-xs text-primary block leading-tight">{providerProfile.titre}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Expérience</span>
                    <span className="font-semibold text-xs">{providerProfile.experience_annees || 0} ans</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Ville</span>
                    <span className="font-semibold text-xs">{providerProfile.ville}</span>
                  </div>
                </div>

                {providerProfile.quartier && (
                  <div className="border-t border-gray-100 pt-2.5">
                    <span className="text-[10px] uppercase font-bold text-muted block">Zone</span>
                    <span className="font-medium text-xs flex gap-1 items-center">
                      <MapPin className="h-3.5 w-3.5 text-muted shrink-0" />
                      {providerProfile.quartier}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Tarif min</span>
                    <span className="font-semibold text-xs text-emerald-600">{providerProfile.tarif_min?.toLocaleString() || 0} F</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Unité</span>
                    <span className="font-semibold text-xs text-text">{providerProfile.tarif_unite}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-2.5">
                  <span className="text-[10px] uppercase font-bold text-muted block">Disponibilité</span>
                  <span className="font-medium text-xs flex gap-1 items-center">
                    <Clock className="h-3.5 w-3.5 text-muted shrink-0" />
                    {providerProfile.disponibilite || 'Non renseignée'}
                  </span>
                </div>
              </div>

              {/* Trigger Revalidation details notice */}
              <div className="pt-3 border-t border-gray-100">
                <Link
                  to="/prestataire/modifier"
                  className="w-full flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-text transition-colors cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted" />
                  Mettre à jour ma fiche
                </Link>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
export default MonTableauBord;
