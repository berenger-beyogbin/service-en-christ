import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type VerifyState = 'waiting' | 'verifying' | 'success' | 'error';

export const VerificationEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const email = searchParams.get('email');

  const [state, setState] = useState<VerifyState>(tokenHash && type === 'signup' ? 'verifying' : 'waiting');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!tokenHash || type !== 'signup') return;

    const verify = async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'signup',
      });

      if (error) {
        setErrorMessage(error.message);
        setState('error');
      } else {
        setState('success');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    verify();
  }, [tokenHash, type, navigate]);

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verification`,
      },
    });
    setResendLoading(false);
    if (!error) setResendSent(true);
  };

  if (state === 'verifying') {
    return (
      <div className="flex-1 flex flex-col justify-center py-12 px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-md">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-text">
            Vérification en cours…
          </h2>
          <div className="mt-4 bg-white py-8 px-6 border border-border shadow-md rounded-2xl">
            <p className="text-sm text-muted">
              Veuillez patienter pendant la confirmation de votre adresse email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="flex-1 flex flex-col justify-center py-12 px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-success border border-emerald-100 shadow-md">
              <CheckCircle className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-text">
            Email confirmé !
          </h2>
          <div className="mt-4 bg-white py-8 px-6 border border-border shadow-md rounded-2xl space-y-4">
            <p className="text-sm text-muted leading-relaxed">
              Votre adresse email a été confirmée avec succès. Vous êtes maintenant connecté.
            </p>
            <p className="text-xs text-muted">
              Vous allez être redirigé vers l'accueil dans quelques secondes…
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary transition-all gap-2 shadow-xs cursor-pointer"
              >
                Accéder à l'Accueil
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex-1 flex flex-col justify-center py-12 px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-danger border border-red-100 shadow-md">
              <XCircle className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-text">
            Lien invalide ou expiré
          </h2>
          <div className="mt-4 bg-white py-8 px-6 border border-border shadow-md rounded-2xl space-y-4">
            <p className="text-sm text-muted leading-relaxed">
              Le lien de confirmation est invalide ou a expiré. Veuillez vous réinscrire ou demander un nouveau lien de confirmation.
            </p>
            {errorMessage && (
              <p className="text-xs text-danger">{errorMessage}</p>
            )}
            <div className="pt-2 space-y-3">
              <Link
                to="/auth/connexion"
                className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary transition-all gap-2 shadow-xs cursor-pointer"
              >
                Se connecter
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth/inscription"
                className="w-full inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white text-text text-sm font-semibold hover:bg-gray-50 transition-all gap-2 cursor-pointer"
              >
                Créer un nouveau compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // État "waiting" : affiché juste après l'inscription, avant que l'utilisateur clique sur le lien email
  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-success border border-emerald-100 shadow-md">
            <Mail className="h-8 w-8" />
          </div>
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-text">
          Confirmez votre adresse email
        </h2>

        <div className="mt-4 bg-white py-8 px-6 border border-border shadow-md rounded-2xl space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Un email de confirmation vous a été envoyé
            {email ? (
              <> à <strong className="text-text">{email}</strong></>
            ) : null}.
            Veuillez confirmer votre adresse avant de vous connecter.
          </p>
          <p className="text-xs text-muted">
            Vérifiez également votre dossier spam si vous ne trouvez pas l'email.
          </p>

          {email && (
            <div className="pt-2">
              {resendSent ? (
                <p className="text-sm text-success font-medium">
                  Un nouvel email de confirmation a été envoyé.
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full inline-flex h-11 items-center justify-center rounded-lg border border-border bg-white text-text text-sm font-semibold hover:bg-gray-50 transition-all gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Renvoyer l'email de confirmation
                </button>
              )}
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/auth/connexion"
              className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary transition-all gap-2 shadow-xs cursor-pointer"
            >
              Aller à la connexion
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationEmail;
