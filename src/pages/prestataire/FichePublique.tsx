import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Toast } from '../../components/ui/Toast';
import {
  Phone, Mail, MapPin, CheckCircle, ShieldAlert,
  ArrowLeft, Calendar, Facebook, Instagram, Globe, MessageSquare, AlertCircle, Star,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';

export const FichePublique: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [provider, setProvider] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const photos: any[] = provider?.portfolio_photos ?? [];

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(() => {
    setLightboxIndex(i => (i !== null ? (i - 1 + photos.length) % photos.length : null));
  }, [photos.length]);
  const nextPhoto = useCallback(() => {
    setLightboxIndex(i => (i !== null ? (i + 1) % photos.length : null));
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPhoto();
      else if (e.key === 'ArrowRight') nextPhoto();
      else if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, prevPhoto, nextPhoto, closeLightbox]);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('provider_profiles')
          .select('id, user_id, titre, description, ville, quartier, adresse_detail, experience_annees, telephone_pro, whatsapp, email_pro, tarif_min, tarif_max, tarif_unite, disponibilite, site_web, facebook, instagram, statut_validation, note_moyenne, nombre_avis, categorie_sante, created_at, portfolio_photos(*), profiles!user_id(prenom, nom, avatar_url)')
          .eq('id', id)
          .eq('statut_validation', 'valide');

        if (error) {
          console.error('Error fetching provider profile:', error);
          setToast({ message: "Impossible de charger le profil.", type: 'error' });
        } else if (data && data.length > 0) {
          const matched = data[0];
          setProvider(matched);
          if (matched.portfolio_photos && matched.portfolio_photos.length > 0) {
            setActivePhoto(matched.portfolio_photos[0].url);
          }
        } else {
          setProvider(null);
        }
      } catch (err) {
        console.error('Error fetching provider details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5 pb-12 space-y-6">
        <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-md" />
        <div className="card bg-white p-6 animate-pulse h-96 rounded-2xl" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 px-4">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-text">Profil introuvable</h2>
          <p className="text-sm text-muted">
            Ce prestataire n'existe pas ou son profil n'a pas encore été validé publiquement.
          </p>
          <div className="pt-2">
            <Link to="/recherche" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white font-semibold px-5 shadow-sm">
              Retourner à la recherche
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Increment contact log in database
  const logContactEvent = async (type: 'appel' | 'whatsapp' | 'email') => {
    try {
      await supabase.from('contact_events').insert({
        provider_profile_id: provider.id,
        type_contact: type
      });
    } catch (err) {
      console.error('Failed to log contact event:', err);
    }
  };

  // Trigger contacts
  const handleCall = () => {
    logContactEvent('appel');
    setToast({ message: "Appel initié vers le prestataire !", type: 'success' });
    setTimeout(() => {
      window.location.href = `tel:${provider.telephone_pro}`;
    }, 600);
  };

  const handleWhatsApp = () => {
    logContactEvent('whatsapp');
    const formattedNum = (provider.whatsapp || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Bonjour ${provider.profiles?.prenom || ''},\n\nJ'ai trouvé votre profil sur l'annuaire "Service en Christ". Je souhaite vous contacter concernant votre prestation : ${provider.titre}`
    );
    setToast({ message: "Redirection vers WhatsApp en cours...", type: 'success' });
    setTimeout(() => {
      window.open(`https://wa.me/${formattedNum}?text=${message}`, '_blank');
    }, 600);
  };

  const handleEmail = () => {
    logContactEvent('email');
    const subject = encodeURIComponent(`Demande de prestation via Service en Christ`);
    const body = encodeURIComponent(
      `Bonjour ${provider.profiles?.prenom || ''},\n\nJ'ai trouvé votre profil sur l'annuaire Service en Christ.\nJe vous contacte concernant votre service : ${provider.titre}\n\nMerci de me recontacter.`
    );
    setToast({ message: "Redirection vers votre messagerie...", type: 'success' });
    setTimeout(() => {
      window.location.href = `mailto:${provider.email_pro}?subject=${subject}&body=${body}`;
    }, 600);
  };

  const openLightbox = (index: number) => setLightboxIndex(index);

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5 pb-8 sm:px-6 space-y-6">
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link 
          to="/recherche" 
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-xs font-semibold text-text hover:bg-gray-50 cursor-pointer shadow-xs gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux résultats
        </Link>
        {user ? (
          <Link 
            to={`/signaler/${provider.id}`}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4" />
            Signaler ce profil
          </Link>
        ) : (
          <button 
            onClick={() => setToast({ message: "Veuillez vous connecter pour signaler un profil.", type: 'warning' })}
            className="text-xs font-semibold text-muted hover:text-text flex items-center gap-1 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4" />
            Signaler ce profil
          </button>
        )}
      </div>

      {/* Healthcare critical banner */}
      {provider.categorie_sante && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-950 text-xs leading-relaxed font-sans">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong>Avertissement important</strong> : Ce service relève du bien-être non thérapeutique et ne constitue pas un acte médical. En cas de problème de santé, veuillez consulter un médecin agréé.
            </div>
          </div>
        </div>
      )}

      {/* Main visual container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile identity + Contacts Card */}
        <div className="space-y-6">
          
          <div className="card bg-white p-6 text-center space-y-4 border border-border rounded-2xl shadow-xs">
            
            {/* Avatar */}
            <div className="relative inline-block">
              <img 
                src={provider.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${provider.profiles?.prenom}%20${provider.profiles?.nom}`} 
                alt="Avatar"
                className="mx-auto h-24 w-24 rounded-full object-cover border-4 border-primary/5 shadow-md"
                referrerPolicy="no-referrer"
              />
              {provider.statut_validation === 'valide' && (
                <div className="absolute bottom-0 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-white shadow-md">
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            {/* Names & Badges */}
            <div className="space-y-1">
              <h2 className="font-sans font-bold text-base text-text">
                {provider.profiles?.prenom} {provider.profiles?.nom}
              </h2>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                ✓ Profil validé
              </span>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
              <div>
                <span className="text-[10px] text-muted block uppercase font-bold">Expérience</span>
                <span className="font-bold text-text text-sm">{provider.experience_annees || 0} ans</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block uppercase font-bold">Note moyenne</span>
                <span className="font-bold text-text text-sm flex items-center justify-center gap-1">
                  <Star className="h-3.5 w-3.5 text-accent fill-accent shrink-0" />
                  {provider.note_moyenne?.toFixed(1) || '0.0'}
                </span>
              </div>
            </div>

            {/* Core direct action triggers */}
            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <button
                onClick={handleCall}
                className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-primary hover:bg-secondary text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Phone className="h-4.5 w-4.5" />
                Appeler le prestataire
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                <MessageSquare className="h-4.5 w-4.5" />
                Contacter via WhatsApp
              </button>

              <button
                onClick={handleEmail}
                className="w-full flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white hover:bg-gray-50 text-text font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Mail className="h-4.5 w-4.5 text-muted" />
                Envoyer un e-mail
              </button>
            </div>
          </div>

          {/* Social connections if available */}
          {(provider.facebook || provider.instagram || provider.site_web) && (
            <div className="card bg-white p-5 space-y-3.5 border border-border rounded-xl shadow-xs">
              <h3 className="text-[10px] font-bold text-muted uppercase tracking-wide">Réseaux & Liens</h3>
              <div className="space-y-2.5 text-xs">
                {provider.site_web && (
                  <a href={provider.site_web} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Globe className="h-4 w-4 text-muted" />
                    <span className="truncate">{provider.site_web}</span>
                  </a>
                )}
                {provider.facebook && (
                  <a href={provider.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Facebook className="h-4 w-4 text-muted" />
                    <span className="truncate">Facebook</span>
                  </a>
                )}
                {provider.instagram && (
                  <a href={provider.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Instagram className="h-4 w-4 text-muted" />
                    <span className="truncate">Instagram</span>
                  </a>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Rich Description + Portfolio Details area */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="card bg-white p-6 sm:p-8 space-y-6 border border-border rounded-2xl shadow-xs">
            
            {/* Title / Header */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-primary leading-tight">
                {provider.titre}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-muted font-semibold">
                <MapPin className="h-4 w-4 text-muted shrink-0" />
                <span>{provider.ville}{provider.quartier ? `, ${provider.quartier}` : ''}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold text-muted uppercase tracking-wide">À propos du service</h3>
              <p className="text-sm text-text leading-relaxed whitespace-pre-line font-medium text-justify">
                {provider.description}
              </p>
            </div>

            {/* Operational metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-gray-100 py-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-muted uppercase tracking-wide text-[10px]">Tarifs indicatifs</span>
                <span className="text-sm font-bold text-emerald-600 block">
                  {provider.tarif_min ? `${provider.tarif_min.toLocaleString()} – ${provider.tarif_max?.toLocaleString()} FCFA` : 'Sur devis uniquement'}
                  <span className="text-xs text-muted font-normal"> ({provider.tarif_unite})</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-muted uppercase tracking-wide text-[10px]">Disponibilité & horaires</span>
                <span className="text-xs font-bold text-text block flex gap-1 items-center">
                  <Calendar className="h-4 w-4 text-muted" />
                  {provider.disponibilite || 'Lundi au Samedi'}
                </span>
              </div>
            </div>

            {/* Portfolio pictures visual gallery */}
            {photos.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-[11px] font-bold text-muted uppercase tracking-wide">
                  Galerie de réalisations ({photos.length})
                </h3>

                {/* Active preview — double-clic pour ouvrir le lightbox */}
                {activePhoto && (
                  <div
                    className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-gray-100 shadow-sm cursor-zoom-in"
                    onDoubleClick={() => openLightbox(photos.findIndex((p: any) => p.url === activePhoto))}
                    title="Double-cliquez pour agrandir"
                  >
                    <img src={activePhoto} alt="Aperçu" className="h-full w-full object-cover" />
                    <span className="absolute bottom-2 right-2 bg-black/40 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full pointer-events-none">
                      Double-clic pour agrandir
                    </span>
                  </div>
                )}

                {/* Grid selectors */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {photos.map((photo: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActivePhoto(photo.url)}
                      onDoubleClick={() => openLightbox(index)}
                      className={`relative aspect-4/3 rounded-lg overflow-hidden border bg-gray-50 shrink-0 transition-all cursor-pointer ${
                        activePhoto === photo.url ? 'ring-2 ring-primary border-transparent' : 'border-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={photo.url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && photos[lightboxIndex] && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                onClick={closeLightbox}
              >
                {/* Close */}
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Counter */}
                <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-semibold">
                  {lightboxIndex + 1} / {photos.length}
                </span>

                {/* Prev */}
                {photos.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); prevPhoto(); }}
                    className="absolute left-3 sm:left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {/* Image */}
                <div
                  className="max-h-[90vh] max-w-[90vw] flex items-center justify-center"
                  onClick={e => e.stopPropagation()}
                >
                  <img
                    src={photos[lightboxIndex].url}
                    alt={`Photo ${lightboxIndex + 1}`}
                    className="max-h-[88vh] max-w-[88vw] rounded-xl object-contain shadow-2xl"
                  />
                </div>

                {/* Next */}
                {photos.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); nextPhoto(); }}
                    className="absolute right-3 sm:right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

                {/* Thumbnail strip */}
                {photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm overflow-x-auto max-w-[90vw]">
                    {photos.map((_: any, i: number) => (
                      <button
                        key={i}
                        onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                        className={`h-1.5 rounded-full transition-all ${i === lightboxIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
export default FichePublique;
