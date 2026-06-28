import React from 'react';
import { Link } from 'react-router-dom';
import { Church, Mail, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border pb-[72px] md:pb-0">

      {/* ── Zone principale ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4 lg:grid-cols-4">

          {/* Colonne 1 — Marque */}
          <div className="col-span-2 sm:col-span-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
                <Church className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-sm text-text">Service en Christ</span>
            </div>
            <p className="text-[12px] text-muted leading-snug">
              L'annuaire chrétien de confiance pour trouver un prestataire qualifié, vérifié et contactable directement.
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-medium border border-green-100">
                <CheckCircle2 className="h-2.5 w-2.5" /> Profils vérifiés
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100">
                <Phone className="h-2.5 w-2.5" /> Contact direct
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-100">
                Sans commission
              </span>
            </div>
          </div>

          {/* Colonne 2 — Navigation */}
          <div className="col-span-1">
            <h3 className="text-[10px] font-semibold text-text uppercase tracking-wider mb-2">Navigation</h3>
            <ul className="space-y-1">
              {[
                { label: 'Rechercher un prestataire', to: '/recherche' },
                { label: 'Devenir prestataire', to: '/prestataire/creer' },
                { label: 'Découvrir la charte', to: '/cgu' },
                { label: 'Se connecter', to: '/auth/connexion' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-[12px] text-muted hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Informations */}
          <div className="col-span-1">
            <h3 className="text-[10px] font-semibold text-text uppercase tracking-wider mb-2">Informations</h3>
            <ul className="space-y-1">
              {[
                { label: "Conditions d'utilisation", to: '/cgu' },
                { label: 'Protection des données', to: '/confidentialite' },
                { label: 'À propos', to: '/a-propos' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-[12px] text-muted hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 — Contact */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-[10px] font-semibold text-text uppercase tracking-wider mb-2">Contact</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[12px] text-muted">
                <Phone className="h-3 w-3 text-primary shrink-0" />
                <span>+225 07 00 00 00 00</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-muted">
                <Mail className="h-3 w-3 text-primary shrink-0" />
                <span>contact@servicenchrist.app</span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px] text-orange-600 pt-1">
                <ShieldAlert className="h-3 w-3 shrink-0 mt-0.5" />
                <Link to="/a-propos" className="hover:underline leading-snug">
                  Un profil inapproprié ? Signalez-le.
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bande basse ── */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <p className="text-[11px] text-muted">
              © {currentYear} Service en Christ - Tous droits réservés.
            </p>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link to="/cgu" className="text-[11px] text-muted hover:text-primary transition-colors">CGU</Link>
              <span className="text-muted select-none text-xs">·</span>
              <Link to="/confidentialite" className="text-[11px] text-muted hover:text-primary transition-colors">Confidentialité</Link>
              <span className="text-muted select-none text-xs">·</span>
              <Link to="/a-propos" className="text-[11px] text-muted hover:text-primary transition-colors">Support</Link>
            </div>
          </div>
          <p className="text-[10px] text-muted mt-1 leading-snug">
            Chaque client reste responsable de son choix, de ses échanges et de tout engagement conclu avec un prestataire.
          </p>
        </div>
      </div>

    </footer>
  );
};
