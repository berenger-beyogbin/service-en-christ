import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, Search, Filter, CheckCircle, 
  AlertCircle, Star, User, ChevronRight, Eye 
} from 'lucide-react';

export const Profils: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = searchParams.get('status') || 'en_attente';
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [searchText, setSearchText] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && !profile.is_admin) {
      navigate('/', { replace: true });
    }
  }, [profile, navigate]);

  useEffect(() => {
    const fetchAdminProfiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('provider_profiles').select('*');
        if (!error && data) {
          setProviders(data);
        }
      } catch (err) {
        console.error('Error loading admin profiles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminProfiles();
  }, [activeTab]); // reload or refilter

  const filteredProviders = providers.filter(p => {
    const matchesStatus = p.statut_validation === activeTab;
    const lowerSearch = searchText.toLowerCase();
    const matchesSearch = !searchText.trim() || 
      p.titre.toLowerCase().includes(lowerSearch) ||
      p.description.toLowerCase().includes(lowerSearch) ||
      (p.profiles?.prenom && p.profiles.prenom.toLowerCase().includes(lowerSearch)) ||
      (p.profiles?.nom && p.profiles.nom.toLowerCase().includes(lowerSearch));
    
    return matchesStatus && matchesSearch;
  });

  const handleTabChange = (status: string) => {
    setActiveTab(status);
    setSearchParams({ status });
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 pt-5 pb-10 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary">Modérer les Prestataires</h1>
          <p className="text-xs text-muted">Auditez les fiches d'activité professionnelle avant mise en ligne</p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-gray-100 bg-white p-1 rounded-xl border border-border gap-1">
        {[
          { key: 'en_attente', label: 'En attente', color: 'text-amber-600' },
          { key: 'valide', label: 'Validés', color: 'text-emerald-600' },
          { key: 'rejete', label: 'Rejetés', color: 'text-rose-600' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === tab.key 
                ? 'bg-primary text-white shadow-xs' 
                : 'text-muted hover:text-text hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SEARCH AND SEARCH SUMMARY */}
      <div className="relative">
        <Search className="absolute top-3 left-3.5 h-4 w-4 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Rechercher par nom, prénom ou intitulé de service..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* LIST CONTENT */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-xl border animate-pulse" />
          ))}
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="card bg-white p-10 text-center border border-border rounded-2xl space-y-2">
          <CheckCircle className="h-10 w-10 text-muted mx-auto" />
          <h3 className="font-bold text-text text-sm">Aucun prestataire dans cette catégorie</h3>
          <p className="text-xs text-muted">Tous les dossiers ont été traités avec justice et ponctualité !</p>
        </div>
      ) : (
        <div className="card bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-muted font-bold uppercase tracking-wider border-b border-gray-150">
                  <th className="p-4">Artisan / Candidat</th>
                  <th className="p-4">Intitulé du service</th>
                  <th className="p-4">Ville</th>
                  <th className="p-4">Expérience</th>
                  <th className="p-4">Caution Santé</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProviders.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4">
                      <div className="flex gap-2.5 items-center">
                        <img 
                          src={p.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${p.profiles?.prenom}%20${p.profiles?.nom}`} 
                          alt="Avatar" 
                          className="h-8 w-8 rounded-full object-cover border"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-bold text-text block leading-none">{p.profiles?.prenom} {p.profiles?.nom}</span>
                          <span className="text-[10px] text-muted block mt-0.5">{p.profiles?.telephone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-primary block truncate max-w-xs">{p.titre}</span>
                    </td>
                    <td className="p-4 font-semibold text-text">{p.ville}</td>
                    <td className="p-4 font-medium text-text">{p.experience_annees || 0} ans</td>
                    <td className="p-4">
                      {p.categorie_sante ? (
                        <span className="inline-flex rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 animate-pulse">
                          Oui (Sante)
                        </span>
                      ) : (
                        <span className="text-muted text-[10px]">Non</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/profils/validation/${p.id}`}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-white px-2.5 text-[10px] font-bold text-text hover:bg-gray-50 cursor-pointer shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5 text-muted" />
                        Auditer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
export default Profils;
