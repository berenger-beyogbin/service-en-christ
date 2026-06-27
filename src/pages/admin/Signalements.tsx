import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../../components/ui/Toast';
import { 
  ArrowLeft, ShieldAlert, CheckCircle, Trash2, 
  User, ShieldX, CheckSquare, AlertCircle 
} from 'lucide-react';

export const Signalements: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (profile && !profile.is_admin) {
      navigate('/', { replace: true });
    }
  }, [profile, navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('reports').select('*');
      if (!error && data) {
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId: string, providerId: string, actionType: 'classer' | 'suspendre') => {
    try {
      if (actionType === 'classer') {
        // Resolve the report without actions
        await supabase.from('reports').update({ statut: 'resolu' }).eq('id', reportId);
        setToast({ message: "Le signalement a été classé sans suite.", type: 'success' });
      } else {
        // Resolve report and suspend provider
        await supabase.from('reports').update({ statut: 'resolu' }).eq('id', reportId);
        await supabase.from('provider_profiles').update({ 
          statut_validation: 'rejete', 
          motif_rejet: "Compte temporairement suspendu suite à un audit de signalement pour manquements répétés à notre charte d'utilisation."
        }).eq('id', providerId);

        // Update profile provider flag
        const { data: provs } = await supabase.from('provider_profiles').select('*').eq('id', providerId);
        if (provs && provs.length > 0) {
          await supabase.from('profiles').update({ is_provider: false }).eq('id', provs[0].user_id);
        }

        // Save log
        await supabase.from('audit_logs').insert({
          admin_id: profile?.id || 'admin-id',
          action: 'SUSPEND_PROVIDER_VIA_SIGNALEMENT',
          target_id: providerId,
          target_type: 'provider_profile',
          details: { reportId }
        });

        setToast({ message: "Le prestataire a été suspendu et le signalement est résolu.", type: 'success' });
      }
      fetchReports();
    } catch (err: any) {
      setToast({ message: err.message || "Une erreur s'est produite.", type: 'error' });
    }
  };

  const pendingReports = reports.filter(r => r.statut === 'en_attente');
  const resolvedReports = reports.filter(r => r.statut === 'resolu');

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-5 pb-10 space-y-6">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary">Gestion des Signalements</h1>
          <p className="text-xs text-muted">Examinez les manquements rapportés par la communauté chrétienne</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* OPEN SIGNALEMENTS SECTION */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-text uppercase tracking-wide flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
            Rapports à traiter ({pendingReports.length})
          </h3>

          {loading ? (
            <div className="h-28 bg-white border rounded-xl animate-pulse" />
          ) : pendingReports.length === 0 ? (
            <div className="card bg-white p-8 text-center border rounded-xl space-y-1">
              <CheckCircle className="h-9 w-9 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-text text-sm">Aucun signalement en attente !</h4>
              <p className="text-xs text-muted">L'intégrité de la communauté chrétienne est parfaitement préservée.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((r) => (
                <div key={r.id} className="card bg-white p-5 border border-border rounded-xl space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="inline-flex rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 uppercase tracking-wide">
                        Motif : {r.motif_code?.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-text font-medium bg-gray-50 p-3 rounded-lg border italic">
                        "{r.description || "Aucune description fournie."}"
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-muted font-bold uppercase tracking-wider">
                      Rapporté par l'ID : {r.reporter_id?.substring(0, 8)}...
                    </div>
                  </div>

                  {/* Accused detail */}
                  {r.provider_profiles && (
                    <div className="rounded-xl border border-gray-150 p-3 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex gap-2.5 items-center">
                        <img 
                          src={r.provider_profiles.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${r.provider_profiles.profiles?.prenom}%20${r.provider_profiles.profiles?.nom}`} 
                          alt="Accused Avatar"
                          className="h-9 w-9 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-[9px] uppercase font-bold text-muted block leading-none">Artisan accusé</span>
                          <span className="text-xs font-bold text-text">{r.provider_profiles.profiles?.prenom} {r.provider_profiles.profiles?.nom}</span>
                          <span className="text-[10px] text-primary block mt-0.5 leading-none">{r.provider_profiles.titre}</span>
                        </div>
                      </div>

                      {/* Decisive controls */}
                      <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleAction(r.id, r.provider_id, 'classer')}
                          className="flex-1 sm:flex-initial inline-flex h-9 items-center justify-center rounded-lg border border-border bg-white px-3 text-xs font-semibold text-text hover:bg-gray-50 cursor-pointer"
                        >
                          Classer sans suite
                        </button>
                        <button
                          onClick={() => handleAction(r.id, r.provider_id, 'suspendre')}
                          className="flex-1 sm:flex-initial inline-flex h-9 items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 text-xs font-bold cursor-pointer"
                        >
                          <ShieldX className="h-4 w-4 mr-1 shrink-0" />
                          Suspendre
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RESOLVED SIGNALEMENTS HISTORIC */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-sm text-text uppercase tracking-wide flex items-center gap-1.5">
            <CheckSquare className="h-4.5 w-4.5 text-emerald-500" />
            Signalements résolus / archives ({resolvedReports.length})
          </h3>

          {!loading && resolvedReports.length > 0 && (
            <div className="card bg-white border border-border rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-muted font-bold uppercase border-b border-gray-150">
                    <th className="p-3">Artisan</th>
                    <th className="p-3">Motif</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resolvedReports.map(r => (
                    <tr key={r.id}>
                      <td className="p-3 font-semibold text-text">
                        {r.provider_profiles?.profiles?.prenom} {r.provider_profiles?.profiles?.nom}
                      </td>
                      <td className="p-3 font-bold text-rose-700 uppercase tracking-wide text-[10px]">{r.motif_code}</td>
                      <td className="p-3 text-muted truncate max-w-xs">{r.description}</td>
                      <td className="p-3 text-right">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-100">
                          Résolu
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default Signalements;
