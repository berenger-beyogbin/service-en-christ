import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Search, Users, Shield, ShieldOff, UserCheck, UserX, Eye } from 'lucide-react';
import { Profile } from '../../types';

type TabKey = 'tous' | 'actif' | 'suspendu' | 'supprime';

export const Comptes: React.FC = () => {
  const { profile: adminProfile } = useAuth();
  const navigate = useNavigate();

  const [comptes, setComptes] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('tous');

  useEffect(() => {
    if (adminProfile && !adminProfile.is_admin) {
      navigate('/', { replace: true });
    }
  }, [adminProfile, navigate]);

  useEffect(() => {
    const fetchComptes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setComptes(data as Profile[]);
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComptes();
  }, []);

  const handleSuspendToggle = async (compte: Profile) => {
    const newStatut = compte.statut_compte === 'actif' ? 'suspendu' : 'actif';
    const { error } = await supabase
      .from('profiles')
      .update({ statut_compte: newStatut })
      .eq('id', compte.id);
    if (!error) {
      setComptes(prev => prev.map(c => c.id === compte.id ? { ...c, statut_compte: newStatut } : c));
    }
  };

  const handleToggleAdmin = async (compte: Profile) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_admin: !compte.is_admin })
      .eq('id', compte.id)
      .select();
    if (!error && data && data.length > 0) {
      setComptes(prev => prev.map(c => c.id === compte.id ? { ...c, is_admin: !c.is_admin } : c));
    } else if (!error && (!data || data.length === 0)) {
      alert('Modification refusée : vérifiez les politiques RLS dans Supabase (la ligne n\'a pas été mise à jour).');
    }
  };

  const counts = {
    tous: comptes.length,
    actif: comptes.filter(c => c.statut_compte === 'actif').length,
    suspendu: comptes.filter(c => c.statut_compte === 'suspendu').length,
    supprime: comptes.filter(c => c.statut_compte === 'supprime').length,
  };

  const filtered = comptes.filter(c => {
    const matchesTab = activeTab === 'tous' || c.statut_compte === activeTab;
    const lowerSearch = searchText.toLowerCase();
    const matchesSearch = !searchText.trim() ||
      c.prenom.toLowerCase().includes(lowerSearch) ||
      c.nom.toLowerCase().includes(lowerSearch) ||
      (c.email_ref && c.email_ref.toLowerCase().includes(lowerSearch)) ||
      (c.ville && c.ville.toLowerCase().includes(lowerSearch));
    return matchesTab && matchesSearch;
  });

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'tous', label: 'Tous' },
    { key: 'actif', label: 'Actifs' },
    { key: 'suspendu', label: 'Suspendus' },
    { key: 'supprime', label: 'Supprimés' },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 pt-5 pb-10 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Gestion des Comptes
          </h1>
          <p className="text-sm text-muted">Gérez les comptes utilisateurs : statut, rôles et informations</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'tous' as TabKey, label: 'Total comptes', textColor: 'text-sky-700' },
          { key: 'actif' as TabKey, label: 'Actifs', textColor: 'text-emerald-700' },
          { key: 'suspendu' as TabKey, label: 'Suspendus', textColor: 'text-amber-700' },
          { key: 'supprime' as TabKey, label: 'Supprimés', textColor: 'text-rose-700' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setActiveTab(s.key)}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${activeTab === s.key ? 'border-primary shadow-sm bg-white' : 'border-border bg-white hover:bg-gray-50'}`}
          >
            <span className={`text-3xl font-black block ${s.textColor}`}>{counts[s.key]}</span>
            <span className="text-xs font-bold text-muted uppercase tracking-wide mt-1 block">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-border gap-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === tab.key ? 'bg-primary text-white shadow-xs' : 'text-muted hover:text-text hover:bg-gray-50'}`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-3.5 left-3.5 h-4 w-4 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Rechercher par nom, prénom, email ou ville…"
          className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-18 bg-white rounded-xl border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-10 text-center border border-border rounded-2xl space-y-3">
          <Users className="h-12 w-12 text-muted mx-auto" />
          <h3 className="font-bold text-text text-base">Aucun compte trouvé</h3>
          <p className="text-sm text-muted">Modifiez vos critères de recherche ou de filtre</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-muted font-bold uppercase tracking-wide border-b border-gray-100 text-xs">
                  <th className="px-4 py-3.5">Utilisateur</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Ville</th>
                  <th className="px-4 py-3.5">Rôle</th>
                  <th className="px-4 py-3.5">Statut</th>
                  <th className="px-4 py-3.5">Inscription</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex gap-3 items-center">
                        <img
                          src={c.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.prenom + ' ' + c.nom)}`}
                          alt="Avatar"
                          className="h-9 w-9 rounded-full object-cover border shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-bold text-text block text-sm">{c.prenom} {c.nom}</span>
                          <span className="text-xs text-muted">{c.telephone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted text-sm max-w-[180px] truncate">{c.email_ref || '—'}</td>
                    <td className="px-4 py-3.5 font-medium text-text text-sm">{c.ville || '—'}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {c.is_admin && (
                          <span className="inline-flex rounded-full bg-violet-50 border border-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">Admin</span>
                        )}
                        {c.is_provider && (
                          <span className="inline-flex rounded-full bg-sky-50 border border-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700">Prestataire</span>
                        )}
                        {!c.is_admin && !c.is_provider && (
                          <span className="text-xs text-muted">Utilisateur</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                        c.statut_compte === 'actif'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          : c.statut_compte === 'suspendu'
                          ? 'bg-amber-50 border-amber-100 text-amber-700'
                          : 'bg-rose-50 border-rose-100 text-rose-700'
                      }`}>
                        {c.statut_compte === 'actif' ? 'Actif' : c.statut_compte === 'suspendu' ? 'Suspendu' : 'Supprimé'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted text-sm whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5 justify-end flex-wrap">
                        <Link
                          to={`/admin/comptes/${c.id}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-bold text-text hover:bg-gray-50 cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Voir
                        </Link>
                        {c.statut_compte !== 'supprime' && (
                          <button
                            onClick={() => handleSuspendToggle(c)}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold cursor-pointer shadow-xs transition-colors whitespace-nowrap ${
                              c.statut_compte === 'actif'
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {c.statut_compte === 'actif'
                              ? <><UserX className="h-3.5 w-3.5" /> Suspendre</>
                              : <><UserCheck className="h-3.5 w-3.5" /> Activer</>
                            }
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleAdmin(c)}
                          disabled={c.id === adminProfile?.id}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold cursor-pointer shadow-xs transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed ${
                            c.is_admin
                              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
                          }`}
                        >
                          {c.is_admin
                            ? <><ShieldOff className="h-3.5 w-3.5" /> Retirer Admin</>
                            : <><Shield className="h-3.5 w-3.5" /> Promouvoir</>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-muted">
            {filtered.length} compte{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};
export default Comptes;
