import React, { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Church, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Toast } from '../../components/ui/Toast';

type PageStatus = 'checking' | 'ready' | 'invalid';

export const NouveauMotDePasse: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PageStatus>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let resolved = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        resolved = true;
        setStatus('ready');
      }
    });

    // Bascule vers "invalide" si le lien recovery n'est pas détecté dans les 2 secondes
    const timer = setTimeout(() => {
      if (!resolved) setStatus('invalid');
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 8) {
      setToast({ message: "Le mot de passe doit faire au moins 8 caractères.", type: 'error' });
      return;
    }
    if (password !== confirm) {
      setToast({ message: "Les deux mots de passe ne correspondent pas.", type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setToast({ message: "Ce lien est expiré ou invalide. Veuillez demander un nouveau lien.", type: 'error' });
        return;
      }
      setToast({ message: "Mot de passe mis à jour avec succès !", type: 'success' });
      setTimeout(() => navigate('/auth/connexion'), 2000);
    } catch {
      setToast({ message: "Une erreur inattendue s'est produite. Veuillez réessayer.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <Church className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-primary block">Service en Christ</span>
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-text">
          Nouveau mot de passe
        </h2>
        <p className="mt-1 text-center text-xs text-muted">
          Choisissez un nouveau mot de passe sécurisé.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-border shadow-md rounded-2xl sm:px-10">
          {status === 'checking' && (
            <div className="text-center py-4">
              <p className="text-sm text-muted">Vérification du lien en cours…</p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-100 text-red-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Ce lien est invalide ou a expiré. Veuillez demander un nouveau lien de réinitialisation.
              </p>
              <Link
                to="/auth/reinitialisation"
                className="inline-block text-xs font-bold text-primary hover:text-secondary"
              >
                Demander un nouveau lien
              </Link>
            </div>
          )}

          {status === 'ready' && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                  Nouveau mot de passe (min 8 car.)
                </label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-secondary transition-all flex items-center justify-center cursor-pointer shadow-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center border-t border-gray-100 pt-5">
            <Link
              to="/auth/connexion"
              className="text-xs font-bold text-primary hover:text-secondary inline-flex items-center gap-1.5"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NouveauMotDePasse;
