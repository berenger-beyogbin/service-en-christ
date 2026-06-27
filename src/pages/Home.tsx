import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import { motion } from 'motion/react';
import {
  Wrench, Monitor, BookOpen, Calendar, Truck,
  Scissors, ShoppingBag, Briefcase, Heart, Church,
  Search, MapPin, ArrowRight, CheckCircle2, UserCheck,
  ShieldCheck, PhoneCall, HeartHandshake, Flag, Users, Award,
} from 'lucide-react';

export const getCategoryIcon = (iconName: string, className = "h-6 w-6") => {
  switch (iconName) {
    case 'Wrench': return <Wrench className={className} />;
    case 'Monitor': return <Monitor className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Calendar': return <Calendar className={className} />;
    case 'Truck': return <Truck className={className} />;
    case 'Scissors': return <Scissors className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Church': return <Church className={className} />;
    default: return <Wrench className={className} />;
  }
};

const TRUST_ITEMS = [
  { icon: ShieldCheck, colorClass: 'text-blue-600',    label: 'Profils relus avant publication' },
  { icon: PhoneCall,   colorClass: 'text-emerald-600', label: 'Contact direct sans commission' },
  { icon: HeartHandshake, colorClass: 'text-amber-600', label: "Charte d'intégrité" },
  { icon: Flag,        colorClass: 'text-rose-600',    label: 'Signalement possible' },
];


export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentProviders, setRecentProviders] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cats, error: catErr } = await supabase
          .from('categories')
          .select('*')
          .eq('actif', true)
          .order('ordre', { ascending: true });

        if (catErr) console.error('Erreur chargement catégories accueil:', catErr);
        if (!catErr && cats) setCategories(cats);

        const { data: provs, error: provErr } = await supabase
          .from('provider_profiles')
          .select('*, profiles!user_id(prenom, nom, avatar_url)')
          .eq('statut_validation', 'valide')
          .order('created_at', { ascending: false })
          .range(0, 1);

        if (provErr) console.error('Erreur chargement prestataires accueil:', provErr);
        if (!provErr && provs) setRecentProviders(provs);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoadingCats(false);
        setLoadingProviders(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/recherche');
    }
  };

  return (
    <div className="flex-1 pb-10">

      {/* ── 1. HERO COMPACT ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071E3D] via-[#1B4F72] to-[#154360] text-white pt-8 pb-5 px-4 sm:px-6 lg:px-8">
        <div className="absolute -top-10 left-1/3 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">

          {/* Left 3/5: titre + recherche */}
          <div className="lg:col-span-3 space-y-2.5">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-sans text-2xl font-extrabold tracking-tight sm:text-3xl leading-snug"
            >
              Trouvez un prestataire {' '}
              <span className="text-amber-400">fiable</span>, près de chez vous.
            </motion.h1>

            <p className="text-xs text-sky-200/90 leading-relaxed">
              Professionnels qualifiés et vérifiés — contactez-les directement, sans commission ni intermédiaire.
            </p>

            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              onSubmit={handleSearchSubmit}
            >
              <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-xl">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 -translate-y-1/2 left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Ex : plombier, couturier, webmaster, répétiteur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-10 pr-3 rounded-lg text-gray-800 placeholder-gray-400 bg-transparent focus:outline-hidden text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-amber-500 hover:bg-amber-600 font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer text-sm whitespace-nowrap"
                >
                  <Search className="h-3.5 w-3.5" />
                  Rechercher
                </button>
              </div>
            </motion.form>

            <div className="flex items-center gap-3">
              <Link
                to="/prestataire/creer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors group"
              >
                Devenir prestataire
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className="text-white/20">·</span>
              <span className="text-[11px] text-sky-300/80 flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-sky-400" />
                Mise en relation directe
              </span>
            </div>
          </div>

          {/* Right 2/5: 4 garanties en chips (desktop uniquement) */}
          <div className="hidden lg:grid lg:col-span-2 grid-cols-2 gap-2">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3 py-2.5">
                <Icon className="h-4 w-4 shrink-0 text-sky-300" />
                <span className="text-[11px] font-medium text-white/90 leading-tight">{label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 3. BLOC CENTRAL : CATÉGORIES + PRESTATAIRES ──────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-end">

          {/* Left 60%: titre + catégories */}
          <div className="lg:col-span-3">
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">Commencez par choisir un service</h2>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-sm text-muted">Sélectionnez une catégorie ou consultez les derniers profils validés.</p>
                <Link
                  to="/recherche"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors group shrink-0 ml-4"
                >
                  Voir toutes les catégories
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
            {loadingCats ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {categories.slice(0, 6).map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                    >
                      <Link
                        to={`/recherche?cat=${cat.id}`}
                        className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-border/80 shadow-xs hover:shadow-md hover:border-transparent transition-all relative overflow-hidden"
                      >
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity pointer-events-none"
                          style={{ backgroundColor: cat.couleur }}
                        />
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-xs group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: cat.couleur }}
                        >
                          {getCategoryIcon(cat.icone, 'h-4 w-4')}
                        </div>
                        <span className="text-xs font-semibold text-text leading-tight group-hover:text-primary transition-colors">
                          {cat.nom}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right 40%: prestataires récents */}
          <div className="lg:col-span-2 lg:border-l lg:border-border lg:pl-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Profils récents</p>
              <Link
                to="/recherche"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors group"
              >
                Voir tous
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {loadingProviders ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-[68px] rounded-xl bg-white border border-border animate-pulse" />
                ))}
              </div>
            ) : recentProviders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/60 p-5 text-center">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold text-text mb-1">Les premiers prestataires validés seront bientôt affichés ici.</p>
                <Link
                  to="/prestataire/creer"
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-primary hover:bg-secondary px-4 text-xs font-semibold text-white transition-colors shadow-sm mt-2"
                >
                  Devenir prestataire
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProviders.slice(0, 2).map((prov: any, index) => (
                  <motion.div
                    key={prov.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.07 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border shadow-xs hover:shadow-md transition-all"
                  >
                    <img
                      src={
                        prov.profiles?.avatar_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${prov.profiles?.prenom}%20${prov.profiles?.nom}`
                      }
                      alt={`${prov.profiles?.prenom} ${prov.profiles?.nom}`}
                      className="h-10 w-10 rounded-full object-cover border-2 border-primary/10 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <p className="font-bold text-text text-xs truncate">
                          {prov.profiles?.prenom} {prov.profiles?.nom}
                        </p>
                        {prov.statut_validation === 'valide' && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-100 shrink-0">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Validé
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-primary truncate">{prov.titre}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{prov.ville}{prov.quartier ? `, ${prov.quartier}` : ''}</span>
                      </div>
                    </div>
                    <Link
                      to={`/prestataire/${prov.id}`}
                      className="inline-flex h-7 items-center justify-center rounded-lg bg-primary/5 hover:bg-primary/10 text-primary px-2.5 text-[11px] font-semibold transition-colors shrink-0"
                    >
                      Voir
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── 4. CTA FINAL COMPACT ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#071E3D] via-[#1B4F72] to-[#154360] px-8 py-7 sm:px-10 text-white relative overflow-hidden shadow-lg border border-white/5">
          <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-amber-400/10 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5 max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">
                <Award className="h-3.5 w-3.5" />
                Charte d'intégrité
              </div>
              <h2 className="text-lg font-bold text-white sm:text-xl leading-tight">
                Vous êtes un professionnel chrétien ?
              </h2>
              <p className="text-sm text-sky-100/90 leading-relaxed">
                Rejoignez un annuaire fondé sur la confiance, l'intégrité et le sens du service.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/a-propos"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/25 hover:border-white/40 bg-white/10 hover:bg-white/15 px-5 font-semibold text-white transition-all text-sm whitespace-nowrap"
              >
                Lire la charte
              </Link>
              <Link
                to="/prestataire/creer"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 px-5 font-semibold text-white transition-all shadow-sm text-sm whitespace-nowrap"
              >
                Créer mon profil
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
