import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Category, Subcategory } from '../../types';
import { getCategoryIcon } from '../Home';
import { 
  Search, MapPin, Filter, X, ArrowLeft, 
  Sparkles, Star, CheckCircle, ChevronLeft, ChevronRight, SlidersHorizontal 
} from 'lucide-react';

export const Recherche: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search input and filters state
  const qParam = searchParams.get('q') || '';
  const catParam = searchParams.get('cat') || '';
  const subcatParam = searchParams.get('subcat') || '';
  const cityParam = searchParams.get('city') || '';
  const districtParam = searchParams.get('district') || '';

  const [textSearch, setTextSearch] = useState(qParam);
  const [selectedCat, setSelectedCat] = useState(catParam);
  const [selectedSubcat, setSelectedSubcat] = useState(subcatParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedDistrict, setSelectedDistrict] = useState(districtParam);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Sync state with URL changes
  useEffect(() => {
    setTextSearch(qParam);
    setSelectedCat(catParam);
    setSelectedSubcat(subcatParam);
    setSelectedCity(cityParam);
    setSelectedDistrict(districtParam);
    setPage(1);
  }, [qParam, catParam, subcatParam, cityParam, districtParam]);

  // Fetch Categories & Subcategories
  useEffect(() => {
    const fetchMetadata = async () => {
      const { data: cats } = await supabase.from('categories').select('*').eq('actif', true).order('ordre', { ascending: true });
      const { data: subs } = await supabase.from('subcategories').select('*').eq('actif', true).order('ordre', { ascending: true });
      
      if (cats) setCategories(cats);
      if (subs) setSubcategories(subs);
    };
    fetchMetadata();
  }, []);

  // Filter subcategories dynamically based on selected Category
  const filteredSubcategories = useMemo(() => {
    if (!selectedCat) return [];
    return subcategories.filter(sub => sub.category_id === selectedCat);
  }, [selectedCat, subcategories]);

  // Handle reset filter trigger
  const handleResetFilters = () => {
    setTextSearch('');
    setSelectedCat('');
    setSelectedSubcat('');
    setSelectedCity('');
    setSelectedDistrict('');
    setSearchParams({});
    setPage(1);
  };

  // Submit filters & sync parameters to URL
  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params: any = {};
    if (textSearch.trim()) params.q = textSearch.trim();
    if (selectedCat) params.cat = selectedCat;
    if (selectedSubcat) params.subcat = selectedSubcat;
    if (selectedCity) params.city = selectedCity;
    if (selectedDistrict.trim()) params.district = selectedDistrict.trim();

    setSearchParams(params);
    setPage(1);
    setShowFiltersMobile(false);
  };

  // Query and resolve filtered providers
  useEffect(() => {
    const fetchFilteredProviders = async () => {
      setLoading(true);
      try {
        let query = supabase.from('provider_profiles')
          .select('id, user_id, titre, description, ville, quartier, tarif_min, tarif_max, tarif_unite, note_moyenne, nombre_avis, statut_validation, categorie_sante, created_at, profiles!user_id(prenom, nom, avatar_url), provider_categories(subcategory_id, subcategories(id, nom, category_id))')
          .eq('statut_validation', 'valide');

        // Note: The mock query engine in supabase.ts resolves joins and filters
        const { data, error } = await query;

        if (error) {
          console.error('Error loading providers:', error);
          setProviders([]);
          return;
        }

        // Apply filters in client side for robust local mock compatibility
        let results = data || [];

        if (textSearch.trim()) {
          const lowerQ = textSearch.toLowerCase();
          results = results.filter((p: any) => 
            p.titre.toLowerCase().includes(lowerQ) ||
            p.description.toLowerCase().includes(lowerQ) ||
            (p.profiles?.prenom && p.profiles.prenom.toLowerCase().includes(lowerQ)) ||
            (p.profiles?.nom && p.profiles.nom.toLowerCase().includes(lowerQ))
          );
        }

        if (selectedCat) {
          // Check if provider has primary or any subcategory in this category
          results = results.filter((p: any) => 
            p.provider_categories?.some((pc: any) => pc.subcategories?.category_id === selectedCat)
          );
        }

        if (selectedSubcat) {
          results = results.filter((p: any) => 
            p.provider_categories?.some((pc: any) => pc.subcategory_id === selectedSubcat)
          );
        }

        if (selectedCity) {
          results = results.filter((p: any) => p.ville.toLowerCase() === selectedCity.toLowerCase());
        }

        if (selectedDistrict.trim()) {
          const lowerDist = selectedDistrict.toLowerCase();
          results = results.filter((p: any) => p.quartier?.toLowerCase().includes(lowerDist));
        }

        setProviders(results);
      } catch (err) {
        console.error('Error fetching filtered providers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProviders();
  }, [qParam, catParam, subcatParam, cityParam, districtParam]);

  // Pagination calculation
  const totalItems = providers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProviders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return providers.slice(start, start + pageSize);
  }, [providers, page]);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 pt-5 pb-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Rechercher un Prestataire</h1>
          <p className="text-xs text-muted">Trouvez des artisans chrétiens fiables en Côte d'Ivoire</p>
        </div>
        <button
          onClick={() => setShowFiltersMobile(true)}
          className="md:hidden flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-text cursor-pointer shadow-xs"
        >
          <SlidersHorizontal className="h-4.5 w-4.5 text-muted" />
          Filtres
          {Object.keys(searchParams).length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {Object.keys(searchParams).length}
            </span>
          )}
        </button>
      </div>

      {/* Main filter + results panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* DESKTOP FILTERS (Sidebar) */}
        <div className="hidden md:block card bg-white p-5 border border-border sticky top-24 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-text text-sm flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filtrer les offres
            </h3>
            {Object.keys(searchParams).length > 0 && (
              <button 
                onClick={handleResetFilters}
                className="text-xs font-semibold text-danger hover:text-red-700 cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <form onSubmit={applyFilters} className="space-y-4">
            {/* Keyword */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-text uppercase tracking-wide">Mots clés</label>
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted" />
                <input
                  type="text"
                  value={textSearch}
                  onChange={(e) => setTextSearch(e.target.value)}
                  placeholder="ex: plombier, Marie..."
                  className="w-full h-9 pl-8 pr-3 text-xs border border-border bg-gray-50 rounded-lg focus:bg-white"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-text uppercase tracking-wide">Catégorie</label>
              <select
                value={selectedCat}
                onChange={(e) => {
                  setSelectedCat(e.target.value);
                  setSelectedSubcat(''); // Reset subcat on category change
                }}
                className="w-full h-9 px-2 text-xs border border-border bg-gray-50 rounded-lg focus:bg-white"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            {selectedCat && filteredSubcategories.length > 0 && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-text uppercase tracking-wide">Sous-catégorie</label>
                <select
                  value={selectedSubcat}
                  onChange={(e) => setSelectedSubcat(e.target.value)}
                  className="w-full h-9 px-2 text-xs border border-border bg-gray-50 rounded-lg focus:bg-white animate-fade-in"
                >
                  <option value="">Toutes les sous-catégories</option>
                  {filteredSubcategories.map(s => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
            )}

            {/* City */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-text uppercase tracking-wide">Ville</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-9 px-2 text-xs border border-border bg-gray-50 rounded-lg focus:bg-white"
              >
                <option value="">Toutes les villes</option>
                <option value="Abidjan">Abidjan</option>
                <option value="Bouaké">Bouaké</option>
                <option value="Daloa">Daloa</option>
                <option value="Yamoussoukro">Yamoussoukro</option>
                <option value="San Pedro">San Pedro</option>
                <option value="Korhogo">Korhogo</option>
                <option value="Man">Man</option>
                <option value="Autre">Autre Ville</option>
              </select>
            </div>

            {/* District */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-text uppercase tracking-wide">Quartier / Zone</label>
              <div className="relative">
                <MapPin className="absolute top-2.5 left-2.5 h-4 w-4 text-muted" />
                <input
                  type="text"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  placeholder="ex: Angré, Selmer"
                  className="w-full h-9 pl-8 pr-3 text-xs border border-border bg-gray-50 rounded-lg focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-primary text-white font-semibold rounded-lg hover:bg-secondary text-xs transition-colors cursor-pointer shadow-xs"
            >
              Appliquer les filtres
            </button>
          </form>
        </div>

        {/* RESULTS GRID AREA */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Active Filters Display */}
          {Object.keys(searchParams).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-white border border-border/80 px-4 py-2.5 rounded-xl text-xs text-text">
              <span className="font-bold text-muted mr-1.5 uppercase tracking-wide text-[10px]">Filtres actifs :</span>
              {qParam && (
                <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                  "{qParam}"
                  <button onClick={() => { setTextSearch(''); const copy = new URLSearchParams(searchParams); copy.delete('q'); setSearchParams(copy); }} className="p-0.5 hover:bg-gray-200 rounded cursor-pointer"><X className="h-3 w-3" /></button>
                </span>
              )}
              {catParam && (
                <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-1 rounded-md text-xs font-medium">
                  {categories.find(c => c.id === catParam)?.nom || "Catégorie"}
                  <button onClick={() => { setSelectedCat(''); setSelectedSubcat(''); const copy = new URLSearchParams(searchParams); copy.delete('cat'); copy.delete('subcat'); setSearchParams(copy); }} className="p-0.5 hover:bg-sky-100 rounded cursor-pointer"><X className="h-3 w-3" /></button>
                </span>
              )}
              {subcatParam && (
                <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-medium">
                  {subcategories.find(s => s.id === subcatParam)?.nom || "Sous-catégorie"}
                  <button onClick={() => { setSelectedSubcat(''); const copy = new URLSearchParams(searchParams); copy.delete('subcat'); setSearchParams(copy); }} className="p-0.5 hover:bg-teal-100 rounded cursor-pointer"><X className="h-3 w-3" /></button>
                </span>
              )}
              {cityParam && (
                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-medium">
                  {cityParam}
                  <button onClick={() => { setSelectedCity(''); const copy = new URLSearchParams(searchParams); copy.delete('city'); setSearchParams(copy); }} className="p-0.5 hover:bg-orange-100 rounded cursor-pointer"><X className="h-3 w-3" /></button>
                </span>
              )}
              {districtParam && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium">
                  Zone: {districtParam}
                  <button onClick={() => { setSelectedDistrict(''); const copy = new URLSearchParams(searchParams); copy.delete('district'); setSearchParams(copy); }} className="p-0.5 hover:bg-indigo-100 rounded cursor-pointer"><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Core Grid display */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 bg-white rounded-2xl border border-border animate-pulse p-5" />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="card bg-white p-10 text-center space-y-4 border border-border rounded-3xl">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-100 text-amber-500">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-text">Aucun résultat ne correspond à votre recherche</h3>
              <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                Essayez d'élargir vos filtres de recherche ou de consulter d'autres catégories chrétiennes près de chez vous.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary hover:bg-secondary text-white font-semibold px-5 shadow-xs text-xs cursor-pointer"
              >
                Voir tous les prestataires
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {paginatedProviders.map((prov) => {
                  // Get primary category details
                  const primCat = prov.provider_categories?.[0]?.subcategories?.categories || {};
                  
                  return (
                    <div
                      key={prov.id}
                      className="card bg-white p-5 border border-border rounded-2xl hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header details */}
                        <div className="flex gap-4 items-start mb-3">
                          <img 
                            src={prov.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${prov.profiles?.prenom}%20${prov.profiles?.nom}`} 
                            alt={`${prov.profiles?.prenom} ${prov.profiles?.nom}`}
                            className="h-12 w-12 rounded-full object-cover border-2 border-primary/5 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <h3 className="font-bold text-text text-sm truncate">
                                {prov.profiles?.prenom} {prov.profiles?.nom}
                              </h3>
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-100 shrink-0">
                                <CheckCircle className="h-2.5 w-2.5" />
                                <span>Validé</span>
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-primary truncate leading-tight">{prov.titre}</h4>
                            <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
                              <MapPin className="h-3 w-3 text-muted shrink-0" />
                              <span className="truncate">{prov.ville}{prov.quartier ? `, ${prov.quartier}` : ''}</span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4">
                          {prov.description}
                        </p>

                        {/* Categories tags list */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {prov.provider_categories?.map((pc: any, i: number) => (
                            <span 
                              key={i}
                              className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold bg-gray-50 text-gray-700 border border-gray-150"
                            >
                              {pc.subcategories?.nom}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-muted block uppercase tracking-wide font-medium">Tarif estimé</span>
                          <span className="text-xs font-bold text-text">
                            {prov.tarif_min ? `${prov.tarif_min.toLocaleString()} FCFA` : 'Non renseigné'}
                          </span>
                        </div>
                        <Link 
                          to={`/prestataire/${prov.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-secondary text-white px-4 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Voir profil
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION PANEL */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-6 text-sm text-muted">
                  <span className="text-xs">
                    Page <strong className="text-text">{page}</strong> sur <strong className="text-text">{totalPages}</strong> ({totalItems} prestataires)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowFiltersMobile(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white p-5 shadow-2xl flex flex-col justify-between h-full">
              
              <div className="space-y-5 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-text text-base flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Filtres de recherche
                  </h3>
                  <button onClick={() => setShowFiltersMobile(false)} className="p-1 rounded-lg hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Keyword */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider">Mots clés</label>
                    <div className="relative">
                      <Search className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={textSearch}
                        onChange={(e) => setTextSearch(e.target.value)}
                        placeholder="ex: plombier, Emmanuel"
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider">Catégorie</label>
                    <select
                      value={selectedCat}
                      onChange={(e) => {
                        setSelectedCat(e.target.value);
                        setSelectedSubcat('');
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  {selectedCat && filteredSubcategories.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider">Sous-catégorie</label>
                      <select
                        value={selectedSubcat}
                        onChange={(e) => setSelectedSubcat(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
                      >
                        <option value="">Toutes les sous-catégories</option>
                        {filteredSubcategories.map(s => (
                          <option key={s.id} value={s.id}>{s.nom}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider">Ville</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
                    >
                      <option value="">Toutes les villes</option>
                      <option value="Abidjan">Abidjan</option>
                      <option value="Bouaké">Bouaké</option>
                      <option value="Daloa">Daloa</option>
                      <option value="Yamoussoukro">Yamoussoukro</option>
                      <option value="San Pedro">San Pedro</option>
                      <option value="Korhogo">Korhogo</option>
                      <option value="Man">Man</option>
                      <option value="Autre">Autre Ville</option>
                    </select>
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider">Quartier</label>
                    <div className="relative">
                      <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        placeholder="ex: Angré, Selmer"
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 h-11 items-center justify-center rounded-xl border border-border text-sm font-semibold text-text hover:bg-gray-50 cursor-pointer"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={() => applyFilters()}
                  className="flex-1 h-11 items-center justify-center rounded-xl bg-primary hover:bg-secondary text-white text-sm font-semibold cursor-pointer shadow-xs"
                >
                  Filtrer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Recherche;
