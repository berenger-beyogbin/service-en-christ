import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Category, Subcategory } from '../../types';
import { Toast } from '../../components/ui/Toast';
import { 
  Check, ChevronRight, ChevronLeft, Upload, 
  Trash2, AlertTriangle, ShieldCheck, HelpCircle, FileText
} from 'lucide-react';

export const CreerProfil: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Categories & Subcategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // Form State
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState<number>(1);
  
  const [catId, setCatId] = useState('');
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [ville, setVille] = useState('Abidjan');
  const [quartier, setQuartier] = useState('');
  const [zone, setZone] = useState('');

  const [telPro, setTelPro] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [emailPro, setEmailPro] = useState('');
  const [tarifMin, setTarifMin] = useState<number>(5000);
  const [tarifMax, setTarifMax] = useState<number>(50000);
  const [tarifUnite, setTarifUnite] = useState('FCFA');
  const [disponibilite, setDisponibilite] = useState('Lun-Sam, 8h-18h');
  const [portfolioPhotos, setPortfolioPhotos] = useState<{ file: File; previewUrl: string }[]>([]);

  const [charteAcceptee, setCharteAcceptee] = useState(false);
  const [saving, setSaving] = useState(false);

  const isHealthCategory = categories
    .filter(c => /sant[eé]/i.test(c.nom))
    .some(c => c.id === catId || selectedSubs.some(sId =>
      subcategories.find(s => s.id === sId)?.category_id === c.id
    ));

  useEffect(() => {
    const fetchMetadata = async () => {
      const { data: cats } = await supabase.from('categories').select('*').eq('actif', true).order('ordre', { ascending: true });
      const { data: subs } = await supabase.from('subcategories').select('*').eq('actif', true).order('ordre', { ascending: true });
      if (cats) setCategories(cats);
      if (subs) setSubcategories(subs);
    };
    fetchMetadata();
  }, []);

  // Redirect if already a provider — checks both the flag and the DB row directly
  // (handles the case where is_provider flag is out of sync with provider_profiles)
  useEffect(() => {
    if (!user) return;
    if (profile?.is_provider) {
      navigate('/prestataire/tableau-de-bord');
      return;
    }
    supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) navigate('/prestataire/tableau-de-bord');
      });
  }, [user, profile, navigate]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 px-4">
        <div className="text-center space-y-4 max-w-sm">
          <AlertTriangle className="h-12 w-12 text-accent mx-auto" />
          <h2 className="text-xl font-bold text-text">Connexion requise</h2>
          <p className="text-sm text-muted">
            Veuillez créer un compte personnel ou vous connecter avant d'enregistrer votre profil prestataire.
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <Link to="/auth/connexion" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white font-semibold px-5 shadow-xs">
              Se connecter
            </Link>
            <Link to="/auth/inscription" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white font-semibold px-5 text-text hover:bg-gray-50">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter subs for chosen main category
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
    if (!files) return;
    const remainingSlots = 6 - portfolioPhotos.length;
    const newItems = Array.from(files).slice(0, remainingSlots).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPortfolioPhotos(prev => [...prev, ...newItems]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(portfolioPhotos[index].previewUrl);
    setPortfolioPhotos(portfolioPhotos.filter((_, i) => i !== index));
  };

  // Stepper Validations
  const validateStep = () => {
    if (step === 1) {
      if (titre.trim().length < 10) {
        setToast({ message: "Le titre de votre service doit comporter au moins 10 caractères.", type: 'error' });
        return false;
      }
      if (description.trim().length < 100) {
        setToast({ message: "La description doit faire au moins 100 caractères pour inspirer confiance.", type: 'error' });
        return false;
      }
    } else if (step === 2) {
      if (!catId) {
        setToast({ message: "Veuillez sélectionner votre catégorie principale.", type: 'error' });
        return false;
      }
      if (selectedSubs.length === 0) {
        setToast({ message: "Veuillez sélectionner au moins une sous-catégorie.", type: 'error' });
        return false;
      }
    } else if (step === 3) {
      if (!telPro.trim()) {
        setToast({ message: "Le numéro de téléphone professionnel est requis.", type: 'error' });
        return false;
      }
      if (!whatsapp.trim()) {
        setToast({ message: "Le numéro WhatsApp professionnel est requis.", type: 'error' });
        return false;
      }
      if (!emailPro.trim()) {
        setToast({ message: "L'adresse email professionnelle est requise.", type: 'error' });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(s => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1));
    window.scrollTo(0, 0);
  };

  const handleSubmitProfile = async () => {
    if (!charteAcceptee) {
      setToast({ message: "Veuillez lire et accepter la charte d'utilisation pour continuer.", type: 'error' });
      return;
    }

    setSaving(true);
    try {
      // 0. S'assurer que le profil de base existe (sécurité si le trigger n'a pas tourné)
      await supabase.from('profiles').upsert({
        id: user.id,
        prenom: user.user_metadata?.prenom || '',
        nom: user.user_metadata?.nom || '',
        telephone: user.user_metadata?.telephone || '',
        ville: user.user_metadata?.ville || 'Abidjan',
        quartier: user.user_metadata?.quartier || '',
      }, { onConflict: 'id', ignoreDuplicates: true });

      // 1. Create entry in provider_profiles
      const { data: provProf, error: provErr } = await supabase
        .from('provider_profiles')
        .insert({
          user_id: user.id,
          titre: titre.trim(),
          description: description.trim(),
          experience_annees: experience,
          telephone_pro: telPro.trim(),
          whatsapp: whatsapp.trim(),
          email_pro: emailPro.trim(),
          ville,
          quartier: quartier.trim(),
          adresse_detail: zone.trim(),
          tarif_min: tarifMin,
          tarif_max: tarifMax,
          tarif_unite: tarifUnite,
          disponibilite: disponibilite.trim(),
          statut_validation: 'en_attente',
          charte_acceptee: true,
          charte_version: '1.0',
          date_acceptation_charte: new Date().toISOString(),
          categorie_sante: isHealthCategory
        });

      if (provErr) {
        setToast({ message: provErr.message, type: 'error' });
        setSaving(false);
        return;
      }

      // Fetch the created profile to link categories & photos
      const { data: fetchProfs } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', user.id);

      const createdProf = fetchProfs?.[0];
      if (createdProf) {
        // 2. Link categories
        const catLinks = selectedSubs.map((subId, index) => ({
          provider_profile_id: createdProf.id,
          subcategory_id: subId,
          is_primary: index === 0
        }));
        await supabase.from('provider_categories').insert(catLinks);

        // 3. Upload portfolio photos to Supabase Storage then save public URLs
        if (portfolioPhotos.length > 0) {
          const uploadedUrls: string[] = [];
          for (const item of portfolioPhotos) {
            const randomPart = Math.random().toString(36).slice(2, 8);
            const ext = (item.file.name.split('.').pop() ?? 'jpg').toLowerCase();
            const filePath = `${user.id}/${Date.now()}-${randomPart}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from('portfolio')
              .upload(filePath, item.file, { cacheControl: '3600', upsert: false });
            if (uploadError) {
              setToast({ message: `Erreur upload photo : ${uploadError.message}`, type: 'error' });
              setSaving(false);
              return;
            }
            const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(filePath);
            uploadedUrls.push(urlData.publicUrl);
          }
          const photoRecords = uploadedUrls.map((url, index) => ({
            provider_profile_id: createdProf.id,
            url,
            ordre: index + 1,
            actif: true
          }));
          await supabase.from('portfolio_photos').insert(photoRecords);
        }

        // 4. Update the core profile 'is_provider' flag
        await supabase
          .from('profiles')
          .update({ is_provider: true })
          .eq('id', user.id);

        // Create initial Audit Log
        await supabase.from('audit_logs').insert({
          admin_id: null,
          action: 'SUBMIT_PROFILE_CREATION',
          target_id: createdProf.id,
          target_type: 'provider_profile',
          details: { prenom: profile?.prenom, nom: profile?.nom }
        });

        await refreshProfile();
        setToast({ message: "Votre profil prestataire a été soumis et est en cours de validation !", type: 'success' });
        setTimeout(() => {
          navigate('/prestataire/tableau-de-bord');
        }, 1500);
      }
    } catch (err: any) {
      setToast({ message: err.message || "Une erreur s'est produite lors de la soumission.", type: 'error' });
    } finally {
      setSaving(false);
    }
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
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-primary">Créer mon Profil Prestataire</h1>
          <p className="text-xs text-muted">Proposez vos services de confiance et rejoignez notre communauté de professionnels engagés</p>
        </div>

        {/* Multi-step progress bar */}
        <div className="relative">
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
                  {s === 1 ? 'Général' : s === 2 ? 'Catégories' : s === 3 ? 'Contacts' : 'Charte'}
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
                placeholder="ex: Plombier chauffagiste agréé — Dépannage rapide 24h/7"
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
                rows={6}
                placeholder="Décrivez précisément ce que vous proposez, votre méthodologie de travail, vos outils et comment vous incarnez l'honnêteté de la charte de confiance chrétienne dans votre activité professionnelle..."
                className="w-full p-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <p className="text-[10px] text-muted flex justify-between">
                <span>Minimum 100 caractères.</span>
                <span className={description.trim().length >= 100 ? 'text-success font-semibold' : 'text-danger font-semibold'}>
                  {description.trim().length} / 100 caractères
                </span>
              </p>
            </div>

            {/* Années d'Expérience */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Années d'expérience professionnelle <span className="text-danger">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experience}
                  onChange={(e) => setExperience(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 h-11 px-3 text-center rounded-lg border border-border bg-gray-50 text-sm font-semibold focus:bg-white"
                />
                <span className="text-sm text-text font-medium">ans d'activité</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Catégories et Localisation */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-base font-bold text-primary border-b border-gray-100 pb-2">Étape 2 : Secteur d'activité et localisation</h2>

            {/* Main Category Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Catégorie Principale <span className="text-danger">*</span>
              </label>
              <select
                value={catId}
                onChange={(e) => {
                  setCatId(e.target.value);
                  setSelectedSubs([]); // reset subcats
                }}
                className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="">Sélectionner une catégorie...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Subcategories checklist */}
            {catId && activeSubs.length > 0 && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Sous-catégories associées <span className="text-danger">*</span> (Maximum 5)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  {activeSubs.map(sub => (
                    <label key={sub.id} className="flex items-start gap-2.5 text-xs font-medium text-text cursor-pointer hover:text-primary">
                      <input
                        type="checkbox"
                        checked={selectedSubs.includes(sub.id)}
                        onChange={() => handleSubCheckbox(sub.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 mt-0.5 cursor-pointer"
                      />
                      <span>{sub.nom}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Localisation details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Ville <span className="text-danger">*</span>
                </label>
                <select
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary appearance-none"
                >
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

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Quartier / Commune <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  placeholder="ex: Cocody Angré, Yopougon Sogefiha"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden"
                />
              </div>
            </div>

            {/* Travel Radius */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Zone de déplacement / Rayon d'action
              </label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="ex: Tout Abidjan, Bingerville et Grand-Bassam"
                className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden"
              />
            </div>

          </div>
        )}

        {/* STEP 3: Contacts, Tarifs et Réalisations */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-base font-bold text-primary border-b border-gray-100 pb-2">Étape 3 : Contacts professionnels, tarifs & réalisations</h2>

            {/* Contacts details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Téléphone professionnel <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  value={telPro}
                  onChange={(e) => setTelPro(e.target.value)}
                  placeholder="ex: +225 07 07 07 07 07"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Numéro WhatsApp <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="ex: +225 05 05 05 05 05"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden"
                />
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Adresse e-mail professionnelle <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  value={emailPro}
                  onChange={(e) => setEmailPro(e.target.value)}
                  placeholder="ex: contact@yao-plomberie.ci"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden"
                />
              </div>
            </div>

            {/* Tarifs details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">Tarif minimum (FCFA)</label>
                <input
                  type="number"
                  step={500}
                  value={tarifMin}
                  onChange={(e) => setTarifMin(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 text-sm font-semibold focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">Tarif maximum (FCFA)</label>
                <input
                  type="number"
                  step={500}
                  value={tarifMax}
                  onChange={(e) => setTarifMax(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 text-sm font-semibold focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">Unité de tarification</label>
                <select
                  value={tarifUnite}
                  onChange={(e) => setTarifUnite(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-gray-50 text-sm font-semibold focus:bg-white"
                >
                  <option value="FCFA">à la prestation (FCFA)</option>
                  <option value="FCFA/Heure">à l'heure (FCFA/Heure)</option>
                  <option value="FCFA/Jour">à la journée (FCFA/Jour)</option>
                  <option value="Sur devis">Sur devis uniquement</option>
                </select>
              </div>
            </div>

            {/* Disponibilité */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">Disponibilité</label>
              <input
                type="text"
                value={disponibilite}
                onChange={(e) => setDisponibilite(e.target.value)}
                placeholder="ex: Lun-Sam: 8h - 18h / Urgences dimanche"
                className="w-full h-11 px-3.5 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden"
              />
            </div>

            {/* Portfolio Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Galerie de réalisations / Portfolio (Max 6 photos)
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {portfolioPhotos.map((item, i) => (
                  <div key={i} className="relative aspect-4/3 rounded-xl overflow-hidden border border-border group bg-gray-100">
                    <img src={item.previewUrl} alt="Portfolio item" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer shadow-md opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {portfolioPhotos.length < 6 && (
                  <label className="aspect-4/3 border-2 border-dashed border-border hover:border-primary rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-sky-50/20 transition-all gap-1 text-center p-3">
                    <Upload className="h-6 w-6 text-muted" />
                    <span className="text-[10px] font-bold text-text uppercase tracking-wider">Ajouter photo</span>
                    <span className="text-[9px] text-muted">{6 - portfolioPhotos.length} emplacements restants</span>
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
            </div>

          </div>
        )}

        {/* STEP 4: Charte d'utilisation */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-base font-bold text-primary border-b border-gray-100 pb-2">Étape 4 : Engagement éthique & Charte d'utilisation</h2>

            {/* Health warnings caution */}
            {isHealthCategory && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-2 text-rose-900 animate-bounce-short">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">⚠️ Attention : Contrôle renforcé (Santé et bien-être)</h4>
                    <p className="text-xs leading-relaxed">
                      Seuls les services de bien-être non médicaux sont acceptés sur cette plateforme. Les consultations médicales, paramédicales, les diagnostics, prescriptions et actes de soins sont strictement exclus. Votre profil fera l'objet d'un contrôle rigoureux avant toute mise en ligne.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Charte display block */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-4 w-4 text-primary" />
                Charte de droiture et d'excellence (Engagement Chrétien)
              </span>
              <div className="h-72 overflow-y-auto rounded-xl border border-border bg-gray-50 p-4 text-xs text-text leading-relaxed font-sans space-y-4">
                <p className="font-bold text-center border-b border-gray-200 pb-2">CHARTE D'UTILISATION — SERVICE EN CHRIST (Version 1.0)</p>
                <p>En créant mon profil prestataire sur la plateforme Service en Christ, je m'engage solennellement à :</p>
                <p><strong>1. EXACTITUDE</strong> : Fournir des informations vraies, complètes et à jour sur mon identité, mes compétences, mon expérience et mes services. Toute fausse déclaration entraîne d'office le rejet ou la suppression définitive de mon profil.</p>
                <p><strong>2. HONNÊTETÉ TARIFAIRE</strong> : Pratiquer des tarifs justes et transparents. Ne pas appliquer de marges ou de frais abusifs et ne jamais modifier un tarif unilatéralement après accord verbal ou écrit avec un client.</p>
                <p><strong>3. RESPECT DES ENGAGEMENTS</strong> : Honorer ponctuellement les rendez-vous de chantier. Prévenir le client suffisamment à l'avance en cas d'imprévu. Ne jamais abandonner un travail ou une prestation en cours sans motif légitime.</p>
                <p><strong>4. COMPORTEMENT RESPECTUEUX</strong> : Traiter chaque client avec politesse, dignité et respect, sans discrimination d'aucune sorte.</p>
                <p><strong>5. INTERDICTION DE FRAUDE</strong> : Ne pas escroquer, abuser ni tromper un client. Toute fraude avérée entraîne une suppression immédiate et un signalement aux autorités ivoiriennes compétentes (ARTCI / Police).</p>
                <p><strong>6. INTERDICTION D'USURPATION</strong> : Ne jamais utiliser des photos de chantiers, des logos, des diplômes ou des références de tiers.</p>
                <p><strong>7. CONFIDENTIALITÉ</strong> : Ne pas divulguer les données de contact, photos de domicile ou informations privées de mes clients.</p>
                <p><strong>8. QUALITÉ MINIMALE</strong> : Assurer des livrables de haute facture et mettre mon expertise au service du client de manière dévouée.</p>
                <p><strong>9. SANCTIONS</strong> : Tout signalement de manquement fera l'objet d'un audit de l'administrateur de la plateforme et pourra entraîner un avertissement, une suspension temporaire ou permanente de mon compte.</p>
              </div>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 p-4 rounded-xl border border-sky-100 bg-sky-50/40 text-xs font-semibold text-text cursor-pointer hover:bg-sky-50/80 transition-colors">
              <input
                type="checkbox"
                checked={charteAcceptee}
                onChange={(e) => setCharteAcceptee(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5 shrink-0 mt-0.5 cursor-pointer"
              />
              <span className="leading-normal">
                Je déclare sur l'honneur avoir lu, compris et accepté l'intégralité de cette charte de confiance chrétienne et m'engage à la respecter rigoureusement dans mes interventions.
              </span>
            </label>

          </div>
        )}

        {/* CONTROLS BUTTONS */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || saving}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-text hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white px-6 text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer shadow-xs"
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitProfile}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-accent text-white px-6 text-sm font-bold hover:bg-amber-600 transition-colors cursor-pointer shadow-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Soumission en cours..." : "Soumettre mon profil"}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
export default CreerProfil;
