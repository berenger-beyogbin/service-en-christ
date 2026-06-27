import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { Toast } from '../../components/ui/Toast';
import { Church, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Connexion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  // Redirect path or go home
  const fromPath = (location.state as any)?.from || '/';

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });

      if (error) {
        const messages: Record<string, string> = {
          'Invalid login credentials': "Email ou mot de passe incorrect.",
          'Email not confirmed': "Veuillez confirmer votre adresse email avant de vous connecter.",
          'Too many requests': "Trop de tentatives. Veuillez patienter quelques minutes.",
          'User not found': "Aucun compte trouvé avec cet email.",
        };
        setToast({ message: messages[error.message] ?? error.message, type: 'error' });
      } else {
        setToast({ message: "Connexion réussie ! Heureux de vous revoir.", type: 'success' });
        
        // Let the state update then redirect
        setTimeout(() => {
          navigate(fromPath, { replace: true });
        }, 1200);
      }
    } catch (err: any) {
      setToast({ message: err.message || "Une erreur s'est produite.", type: 'error' });
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
            <h2 className="text-xl font-bold tracking-tight text-primary text-center">Service en Christ</h2>
          </Link>
        </div>
        <h3 className="mt-4 text-center text-2xl font-bold tracking-tight text-text">
          Se connecter à l'espace
        </h3>
        <p className="mt-2 text-center text-xs text-muted">
          Recherchez et contactez en direct, ou gérez votre profil professionnel.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-border shadow-md rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="ex: paul.kouassi@gmail.com"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Mot de Passe
                </label>
                <Link to="/auth/reinitialisation" className="text-xs text-primary hover:text-secondary font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type={showPwd ? "text" : "password"}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-10 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute top-2.5 right-3 text-muted hover:text-text cursor-pointer"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-secondary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </div>
          </form>

          {/* Seed demo details banner */}
          <div className="mt-6 rounded-xl bg-sky-50/50 border border-sky-100 p-4 space-y-2">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Comptes Démo Pré-installés :
            </h4>
            <div className="grid grid-cols-1 gap-2 text-[11px] text-muted">
              <div>
                <span className="font-semibold text-text">Compte Administrateur :</span><br/>
                Email : <code className="bg-white px-1 border rounded">admin@sec.ci</code><br/>
                Mot de passe : <code className="bg-white px-1 border rounded">admin1234</code>
              </div>
              <div className="border-t border-sky-100/30 pt-1.5">
                <span className="font-semibold text-text">Compte Prestataire (Emmanuel Yao) :</span><br/>
                Email : <code className="bg-white px-1 border rounded">emmanuel@sec.ci</code> / <code className="bg-white px-1 border rounded">prov1234</code>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center border-t border-gray-100 pt-5">
            <span className="text-xs text-muted">Nouveau sur la plateforme ? </span>
            <Link to="/auth/inscription" className="text-xs font-bold text-primary hover:text-secondary">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};
export default Connexion;
