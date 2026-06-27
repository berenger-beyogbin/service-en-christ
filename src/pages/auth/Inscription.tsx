import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { Toast } from '../../components/ui/Toast';
import { Church, Mail, Phone, Lock, User, MapPin, Eye, EyeOff } from 'lucide-react';

const phoneRegex = /^(\+225)?[0-9]{10}$/;

const signupSchema = z.object({
  prenom: z.string().min(2, "Le prénom doit comporter au moins 2 caractères"),
  nom: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  telephone: z.string().regex(phoneRegex, "Format de numéro ivoirien invalide (ex: 0707070707)"),
  ville: z.string().min(2, "La ville est requise"),
  quartier: z.string().optional(),
  mot_de_passe: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmation_mdp: z.string().min(1, "Veuillez confirmer votre mot de passe")
}).refine((data) => data.mot_de_passe === data.confirmation_mdp, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmation_mdp"]
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const Inscription: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      ville: 'Abidjan',
      quartier: ''
    }
  });

  const onSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.mot_de_passe,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verification`,
          data: {
            prenom: values.prenom,
            nom: values.nom,
            telephone: values.telephone,
            ville: values.ville,
            quartier: values.quartier || ''
          }
        }
      });

      if (error) {
        const messages: Record<string, string> = {
          'User already registered': "Un compte existe déjà avec cette adresse email.",
          'Invalid email': "Adresse email invalide.",
          'Password should be at least 6 characters': "Le mot de passe doit contenir au moins 8 caractères.",
          'email rate limit exceeded': "Trop de tentatives d'inscription. Veuillez patienter quelques minutes avant de réessayer.",
        };
        setToast({ message: messages[error.message] ?? error.message, type: 'error' });
      } else if (data.session) {
        // Confirmation email désactivée côté Supabase : l'utilisateur est directement connecté
        navigate('/');
      } else {
        // Confirmation email requise : redirection vers la page d'attente
        navigate(`/auth/verification?email=${encodeURIComponent(values.email)}`);
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
          Créer un compte particulier
        </h3>
        <p className="mt-2 text-center text-xs text-muted">
          Rejoignez l'annuaire pour rechercher, contacter ou signaler des prestataires.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 border border-border shadow-md rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            
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
                    {...register('prenom')}
                    placeholder="ex: Yao"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                {errors.prenom && (
                  <p className="mt-1 text-xs text-danger font-medium">{errors.prenom.message}</p>
                )}
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
                    {...register('nom')}
                    placeholder="ex: Kouamé"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                {errors.nom && (
                  <p className="mt-1 text-xs text-danger font-medium">{errors.nom.message}</p>
                )}
              </div>
            </div>

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
                  placeholder="ex: jean.kouame@gmail.com"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                Téléphone (Côte d'Ivoire)
              </label>
              <div className="relative">
                <Phone className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type="tel"
                  {...register('telephone')}
                  placeholder="ex: 0707070707"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-1 text-[10px] text-muted leading-none">Format: 10 chiffres (ex: 05, 07, 01)</p>
              {errors.telephone && (
                <p className="mt-1 text-xs text-danger font-medium">{errors.telephone.message}</p>
              )}
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
                    {...register('ville')}
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
                {errors.ville && (
                  <p className="mt-1 text-xs text-danger font-medium">{errors.ville.message}</p>
                )}
              </div>

              {/* Quartier */}
              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                  Quartier (si Abidjan)
                </label>
                <div className="relative">
                  <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    type="text"
                    {...register('quartier')}
                    placeholder="ex: Angré, Selmer"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                Mot de Passe (min 8 car.)
              </label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type={showPwd ? "text" : "password"}
                  {...register('mot_de_passe')}
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
              {errors.mot_de_passe && (
                <p className="mt-1 text-xs text-danger font-medium">{errors.mot_de_passe.message}</p>
              )}
            </div>

            {/* Confirmation Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                Confirmer le Mot de Passe
              </label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  {...register('confirmation_mdp')}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-10 rounded-lg border border-border bg-gray-50 focus:bg-white text-sm outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute top-2.5 right-3 text-muted hover:text-text cursor-pointer"
                >
                  {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmation_mdp && (
                <p className="mt-1 text-xs text-danger font-medium">{errors.confirmation_mdp.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-secondary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Création du compte..." : "Créer mon compte"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-5">
            <span className="text-xs text-muted">Vous possédez déjà un compte ? </span>
            <Link to="/auth/connexion" className="text-xs font-bold text-primary hover:text-secondary">
              Se connecter
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};
export default Inscription;
