import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Toast } from '../../components/ui/Toast';
import { User, Phone, MapPin, Camera, ArrowLeft } from 'lucide-react';

export const ModifierProfil: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille] = useState('Abidjan');
  const [quartier, setQuartier] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (profile) {
      setPrenom(profile.prenom || '');
      setNom(profile.nom || '');
      setTelephone(profile.telephone || '');
      setVille(profile.ville || 'Abidjan');
      setQuartier(profile.quartier || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 px-4">
        <p className="text-sm text-muted">Veuillez vous connecter pour modifier votre profil.</p>
      </div>
    );
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim()) {
      setToast({ message: "Le prénom et le nom sont requis.", type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          prenom: prenom.trim(),
          nom: nom.trim(),
          telephone: telephone.trim(),
          ville,
          quartier: quartier.trim(),
          avatar_url: avatarUrl
        })
        .eq('id', user.id);

      if (error) {
        setToast({ message: error.message, type: 'error' });
      } else {
        // Update user session metadata locally as well
        const activeUserStr = localStorage.getItem('sec_active_user');
        if (activeUserStr) {
          const localUser = JSON.parse(activeUserStr);
          localUser.prenom = prenom.trim();
          localUser.nom = nom.trim();
          localUser.telephone = telephone.trim();
          localUser.ville = ville;
          localUser.quartier = quartier.trim();
          localUser.avatar_url = avatarUrl;
          localStorage.setItem('sec_active_user', JSON.stringify(localUser));
        }

        await refreshProfile();
        setToast({ message: "Profil mis à jour avec succès !", type: 'success' });
        setTimeout(() => {
          navigate('/profil');
        }, 1200);
      }
    } catch (err: any) {
      setToast({ message: err.message || "Une erreur s'est produite.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-5 pb-10 space-y-6">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/profil" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary">Modifier mes Informations</h1>
          <p className="text-xs text-muted">Mettez à jour vos coordonnées personnelles</p>
        </div>
      </div>

      <div className="card bg-white p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Avatar Upload Container */}
          <div className="flex flex-col items-center space-y-3 pb-4 border-b border-gray-100">
            <div className="relative">
              <img 
                src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${prenom}%20${nom}`} 
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover border-4 border-primary/5 shadow-md"
                referrerPolicy="no-referrer"
              />
              <label className="absolute bottom-0 right-0 h-8 w-8 bg-primary hover:bg-secondary text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
                <Camera className="h-4.5 w-4.5" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </label>
            </div>
            <span className="text-xs text-muted">Cliquez sur l'icône pour modifier votre photo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prénom */}
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                Nom
              </label>
              <div className="relative">
                <User className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="ex: 0707070707"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ville */}
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                Ville
              </label>
              <div className="relative">
                <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                <select
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
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
            </div>

            {/* Quartier */}
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                Quartier
              </label>
              <div className="relative">
                <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  placeholder="ex: Cocody, Yopougon"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
            <Link 
              to="/profil" 
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-text hover:bg-gray-50 cursor-pointer"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white px-6 text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer shadow-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
export default ModifierProfil;
