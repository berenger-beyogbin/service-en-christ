import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  ShieldCheck, ShieldAlert, Award, FileText, Wrench,
  AlertTriangle, Phone, BarChart2, Settings, Users
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [pendingProvs, setPendingProvs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [totalValidated, setTotalValidated] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && !profile.is_admin) {
      navigate('/', { replace: true });
    }
  }, [profile, navigate]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const { data: provs } = await supabase.from('provider_profiles').select('*');
        if (provs) {
          setPendingProvs(provs.filter((p: any) => p.statut_validation === 'en_attente'));
          setTotalValidated(provs.filter((p: any) => p.statut_validation === 'valide').length);
        }

        const { data: reps } = await supabase.from('reports').select('*');
        if (reps) {
          setReports(reps.filter((r: any) => r.statut === 'en_attente'));
        }

        const { data: contacts } = await supabase.from('contact_events').select('*');
        if (contacts) {
          setTotalContacts(contacts.length);
        }

        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (usersCount !== null) {
          setTotalUsers(usersCount);
        }

        const { data: recent } = await supabase
          .from('provider_profiles')
          .select('id, titre, statut_validation, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        if (recent) {
          setRecentActivity(recent);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 pt-5 pb-12 space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 pt-5 pb-10 space-y-8">

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-accent" />
          Administration Générale
        </h1>
        <p className="text-sm text-muted mt-1">Supervisez l'annuaire de confiance, modérez les fiches et validez les engagements chrétiens</p>
      </div>

      {/* CORE STATS WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

        <Link to="/admin/profils?status=en_attente" className="card bg-white p-5 border border-border rounded-2xl flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted block uppercase font-bold tracking-wide">Fiches en attente</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-accent">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-text block leading-none">{pendingProvs.length}</span>
            <span className="text-xs text-amber-700 font-bold mt-2 block">Interventions à auditer</span>
          </div>
        </Link>

        <Link to="/admin/signalements" className="card bg-white p-5 border border-border rounded-2xl flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted block uppercase font-bold tracking-wide">Signalements ouverts</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-text block leading-none">{reports.length}</span>
            <span className="text-xs text-rose-700 font-bold mt-2 block">Manquements éthiques</span>
          </div>
        </Link>

        <Link to="/admin/profils?status=valide" className="card bg-white p-5 border border-border rounded-2xl flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted block uppercase font-bold tracking-wide">Prestataires validés</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-text block leading-none">{totalValidated}</span>
            <span className="text-xs text-emerald-700 font-bold mt-2 block">Artisans certifiés actifs</span>
          </div>
        </Link>

        <div className="card bg-white p-5 border border-border rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted block uppercase font-bold tracking-wide">Mises en relation</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Phone className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-text block leading-none">{totalContacts}</span>
            <span className="text-xs text-sky-700 font-bold mt-2 block">Contacts directs cumulés</span>
          </div>
        </div>

        <Link to="/admin/comptes" className="card bg-white p-5 border border-border rounded-2xl flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted block uppercase font-bold tracking-wide">Comptes inscrits</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-text block leading-none">{totalUsers}</span>
            <span className="text-xs text-violet-700 font-bold mt-2 block">Utilisateurs enregistrés</span>
          </div>
        </Link>

      </div>

      {/* ADMIN CONTROL CENTER NAVIGATION PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Main management blocks */}
        <div className="md:col-span-2 card bg-white p-6 border border-border rounded-2xl space-y-5">
          <h3 className="text-sm font-bold text-text uppercase tracking-wide border-b border-gray-100 pb-3">Actions d'administration</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Link to="/admin/profils" className="p-4 border border-border hover:border-primary/40 rounded-xl hover:bg-sky-50/10 transition-all flex items-start gap-3 group">
              <FileText className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1 flex-grow">
                <span className="font-bold text-sm text-text block group-hover:text-primary transition-colors">Modérer les prestataires</span>
                <span className="text-xs text-muted block leading-normal">Valider, suspendre ou rejeter les fiches professionnelles d'artisans</span>
              </div>
            </Link>

            <Link to="/admin/signalements" className="p-4 border border-border hover:border-rose-400 rounded-xl hover:bg-rose-50/10 transition-all flex items-start gap-3 group">
              <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-grow">
                <span className="font-bold text-sm text-text block group-hover:text-rose-700 transition-colors">Traiter les signalements</span>
                <span className="text-xs text-muted block leading-normal">Analyser les avis et rapports de plaintes rédigés par les utilisateurs</span>
              </div>
            </Link>

            <Link to="/admin/categories" className="p-4 border border-border hover:border-amber-400 rounded-xl hover:bg-amber-50/10 transition-all flex items-start gap-3 group">
              <Settings className="h-6 w-6 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1 flex-grow">
                <span className="font-bold text-sm text-text block group-hover:text-amber-600 transition-colors">Gérer les catégories</span>
                <span className="text-xs text-muted block leading-normal">Modifier ou ordonner l'arborescence des 10 secteurs d'activités</span>
              </div>
            </Link>

            <button
              onClick={() => navigate('/admin/statistiques')}
              className="p-4 border border-border hover:border-primary/40 rounded-xl hover:bg-sky-50/10 text-left transition-all flex items-start gap-3 group cursor-pointer"
            >
              <BarChart2 className="h-6 w-6 text-sky-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-grow">
                <span className="font-bold text-sm text-text block group-hover:text-primary transition-colors">Rapports d'activité & Stats</span>
                <span className="text-xs text-muted block leading-normal">Suivre l'audience des fiches, les appels passés et les volumes d'inscriptions</span>
              </div>
            </button>

            <Link to="/admin/comptes" className="p-4 border border-border hover:border-violet-400 rounded-xl hover:bg-violet-50/10 transition-all flex items-start gap-3 group">
              <Users className="h-6 w-6 text-violet-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-grow">
                <span className="font-bold text-sm text-text block group-hover:text-violet-700 transition-colors">Gérer les comptes</span>
                <span className="text-xs text-muted block leading-normal">Consulter, modifier, suspendre ou promouvoir les comptes utilisateurs</span>
              </div>
            </Link>

          </div>
        </div>

        {/* Audit Log / Activity Trail Preview */}
        <div className="card bg-white p-5 border border-border rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-text uppercase tracking-wide border-b border-gray-100 pb-3">Récents Audits</h3>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">Aucune activité récente</p>
            ) : (
              recentActivity.map((item: any) => {
                const isValidated = item.statut_validation === 'valide';
                const isPending = item.statut_validation === 'en_attente';
                const borderColor = isValidated
                  ? 'border-emerald-500'
                  : isPending
                  ? 'border-accent'
                  : 'border-rose-500';
                const actionLabel = isValidated
                  ? 'Fiche Validée'
                  : isPending
                  ? 'Candidature Soumise'
                  : 'Fiche Rejetée';
                const date = new Date(item.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <div key={item.id} className={`border-l-2 ${borderColor} pl-3 leading-normal space-y-0.5`}>
                    <span className="text-xs text-muted font-bold block">{date}</span>
                    <span className="font-bold text-sm text-text block">{actionLabel}</span>
                    <span className="text-xs text-muted block truncate">{item.titre}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
export default Dashboard;
