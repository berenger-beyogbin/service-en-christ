import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, User, Shield, ShieldOff, UserX, UserCheck, Save, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Profile } from '../../types';

interface FormState {
  prenom: string;
  nom: string;
  telephone: string;
  ville: string;
  quartier: string;
}

export const CompteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile: adminProfile } = useAuth();
  const navigate = useNavigate();

  const [compte, setCompte] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<FormState>({ prenom: '', nom: '', telephone: '', ville: '', quartier: '' });

  useEffect(() => {
    if (adminProfile && !adminProfile.is_admin) {
      navigate('/', { replace: true });
    }
  }, [adminProfile, navigate]);

  useEffect(() => {
    if (!id) return;
    const fetchCompte = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (!error && data) {
        setCompte(data as Profile);
        setForm({
          prenom: data.prenom || '',
          nom: data.nom || '',
          telephone: data.telephone || '',
          ville: data.ville || '',
          quartier: data.quartier || '',
        });
      }
      setLoading(false);
    };
    fetchCompte();
  }, [id]);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSave = async () => {
    if (!compte || !id) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      telephone: form.telephone.trim() || null,
      ville: form.ville.trim(),
      quartier: form.quartier.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) {
      showFeedback('error', 'Erreur lors de la sauvegarde');
    } else {
      setCompte(prev => prev ? { ...prev, ...form } : prev);
      showFeedback('success', 'Modifications enregistrées avec succès');
    }
    setSaving(false);
  };

  const handleStatusChange = async (newStatut: 'actif' | 'suspendu' | 'supprime') => {
    if (!id) return;
    const { error } = await supabase.from('profiles').update({ statut_compte: newStatut }).eq('id', id);
    if (!error) {
      setCompte(prev => prev ? { ...prev, statut_compte: newStatut } : prev);
      const label = newStatut === 'actif' ? 'réactivé' : newStatut === 'suspendu' ? 'suspendu' : 'supprimé';
      showFeedback('success', `Compte ${label} avec succès`);
      setConfirmDelete(false);
    } else {
      showFeedback('error', 'Erreur lors du changement de statut');
    }
  };

  const handleToggleAdmin = async () => {
    if (!compte || !id) return;
    const wasAdmin = compte.is_admin;
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_admin: !wasAdmin })
      .eq('id', id)
      .select();
    if (error) {
      showFeedback('error', 'Erreur lors de la modification des droits');
    } else if (!data || data.length === 0) {
      showFeedback('error', 'Modification refusée par Supabase (politique RLS). Ajoutez la politique admin dans le dashboard Supabase.');
    } else {
      setCompte(prev => prev ? { ...prev, is_admin: !wasAdmin } : prev);
      showFeedback('success', wasAdmin ? 'Droits admin retirés' : 'Droits admin accordés');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5 pb-10 space-y-5">
        <div className="h-8 w-56 bg-gray-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-white rounded-2xl border animate-pulse" />
          <div className="lg:col-span-2 h-64 bg-white rounded-2xl border animate-pulse" />
        </div>
      </div>
    );
  }

  if (!compte) {
    return (
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-10 text-center space-y-3">
        <User className="h-12 w-12 text-muted mx-auto" />
        <p className="text-muted text-base font-semibold">Compte introuvable</p>
        <Link to="/admin/comptes" className="text-primary text-sm underline">Retour à la liste des comptes</Link>
      </div>
    );
  }

  const isSelf = adminProfile?.id === compte.id;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5 pb-10 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/comptes" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary">Détail du Compte</h1>
          <p className="text-sm text-muted">{compte.prenom} {compte.nom}{compte.email_ref ? ` · ${compte.email_ref}` : ''}</p>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`p-3.5 rounded-xl text-sm font-semibold border ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
          {feedback.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left panel */}
        <div className="lg:col-span-1 space-y-5">

          {/* Identity card */}
          <div className="bg-white border border-border rounded-2xl p-5 text-center space-y-3">
            <img
              src={compte.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(compte.prenom + ' ' + compte.nom)}`}
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover border-2 border-border mx-auto"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-bold text-text text-base">{compte.prenom} {compte.nom}</p>
              <p className="text-sm text-muted break-all">{compte.email_ref || '—'}</p>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-center">
              <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-bold border ${
                compte.statut_compte === 'actif'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : compte.statut_compte === 'suspendu'
                  ? 'bg-amber-50 border-amber-100 text-amber-700'
                  : 'bg-rose-50 border-rose-100 text-rose-700'
              }`}>
                {compte.statut_compte === 'actif' ? 'Actif' : compte.statut_compte === 'suspendu' ? 'Suspendu' : 'Supprimé'}
              </span>
              {compte.is_admin && (
                <span className="inline-flex rounded-full bg-violet-50 border border-violet-100 px-3 py-0.5 text-xs font-bold text-violet-700">Admin</span>
              )}
              {compte.is_provider && (
                <span className="inline-flex rounded-full bg-sky-50 border border-sky-100 px-3 py-0.5 text-xs font-bold text-sky-700">Prestataire</span>
              )}
            </div>
            <p className="text-xs text-muted">
              Membre depuis {new Date(compte.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-text uppercase tracking-wide border-b border-gray-100 pb-2.5">Actions rapides</h3>

            {isSelf ? (
              <p className="text-xs text-muted text-center py-2">Vous ne pouvez pas modifier votre propre compte depuis ici.</p>
            ) : (
              <>
                {compte.statut_compte !== 'supprime' && (
                  <button
                    onClick={() => handleStatusChange(compte.statut_compte === 'actif' ? 'suspendu' : 'actif')}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold cursor-pointer border transition-all ${
                      compte.statut_compte === 'actif'
                        ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {compte.statut_compte === 'actif'
                      ? <><UserX className="h-4 w-4" /> Suspendre le compte</>
                      : <><UserCheck className="h-4 w-4" /> Réactiver le compte</>
                    }
                  </button>
                )}

                <button
                  onClick={handleToggleAdmin}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold cursor-pointer border transition-all ${
                    compte.is_admin
                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      : 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100'
                  }`}
                >
                  {compte.is_admin
                    ? <><ShieldOff className="h-4 w-4" /> Retirer les droits admin</>
                    : <><Shield className="h-4 w-4" /> Promouvoir en Admin</>
                  }
                </button>

                {compte.is_provider && (
                  <Link
                    to={`/prestataire/${compte.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border border-border bg-white hover:bg-gray-50 text-text transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir la fiche prestataire
                  </Link>
                )}

                {compte.statut_compte !== 'supprime' && (
                  !confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold cursor-pointer border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer le compte
                    </button>
                  ) : (
                    <div className="border border-rose-200 rounded-xl p-4 bg-rose-50 space-y-3">
                      <p className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Confirmer la suppression ?
                      </p>
                      <p className="text-xs text-rose-600">Cette action marque le compte comme supprimé.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange('supprime')}
                          className="flex-1 py-2 rounded-lg text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 py-2 rounded-lg text-sm font-bold border border-border bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-5">

          {/* Edit form */}
          <div className="bg-white border border-border rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-text border-b border-gray-100 pb-3">Modifier les informations</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wide">Prénom *</label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={e => setForm(prev => ({ ...prev, prenom: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wide">Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={e => setForm(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wide">Téléphone</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={e => setForm(prev => ({ ...prev, telephone: e.target.value }))}
                placeholder="+225 01 23 45 67 89"
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wide">Ville</label>
                <input
                  type="text"
                  value={form.ville}
                  onChange={e => setForm(prev => ({ ...prev, ville: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wide">Quartier</label>
                <input
                  type="text"
                  value={form.quartier}
                  onChange={e => setForm(prev => ({ ...prev, quartier: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wide">Email (non modifiable)</label>
              <input
                type="email"
                value={compte.email_ref || ''}
                disabled
                className="w-full h-10 px-3 rounded-lg border border-border bg-gray-50 text-sm text-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted">L'email est géré par Supabase Auth et ne peut pas être modifié ici.</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || !form.prenom.trim() || !form.nom.trim()}
                className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-text border-b border-gray-100 pb-3">Métadonnées du compte</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {[
                { label: 'Identifiant', value: compte.id.substring(0, 12) + '…' },
                { label: 'Statut', value: compte.statut_compte },
                { label: 'Rôle admin', value: compte.is_admin ? 'Oui' : 'Non' },
                { label: 'Prestataire', value: compte.is_provider ? 'Oui' : 'Non' },
                { label: 'Créé le', value: new Date(compte.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Mis à jour le', value: new Date(compte.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(meta => (
                <div key={meta.label} className="space-y-1">
                  <p className="text-xs font-bold text-muted uppercase tracking-wide">{meta.label}</p>
                  <p className="font-semibold text-text text-sm">{meta.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default CompteDetail;
