import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Toast } from '../../components/ui/Toast';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

export const Securite: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 px-4">
        <p className="text-sm text-muted">Veuillez vous connecter pour modifier votre mot de passe.</p>
      </div>
    );
  }

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setToast({ message: "Veuillez remplir tous les champs.", type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setToast({ message: "Le nouveau mot de passe doit faire au moins 8 caractères.", type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: "Les deux nouveaux mots de passe ne correspondent pas.", type: 'error' });
      return;
    }

    if (!user?.email) {
      setToast({ message: "Vous devez être connecté pour effectuer cette action.", type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Vérifie l'ancien mot de passe via Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) {
        setToast({ message: "L'ancien mot de passe est incorrect.", type: 'error' });
        return;
      }

      // Met à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setToast({ message: updateError.message || "Erreur lors de la mise à jour du mot de passe.", type: 'error' });
        return;
      }

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToast({ message: "Mot de passe mis à jour avec succès !", type: 'success' });
      setTimeout(() => navigate('/profil'), 1500);
    } catch {
      setToast({ message: "Une erreur inattendue s'est produite. Veuillez réessayer.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-xl mx-auto w-full px-4 pt-5 pb-10 space-y-6">
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
          <h1 className="text-xl font-bold text-primary">Sécurité du Compte</h1>
          <p className="text-xs text-muted">Modifiez votre mot de passe de connexion</p>
        </div>
      </div>

      <div className="card bg-white p-6 sm:p-8">
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          
          {/* Old Password */}
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
              Ancien Mot de Passe
            </label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
              <input
                type={showPwd ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-9 pr-10 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute top-2.5 right-3 text-muted cursor-pointer hover:text-text"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
              Nouveau Mot de Passe (min 8 car.)
            </label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
              <input
                type={showPwd ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-9 pr-10 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
              Confirmer le Nouveau Mot de Passe
            </label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
              <input
                type={showPwd ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-9 pr-10 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link 
              to="/profil" 
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-text hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white px-6 text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer shadow-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Modification..." : "Mettre à jour le mot de passe"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default Securite;
