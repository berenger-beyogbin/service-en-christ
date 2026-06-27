import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Category } from '../../types';
import {
  ArrowLeft, BarChart3, TrendingUp, Phone,
  Mail, MessageSquare, Award, Users
} from 'lucide-react';

export const Statistiques: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && !profile.is_admin) {
      navigate('/', { replace: true });
    }
  }, [profile, navigate]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const [catsRes, provsRes, evsRes] = await Promise.all([
          supabase.from('categories').select('*').order('ordre'),
          supabase.from('provider_profiles').select(
            'id, statut_validation, ville, created_at, provider_categories(subcategories(category_id))'
          ),
          supabase.from('contact_events').select(
            'type_contact, provider_profile_id, created_at, provider_profiles(titre, ville)'
          )
        ]);

        if (catsRes.data) setCategories(catsRes.data);
        if (provsRes.data) setProviders(provsRes.data);
        if (evsRes.data) setContacts(evsRes.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-sm text-muted">Génération des rapports d'activité...</p>
      </div>
    );
  }

  // Contact counts by channel
  const totalCalls = contacts.filter(c => c.type_contact === 'appel').length;
  const totalWhatsApp = contacts.filter(c => c.type_contact === 'whatsapp').length;
  const totalEmails = contacts.filter(c => c.type_contact === 'email').length;
  const grandTotalContacts = contacts.length;

  // Provider status counts
  const totalValidated = providers.filter(p => p.statut_validation === 'valide').length;
  const totalPending = providers.filter(p => p.statut_validation === 'en_attente').length;
  const totalRejected = providers.filter(p => p.statut_validation === 'rejete').length;

  // Providers per category (using properly joined data)
  const categoryChartData = categories.map(cat => {
    const count = providers.filter(p =>
      p.statut_validation === 'valide' &&
      p.provider_categories?.some((pc: any) => pc.subcategories?.category_id === cat.id)
    ).length;
    return { name: cat.nom, count };
  }).sort((a, b) => b.count - a.count);

  // Top 5 providers by total contact clicks
  const contactsByProvider: Record<string, { titre: string; ville: string; count: number }> = {};
  contacts.forEach((ev: any) => {
    const id = ev.provider_profile_id;
    if (!id) return;
    if (!contactsByProvider[id]) {
      contactsByProvider[id] = {
        titre: ev.provider_profiles?.titre || 'Inconnu',
        ville: ev.provider_profiles?.ville || '',
        count: 0
      };
    }
    contactsByProvider[id].count++;
  });
  const topProviders = Object.values(contactsByProvider)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Monthly evolution — last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return d.toISOString().substring(0, 7); // YYYY-MM
  });

  const monthlyProviderCounts = last6Months.map(m =>
    providers.filter(p => p.created_at?.substring(0, 7) === m).length
  );
  const monthlyContactCounts = last6Months.map(m =>
    contacts.filter(c => c.created_at?.substring(0, 7) === m).length
  );
  const maxProviders = Math.max(...monthlyProviderCounts, 1);
  const maxContactsMonthly = Math.max(...monthlyContactCounts, 1);

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-5 pb-10 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-1.5">
            <BarChart3 className="h-5.5 w-5.5 text-accent" />
            Statistiques & Rapports d'Activité
          </h1>
          <p className="text-xs text-muted">Suivez la croissance de l'annuaire et les métriques d'engagement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* MAIN CARD — contacts + categories */}
        <div className="card bg-white p-6 border border-border rounded-2xl md:col-span-2 space-y-6">
          <h3 className="font-bold text-text text-sm flex items-center gap-1.5 uppercase tracking-wide border-b border-gray-100 pb-2">
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
            Répartition par canal de contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-border p-4 rounded-xl text-center space-y-2 bg-gray-50/20">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Phone className="h-5 w-5" />
              </div>
              <span className="text-xs text-muted block font-semibold">Clics d'Appels</span>
              <span className="text-2xl font-black text-text block leading-none">{totalCalls}</span>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${grandTotalContacts ? (totalCalls / grandTotalContacts) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="border border-border p-4 rounded-xl text-center space-y-2 bg-gray-50/20">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="text-xs text-muted block font-semibold">Clics WhatsApp</span>
              <span className="text-2xl font-black text-text block leading-none">{totalWhatsApp}</span>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all"
                  style={{ width: `${grandTotalContacts ? (totalWhatsApp / grandTotalContacts) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="border border-border p-4 rounded-xl text-center space-y-2 bg-gray-50/20">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-xs text-muted block font-semibold">Clics Emails</span>
              <span className="text-2xl font-black text-text block leading-none">{totalEmails}</span>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all"
                  style={{ width: `${grandTotalContacts ? (totalEmails / grandTotalContacts) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Artisans per category */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-bold text-text text-xs uppercase tracking-wide">Artisans Validés par Catégorie</h4>
            <div className="space-y-3">
              {categoryChartData.map((data, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-text truncate">{data.name}</span>
                    <span className="font-bold text-primary">{data.count} artisan{data.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${totalValidated ? (data.count / totalValidated) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">

          {/* Provider status */}
          <div className="card bg-white p-5 border border-border rounded-2xl space-y-4">
            <h3 className="font-bold text-text text-xs uppercase tracking-wide border-b border-gray-100 pb-2">État des Fiches</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted font-medium">Fiches validées en ligne</span>
                <span className="font-bold text-emerald-600">{totalValidated}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted font-medium">Candidatures en attente</span>
                <span className="font-bold text-amber-600">{totalPending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted font-medium">Candidatures rejetées</span>
                <span className="font-bold text-rose-600">{totalRejected}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-muted font-bold">Total des fiches créées</span>
                <span className="font-black text-text text-sm">{providers.length}</span>
              </div>
            </div>
          </div>

          {/* Top providers */}
          <div className="card bg-white p-5 border border-border rounded-2xl space-y-4">
            <h3 className="font-bold text-text text-xs uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-accent" />
              Top Prestataires Contactés
            </h3>
            {topProviders.length === 0 ? (
              <p className="text-xs text-muted text-center py-3">Aucun contact enregistré</p>
            ) : (
              <div className="space-y-3 text-xs">
                {topProviders.map((prov, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted w-4 shrink-0 text-right">{i + 1}</span>
                    <div className="flex-grow min-w-0">
                      <span className="font-semibold text-text block truncate">{prov.titre}</span>
                      {prov.ville && <span className="text-muted text-[10px]">{prov.ville}</span>}
                    </div>
                    <span className="font-black text-primary shrink-0">{prov.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MONTHLY EVOLUTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Monthly new registrations */}
        <div className="card bg-white p-6 border border-border rounded-2xl space-y-4">
          <h3 className="font-bold text-text text-xs uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            Nouvelles Inscriptions (6 mois)
          </h3>
          <div className="flex items-end gap-2" style={{ height: '100px' }}>
            {last6Months.map((month, i) => {
              const count = monthlyProviderCounts[i];
              const pct = (count / maxProviders) * 100;
              const label = new Date(month + '-02').toLocaleDateString('fr-FR', { month: 'short' });
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-primary" style={{ minHeight: '14px' }}>
                    {count > 0 ? count : ''}
                  </span>
                  <div className="w-full flex items-end flex-grow">
                    <div
                      className="w-full bg-primary/75 rounded-t-md transition-all"
                      style={{ height: `${count > 0 ? Math.max(pct, 10) : 2}%`, minHeight: count > 0 ? '4px' : '2px' }}
                    />
                  </div>
                  <span className="text-[10px] text-muted capitalize">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly contacts */}
        <div className="card bg-white p-6 border border-border rounded-2xl space-y-4">
          <h3 className="font-bold text-text text-xs uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-emerald-600" />
            Contacts Générés (6 mois)
          </h3>
          <div className="flex items-end gap-2" style={{ height: '100px' }}>
            {last6Months.map((month, i) => {
              const count = monthlyContactCounts[i];
              const pct = (count / maxContactsMonthly) * 100;
              const label = new Date(month + '-02').toLocaleDateString('fr-FR', { month: 'short' });
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-emerald-600" style={{ minHeight: '14px' }}>
                    {count > 0 ? count : ''}
                  </span>
                  <div className="w-full flex items-end flex-grow">
                    <div
                      className="w-full bg-emerald-500/75 rounded-t-md transition-all"
                      style={{ height: `${count > 0 ? Math.max(pct, 10) : 2}%`, minHeight: count > 0 ? '4px' : '2px' }}
                    />
                  </div>
                  <span className="text-[10px] text-muted capitalize">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
export default Statistiques;
