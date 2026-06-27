import React, { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Church, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Toast } from '../../components/ui/Toast';

export const Reinitialisation: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setToast({ message: "Veuillez entrer votre adresse email.", type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/nouveau-mot-de-passe`,
      });
      // Toujours afficher le même message pour ne pas révéler si l'email est inscrit
      setSent(true);
    } catch {
      setToast({ message: "Une erreur est survenue. Veuillez réessayer.", type: 'error' });
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
          Réinitialiser le mot de passe
        </h2>
        <p className="mt-1 text-center text-xs text-muted">
          Entrez votre email pour recevoir les instructions de récupération.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-border shadow-md rounded-2xl sm:px-10">
          {!sent ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: marie@gmail.com"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-secondary transition-all flex items-center justify-center cursor-pointer shadow-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-success border border-emerald-100">
                  <KeyRound className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Si cette adresse est associée à un compte, un lien de réinitialisation a été envoyé. Vérifiez votre boîte mail ainsi que vos spams.
              </p>
            </div>
          )}

          <div className="mt-6 text-center border-t border-gray-100 pt-5">
            <Link to="/auth/connexion" className="text-xs font-bold text-primary hover:text-secondary inline-flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reinitialisation;
