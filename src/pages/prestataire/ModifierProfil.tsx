import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Category, Subcategory, ProviderProfile } from '../../types';
import { Toast } from '../../components/ui/Toast';
import { 
  Check, ChevronRight, ChevronLeft, Upload, 
  Trash2, AlertTriangle, ShieldCheck, HelpCircle, FileText, ArrowLeft
} from 'lucide-react';

export const ModifierProfilPrestataire: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Categories & Subcategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // Existing Provider Profile
  const [origProfile, setOrigProfile] = useState<ProviderProfile | null>(null);
  const [origSubs, setOrigSubs] = useState<string[]>([]);

  // Form State
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState<number>(1);
  const [catId, setCatId] = useState('');
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [ville, setVille] = useState('Abidjan');
  const [quartier, setQuartier] = useState('');

  const [telPro, setTelPro] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [emailPro, setEmailPro] = useState('');
  const [tarifMin, setTarifMin] = useState<number>(5000);
  const [tarifMax, setTarifMax] = useState<number>(50000);
  const [tarifUnite, setTarifUnite] = useState('FCFA');
  const [disponibilite, setDisponibilite] = useState('Lun-Sam, 8h-18h');
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  // Check if health category is triggered
  const isHealthCategory = catId === 'cat-9' || selectedSubs.some(sId => {
    const sub = subcategories.find(s => s.id === sId);
    return sub?.category_id === 'cat-9';
  });

  useEffect(() => {
    const fetchMetadataAndProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);

        // Fetch categories and subcategories
        const { data: cats } = await supabase.from('categories').select('*').eq('actif', true).order('ordre', { ascending: true });
        const { data: subs } = await supabase.from('subcategories').select('*').eq('actif', true).order('ordre', { ascending: true });
        
        if (cats) setCategories(cats);
        if (subs) setSubcategories(subs);

        // Fetch current provider profile
        const { data: profs } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', user.id);

        const currentProf = profs?.[0] as ProviderProfile | undefined;
        if (!currentProf) {
          // If no provider profile exists, navigate to creation
          navigate('/prestataire/creer');
          return;
        }

        setOrigProfile(currentProf);

        // Pre-populate fields
        setTitre(currentProf.titre || '');
        setDescription(currentProf.description || '');
        setExperience(currentProf.experience_annees || 1);
        setVille(currentProf.ville || 'Abidjan');
        setQuartier(currentProf.quartier || '');
        setTelPro(currentProf.telephone_pro || '');
        setWhatsapp(currentProf.whatsapp || '');
        setEmailPro(currentProf.email_pro || '');
        setTarifMin(Number(currentProf.tarif_min) || 5000);
        setTarifMax(Number(currentProf.tarif_max) || 50000);
        setTarifUnite(currentProf.tarif_unite || 'FCFA');
        setDisponibilite(currentProf.disponibilite || 'Lun-Sam, 8h-18h');

        // Fetch selected subcategories
        const { data: currentCats } = await supabase
          .from('provider_categories')
          .select('subcategory_id')
          .eq('provider_profile_id', currentProf.id);

        if (currentCats) {
          const subIds = currentCats.map((c: { subcategory_id: string }) => c.subcategory_id);
          setSelectedSubs(subIds);
          setOrigSubs(subIds);

          // Find the category of the first subcategory to preselect primary category
          if (subIds.length > 0 && subs) {
            const firstSub = subs.find(s => s.id === subIds[0]);
            if (firstSub) {
              setCatId(firstSub.category_id);
            }
          }
        }

        // Fetch portfolio photos
        const { data: currentPhotos } = await supabase
          .from('portfolio_photos')
          .select('url')
          .eq('provider_profile_id', currentProf.id)
          .eq('actif', true)
          .order('ordre', { ascending: true });

        if (currentPhotos) {
          setPortfolioPhotos(currentPhotos.map((p: { url: string }) => p.url));
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setToast({ message: "Impossible de charger votre profil.", type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchMetadataAndProfile();
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 px-4">
        <div className="text-center space-y-4 max-w-sm">
          <AlertTriangle className="h-12 w-12 text-accent mx-auto" />
          <h2 className="text-xl font-bold text-text">Connexion requise</h2>
          <p className="text-sm text-muted">
            Veuillez vous connecter pour modifier votre profil.
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <Link to="/auth/connexion" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white font-semibold px-5 shadow-xs">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p className="text-sm text-muted">Chargement de votre profil prestataire...</p>
      </div>
    );
  }

  const activeSubs = subcategories.filter(s => s.category_id === catId);

  const handleSubCheckbox = (subId: string) => {
    if (selectedSubs.includes(subId)) {
      setSelectedSubs(selectedSubs.filter(id => id !== subId));
    } else {
      if (selectedSubs.length >= 5) {
        setToast({ message: "Vous pouvez sélectionner un maximum de 5 sous-catégories.", type: 'error' });
        return;
      }
      setSelectedSubs([...selectedSubs, subId]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 6 - portfolioPhotos.length;
      const filesToLoad = Array.from(files).slice(0, remainingSlots) as File[];

      filesToLoad.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPortfolioPhotos(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPortfolioPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    if (!origProfile) return;
    setSaving(true);

    try {
      // Compare if important fields or categories have changed to reset validation status
      const hasImportantFieldsChanged = 
        origProfile.titre !== titre.trim() || 
        origProfile.description !== description.trim() ||
        JSON.stringify(origSubs.sort()) !== JSON.stringify([...selectedSubs].sort());

      const finalStatus = hasImportantFieldsChanged ? 'en_attente' : origProfile.statut_validation;

      // 1. Update the core provider profiles table
      const { error: updateErr } = await supabase
        .from('provider_profiles')
        .update({
          titre: titre.trim(),
          description: description.trim(),
          experience_annees: experience,
          telephone_pro: telPro.trim(),
          whatsapp: whatsapp.trim(),
          email_pro: emailPro.trim(),
          ville,
          quartier: quartier.trim(),
          tarif_min: tarifMin,
          tarif_max: tarifMax,
          tarif_unite: tarifUnite,
          disponibilite: disponibilite.trim(),
          statut_validation: finalStatus,
          categorie_sante: isHealthCategory,
          updated_at: new Date().toISOString()
        })
        .eq('id', origProfile.id);

      if (updateErr) {
        setToast({ message: updateErr.message, type: 'error' });
        setSaving(false);
        return;
      }

      // 2. Re-create categories link
      // Delete old ones first
      await supabase
        .from('provider_categories')
        .delete()
        .eq('provider_profile_id', origProfile.id);

      const catLinks = selectedSubs.map((subId, index) => ({
        provider_profile_id: origProfile.id,
        subcategory_id: subId,
        is_primary: index === 0
      }));

      await supabase.from('provider_categories').insert(catLinks);

      // 3. Re-create portfolio photos
      await supabase
        .from('portfolio_photos')
        .delete()
        .eq('provider_profile_id', origProfile.id);

      if (portfolioPhotos.length > 0) {
        const photoRecords = portfolioPhotos.map((url, index) => ({
          provider_profile_id: origProfile.id,
          url,
          ordre: index + 1,
          actif: true
        }));
        await supabase.from('portfolio_photos').insert(photoRecords);
      }

      await refreshProfile();
      
      if (hasImportantFieldsChanged) {
        setToast({ message: "Profil mis à jour ! Suite à vos modifications, votre fiche est repassée en cours de validation.", type: 'success' });
      } else {
        setToast({ message: "Profil mis à jour avec succès !", type: 'success' });
      }

      setTimeout(() => {
        navigate('/prestataire/tableau-de-bord');
      }, 2000);

    } catch (err: any) {
      setToast({ message: err.message || "Une erreur s'est produite lors de la mise à jour.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const validateStep1 = () => {
    if (titre.trim().length < 10) {
      setToast({ message: "Le titre doit faire au moins 10 caractères.", type: 'error' });
      return false;
    }
    if (description.trim().length < 30) {
      setToast({ message: "La description doit faire au moins 30 caractères.", type: 'error' });
      return false;
    }
    if (!quartier.trim()) {
      setToast({ message: "Veuillez préciser votre quartier.", type: 'error' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!catId) {
      setToast({ message: "Veuillez choisir une catégorie principale.", type: 'error' });
      return false;
    }
    if (selectedSubs.length === 0) {
      setToast({ message: "Sélectionnez au moins une spécialité.", type: 'error' });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!telPro.trim()) {
      setToast({ message: "Le numéro de téléphone professionnel est obligatoire.", type: 'error' });
      return false;
    }
    if (tarifMin > tarifMax) {
      setToast({ message: "Le tarif minimum ne peut pas dépasser le tarif maximum.", type: 'error' });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
    if (step === 3 && validateStep3()) setStep(4);
  };

  const prevStep = () => {
    setStep(p => p - 1);
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 pt-5 pb-10 space-y-8">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Stepper Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/prestataire/tableau-de-bord" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary">Modifier mon Profil Prestataire</h1>
            <p className="text-xs text-muted">Ajustez les informations de votre fiche professionnelle</p>
          </div>
        </div>

        {/* Multi-step progress bar */}
        <div className="relative pt-4">
          <div className="absolute top-1/2 left-0 h-0.5 w-full bg-gray-200 -translate-y-1/2 pointer-events-none" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300 pointer-events-none" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex flex-col items-center gap-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                  step > s ? 'bg-primary border-primary text-white' : 
                  step === s ? 'bg-white border-primary text-primary ring-4 ring-sky-100' : 
                  'bg-white border-gray-300 text-muted'
                }`}>
                  {step > s ? <Check className="h-4 w-4 stroke-[3]" /> : s}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${step === s ? 'text-primary' : 'text-muted'}`}>
                  {s === 1 ? 'Général' : s === 2 ? 'Catégories' : s === 3 ? 'Contacts' : 'Validation'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEP FORM PANEL */}
      <div className="card bg-white p-6 sm:p-8 border border-border rounded-2xl shadow-xs">
        
        {/* STEP 1: Informations Générales */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-primary border-b border-gray-100 pb-2">Étape 1 : Votre activité principale</h2>
            
            {/* Titre */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Titre de votre service <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="ex: Plombier chauffagiste agréé — Dépannage rapide"
                className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <p className="text-[10px] text-muted">Soyez explicite. Minimum 10 caractères.</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Description de vos services & engagements <span className="text-danger">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Décrivez précisément votre expertise, vos domaines d'intervention, vos valeurs et votre façon de travailler..."
                className="w-full p-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
              <p className="text-[10px] text-muted">Soyez complet pour rassurer les clients. Minimum 30 caractères.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Expérience */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Années d'expérience professionnelle <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={experience}
                  onChange={(e) => setExperience(parseInt(e.target.value) || 1)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden transition-all"
                />
              </div>

              {/* Ville */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Ville <span className="text-danger">*</span>
                </label>
                <select
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden transition-all"
                >
                  <option value="Abidjan">Abidjan</option>
                  <option value="Yamoussoukro">Yamoussoukro</option>
                  <option value="Bouaké">Bouaké</option>
                  <option value="San-Pédro">San-Pédro</option>
                  <option value="Korhogo">Korhogo</option>
                  <option value="Daloa">Daloa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quartier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Quartier / Commune <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  placeholder="ex: Cocody Angré, Marcory Zone 4"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden transition-all"
                />
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: Catégories & Spécialités */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-primary border-b border-gray-100 pb-2">Étape 2 : Vos secteurs de spécialité</h2>
            
            {/* Choisir catégorie principale */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Catégorie Principale d'Activité <span className="text-danger">*</span>
              </label>
              <select
                value={catId}
                onChange={(e) => {
                  setCatId(e.target.value);
                  setSelectedSubs([]); // Reset subs on category change
                }}
                className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden transition-all"
              >
                <option value="">-- Sélectionnez une catégorie --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Choisir sous-catégories correspondantes */}
            {catId && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Sélectionnez vos spécialités (maximum 5) <span className="text-danger">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeSubs.map(sub => {
                    const isChecked = selectedSubs.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubCheckbox(sub.id)}
                        className={`flex items-center justify-between p-3 border rounded-lg text-xs font-semibold transition-all text-left ${
                          isChecked 
                            ? 'border-primary bg-sky-50/20 text-primary' 
                            : 'border-border bg-white text-text hover:bg-neutral'
                        }`}
                      >
                        <span>{sub.nom}</span>
                        <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked ? 'bg-primary border-primary text-white' : 'border-gray-300'
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Tarifs, Contacts & Portfolio */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-primary border-b border-gray-100 pb-2">Étape 3 : Informations de contact & portfolio</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Téléphone Pro */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Téléphone professionnel de contact <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  value={telPro}
                  onChange={(e) => setTelPro(e.target.value)}
                  placeholder="ex: +225 07 00 00 00 00"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden transition-all"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Numéro WhatsApp (facultatif)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="ex: +225 05 00 00 00 00"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* E-mail Pro */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Adresse e-mail professionnelle
                </label>
                <input
                  type="email"
                  value={emailPro}
                  onChange={(e) => setEmailPro(e.target.value)}
                  placeholder="ex: contact@plomberie.com"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden transition-all"
                />
              </div>

              {/* Disponibilité */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Disponibilité d'intervention
                </label>
                <input
                  type="text"
                  value={disponibilite}
                  onChange={(e) => setDisponibilite(e.target.value)}
                  placeholder="ex: Lun-Ven, 8h-18h / Urgences 24h/7"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Tarifs */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Fourchette tarifaire de vos prestations (indicatif)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={tarifMin}
                  onChange={(e) => setTarifMin(parseInt(e.target.value) || 0)}
                  className="col-span-1 h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden transition-all"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={tarifMax}
                  onChange={(e) => setTarifMax(parseInt(e.target.value) || 0)}
                  className="col-span-1 h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden transition-all"
                />
                <select
                  value={tarifUnite}
                  onChange={(e) => setTarifUnite(e.target.value)}
                  className="col-span-1 h-11 px-2 rounded-lg border border-border bg-gray-50 focus:bg-white text-xs font-bold outline-hidden transition-all"
                >
                  <option value="FCFA">FCFA</option>
                  <option value="Urgences">Par Urgence</option>
                  <option value="Devis">Sur Devis</option>
                  <option value="Heure">Par Heure</option>
                  <option value="Jour">Par Jour</option>
                </select>
              </div>
            </div>

            {/* Portfolio Photos */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Photos de vos réalisations (Optionnel, Max 6)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {portfolioPhotos.map((photoUrl, idx) => (
                  <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden group">
                    <img 
                      src={photoUrl} 
                      alt={`Réalisation ${idx + 1}`} 
                      className="h-full w-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-white/95 text-rose-600 hover:bg-rose-50 shadow-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {portfolioPhotos.length < 6 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-xl aspect-square flex flex-col items-center justify-center p-3 text-center hover:bg-neutral hover:border-primary transition-all cursor-pointer">
                    <Upload className="h-5 w-5 text-muted mb-1.5" />
                    <span className="text-[10px] font-bold text-muted uppercase">Ajouter</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-muted">Uploadez des photos claires de vos chantiers ou produits récents.</p>
            </div>
          </div>
        )}

        {/* STEP 4: Validation & Charte d'Éthique */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-primary border-b border-gray-100 pb-2">Étape 4 : Soumission et révision</h2>
            
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/25 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-800 text-sm">Engagement éthique actif</h3>
                  <p className="text-xs text-emerald-700 leading-tight">Vous avez approuvé la charte éthique chrétienne v1.0</p>
                </div>
              </div>

              <div className="text-xs text-emerald-900 leading-normal bg-white/70 p-4 rounded-xl space-y-2 border border-emerald-100/50">
                <p>
                  En tant que professionnel chrétien de l'annuaire, vous avez accepté de faire du témoignage de Jésus-Christ l'inspiration fondamentale de votre activité. 
                </p>
                <p className="font-bold">
                  Rappel des 5 piliers de la Charte :
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>L'honnêteté rigoureuse des tarifs (aucun surcoût masqué).</li>
                  <li>L'excellence technique et la ponctualité.</li>
                  <li>La loyauté et le respect de la parole donnée.</li>
                  <li>La politesse de traitement et le refus des pots-de-vin.</li>
                  <li>La résolution amiable et fraternelle en cas de désaccord.</li>
                </ol>
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-4 text-xs text-amber-800 leading-normal flex gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Note de révision :</strong> Si vous avez apporté des modifications substantielles à vos services principaux (titre, description ou spécialités), votre profil repassera automatiquement en cours de validation par les administrateurs avant d'être à nouveau visible par le grand public.
              </span>
            </div>
          </div>
        )}

        {/* ACTIONS NAVIGATION BAR */}
        <div className="flex gap-4 justify-between pt-6 border-t border-gray-100 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-gray-50 text-text cursor-pointer"
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Retour
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-secondary text-white text-sm font-bold px-5 gap-1.5 cursor-pointer shadow-xs"
            >
              Continuer
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Mise à jour..." : "Enregistrer les modifications"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ModifierProfilPrestataire;
