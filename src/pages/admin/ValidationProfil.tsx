import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../../components/ui/Toast';
import { 
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, 
  MapPin, Clock, Award, ShieldAlert, Check, Ban 
} from 'lucide-react';

export const ValidationProfil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: adminProfile } = useAuth();

  const [provider, setProvider] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (adminProfile && !adminProfile.is_admin) {
      navigate('/', { replace: true });
    }
  }, [adminProfile, navigate]);

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from('provider_profiles').select('*, portfolio_photos(*)').eq('id', id);
        if (!error && data && data.length > 0) {
          setProvider(data[0]);
        }
      } catch (err) {
        console.error('Error fetching candidate details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-sm text-muted">Chargement du dossier de candidature...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 px-4">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-text">Dossier introuvable</h2>
          <Link to="/admin/profils" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary text-white font-semibold px-4 text-xs">
            Retourner à la liste
          </Link>
        </div>
      </div>
    );
  }

  const handleDecision = async (status: 'valide' | 'rejete', reason: string = '') => {
    try {
      // Update provider_profiles status
      const { error } = await supabase
        .from('provider_profiles')
        .update({
          statut_validation: status,
          motif_rejet: reason || null,
          validated_at: status === 'valide' ? new Date().toISOString() : null,
          validated_by: status === 'valide' ? (adminProfile?.id || null) : null
        })
        .eq('id', provider.id);

      if (error) {
        setToast({ message: error.message, type: 'error' });
        return;
      }

      // Sync the user's is_provider status if they are validated or rejected
      const coreProfileUpdate = status === 'valide';
      await supabase
        .from('profiles')
        .update({ is_provider: coreProfileUpdate })
        .eq('id', provider.user_id);

      // Save Audit Log
      await supabase.from('audit_logs').insert({
        admin_id: adminProfile?.id || 'admin-id',
        action: status === 'valide' ? 'VALIDATE_PROVIDER' : 'REJECT_PROVIDER',
        target_id: provider.id,
        target_type: 'provider_profile',
        details: { 
          reason: reason || 'Approved', 
          candidateName: `${provider.profiles?.prenom} ${provider.profiles?.nom}` 
        }
      });

      setToast({ 
        message: status === 'valide' 
          ? "Le prestataire a été validé et sa fiche est active." 
          : "La candidature a été rejetée et le motif a été notifié.", 
        type: 'success' 
      });

      setShowRejectModal(false);
      setTimeout(() => {
        navigate('/admin/profils');
      }, 1200);

    } catch (err: any) {
      setToast({ message: err.message || "Une erreur s'est produite lors de la validation.", type: 'error' });
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5 pb-10 space-y-6">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/profils" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary">Audit de Candidature</h1>
          <p className="text-xs text-muted">Dossier de {provider.profiles?.prenom} {provider.profiles?.nom}</p>
        </div>
      </div>

      {/* Healthcare Alert Warning */}
      {provider.categorie_sante && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-2 text-rose-950 text-xs animate-bounce-short">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Contrôle Santé requis !</h4>
              <p className="leading-relaxed">
                Ce prestataire propose des services liés au bien-être / santé. Vérifiez rigoureusement que la description ne contient aucune usurpation médicale, diagnostic ou prescription de médicaments. La plateforme accepte uniquement le massage de confort, la phytothérapie traditionnelle déclarée ou le coaching d'hygiène de vie sans prétentions thérapeutiques.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card Summary & Contacts */}
        <div className="card bg-white p-5 border border-border rounded-2xl h-fit space-y-4">
          <div className="text-center space-y-2.5 pb-4 border-b border-gray-100">
            <img 
              src={provider.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${provider.profiles?.prenom}%20${provider.profiles?.nom}`} 
              alt="Candidate"
              className="mx-auto h-20 w-20 rounded-full object-cover border-4 border-primary/5"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-bold text-text text-sm">{provider.profiles?.prenom} {provider.profiles?.nom}</h3>
              <p className="text-xs text-muted">Inscrit en Côte d'Ivoire</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-muted block uppercase">Téléphone Pro</span>
              <span className="font-semibold text-text block">{provider.telephone_pro || 'Non renseigné'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted block uppercase">WhatsApp</span>
              <span className="font-semibold text-text block">{provider.whatsapp || 'Non renseigné'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted block uppercase">Email Pro</span>
              <span className="font-semibold text-text block truncate">{provider.email_pro || 'Non renseigné'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted block uppercase">Localisation</span>
              <span className="font-semibold text-text block truncate flex gap-1 items-center">
                <MapPin className="h-3.5 w-3.5 text-muted shrink-0" />
                {provider.ville}, {provider.quartier}
              </span>
            </div>
          </div>

          {/* Decision Buttons */}
          {provider.statut_validation === 'en_attente' && (
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => handleDecision('valide')}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                Valider & Mettre en ligne
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Ban className="h-4 w-4" />
                Rejeter / Suspendre
              </button>
            </div>
          )}
        </div>

        {/* Candidacy Detailed Fields */}
        <div className="md:col-span-2 card bg-white p-6 sm:p-8 space-y-6 border border-border rounded-2xl">
          
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-primary leading-tight">{provider.titre}</h1>
            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-text uppercase border">
              Statut actuel : {provider.statut_validation}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wide block">Description détaillée des prestations</span>
            <p className="text-sm text-text leading-relaxed font-medium text-justify whitespace-pre-line bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {provider.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-gray-100 py-4 text-xs text-text">
            <div>
              <span className="text-[10px] font-bold text-muted uppercase block mb-0.5">Expérience déclarée</span>
              <span className="font-bold text-sm text-primary">{provider.experience_annees || 0} ans d'activité</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase block mb-0.5">Tarifs et horaires</span>
              <span className="font-bold text-sm text-emerald-600">{provider.tarif_min?.toLocaleString() || 0} – {provider.tarif_max?.toLocaleString() || 0} {provider.tarif_unite}</span>
            </div>
          </div>

          {/* Portfolio realizations gallery display */}
          {provider.portfolio_photos && provider.portfolio_photos.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wide block">Portfolio du candidat ({provider.portfolio_photos.length} photos)</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {provider.portfolio_photos.map((p: any, i: number) => (
                  <div key={i} className="aspect-4/3 rounded-xl overflow-hidden border border-border bg-gray-50">
                    <img src={p.url} alt={`Realization ${i}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* REJECTION REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-border space-y-5">
            <div className="space-y-1">
              <h3 className="font-bold text-text text-base">Préciser le motif du rejet</h3>
              <p className="text-xs text-muted">Ce texte sera affiché sur le tableau de bord du prestataire pour lui indiquer les corrections à apporter.</p>
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="ex: Votre description est trop courte ou manque d'explications sur vos certifications professionnelles en plomberie..."
              className="w-full p-3 rounded-xl border border-border bg-gray-50 text-sm focus:bg-white outline-hidden"
            />

            <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDecision('rejete', rejectionReason)}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-4 text-xs font-bold cursor-pointer shadow-xs"
              >
                Valider le rejet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default ValidationProfil;
