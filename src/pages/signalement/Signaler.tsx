import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Toast } from '../../components/ui/Toast';
import { ShieldAlert, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export const Signaler: React.FC = () => {
  const { provider_id } = useParams<{ provider_id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [provider, setProvider] = useState<any | null>(null);
  const [motif, setMotif] = useState('fausse_identite');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!provider_id) return;
      const { data } = await supabase.from('provider_profiles').select('id, user_id, titre, statut_validation').eq('id', provider_id);
      if (data && data.length > 0) {
        setProvider(data[0]);
      }
    };
    fetchProvider();
  }, [provider_id]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 px-4">
        <p className="text-sm text-muted">Veuillez vous connecter pour signaler un profil.</p>
      </div>
    );
  }

  const handleSendSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider_id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          provider_id: provider_id,
          motif_code: motif,
          description: description.trim(),
          statut: 'en_attente'
        });

      if (error) {
        setToast({ message: error.message, type: 'error' });
      } else {
        setSubmitted(true);
        setToast({ message: "Votre signalement a été transmis à l'administration.", type: 'success' });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Une erreur s'est produite.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-xl mx-auto w-full px-4 pt-5 pb-10 space-y-6">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-primary">Signaler un Prestataire</h1>
          <p className="text-xs text-muted">Aidez-nous à préserver l'intégrité et la droiture de l'annuaire</p>
        </div>
      </div>

      <div className="card bg-white p-6 sm:p-8 border border-border rounded-2xl shadow-xs">
        {!submitted ? (
          <form onSubmit={handleSendSignal} className="space-y-5">
            {provider && (
              <div className="rounded-xl border border-gray-150 p-4 bg-gray-50/50 flex gap-3 items-center">
                <img 
                  src={provider.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${provider.profiles?.prenom}%20${provider.profiles?.nom}`} 
                  alt="Avatar"
                  className="h-10 w-10 rounded-full object-cover border"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted block">Prestataire concerné</span>
                  <span className="text-sm font-bold text-text">{provider.profiles?.prenom} {provider.profiles?.nom}</span>
                  <span className="text-xs text-primary block leading-none">{provider.titre}</span>
                </div>
              </div>
            )}

            {/* Motif Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Motif du signalement <span className="text-danger">*</span>
              </label>
              <select
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
              >
                <option value="fausse_identite">Fausse identité / Profil mensonger</option>
                <option value="arnaque">Arnaque / Tentative d'escroquerie / Tarifs abusifs</option>
                <option value="comportement_irrespectueux">Comportement inapproprié ou irrespectueux</option>
                <option value="fausse_competence">Manque évident de compétences déclarées</option>
                <option value="spam">Spam / Faux prestataire</option>
                <option value="autre">Autre manquement à la charte de confiance</option>
              </select>
            </div>

            {/* Description details */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Description détaillée (recommandé)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={500}
                placeholder="Fournissez des détails clairs sur le déroulement de l'intervention, les conversations ou les agissements constatés pour nous aider à prendre une décision juste..."
                className="w-full p-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary"
              />
              <p className="text-[10px] text-muted text-right">500 caractères maximum</p>
            </div>

            {/* Warning block */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 text-xs text-amber-800 leading-normal flex gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <span>Chaque signalement est traité avec la plus grande impartialité. Tout abus ou faux signalement répété à l'encontre d'un artisan honnête peut entraîner la suspension de votre propre compte.</span>
            </div>

            {/* Controls */}
            <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-text hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-rose-600 text-white px-6 text-sm font-semibold hover:bg-rose-700 transition-colors cursor-pointer shadow-xs disabled:bg-gray-400"
              >
                {loading ? "Transmission..." : "Envoyer le signalement"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-text">Signalement enregistré !</h3>
            <p className="text-sm text-muted leading-relaxed max-w-sm mx-auto">
              Nous vous remercions pour votre vigilance. L'équipe d'administration va auditer la situation rapidement dans la justice et la transparence.
            </p>
            <div className="pt-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary text-white font-semibold px-5 text-xs shadow-xs"
              >
                Retourner sur le profil
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
export default Signaler;
