import React from 'react';
import { Sparkles, ArrowLeft, Heart, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const APropos: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5 pb-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-1.5">
            <Heart className="h-5.5 w-5.5 text-accent" />
            À propos de Service en Christ
          </h1>
          <p className="text-xs text-muted">L'excellence professionnelle pour la gloire de Dieu</p>
        </div>
      </div>

      <div className="space-y-6 text-text">
        {/* Intro */}
        <div className="card bg-white p-6 sm:p-8 border border-border rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Notre Vision & Mission
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Né d'une volonté d'excellence et d'intégrité au sein de la communauté en Côte d'Ivoire, <strong>Service en Christ</strong> est un outil visant à valoriser le savoir-faire des artisans et professionnels chrétiens. Notre but est de mettre en relation des clients exigeants avec des prestataires engagés à honorer Dieu par la qualité de leur travail et une probité sans faille.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Nous croyons que le travail de chaque chrétien doit être un témoignage vivant. En facilitant l'accès à des professionnels de confiance, nous encourageons une économie de probité et d'amour du prochain.
          </p>
        </div>

        {/* Valeurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-white p-6 border border-border rounded-2xl space-y-3">
            <h3 className="font-bold text-primary text-sm flex items-center gap-2">
              <span className="p-1 rounded-md bg-sky-50 text-sky-600">✓</span>
              Intégrité & Transparence
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Toutes les fiches de l'annuaire de confiance sont examinées. Nous exigeons une transparence totale sur les tarifs et l'acceptation de notre charte éthique chrétienne v1.0.
            </p>
          </div>

          <div className="card bg-white p-6 border border-border rounded-2xl space-y-3">
            <h3 className="font-bold text-primary text-sm flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">★</span>
              Excellence du Service
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Nous encourageons nos membres à accomplir chaque œuvre comme pour le Seigneur Jésus-Christ, en veillant à la ponctualité, à l'application technique et au respect de la parole donnée.
            </p>
          </div>
        </div>

        {/* Fonctionnement validation */}
        <div className="card bg-white p-6 sm:p-8 border border-border rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Le processus de validation
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Pour figurer sur la liste publique de l'annuaire, chaque artisan s'inscrit puis soumet un dossier d'activité détaillé (titre, expérience, photos de réalisations) et signe électroniquement la charte chrétienne. 
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Notre équipe d'administration vérifie la cohérence du profil et sa conformité morale avec la charte avant d'autoriser la publication de la fiche. Les signalements de la communauté permettent d'assurer une amélioration constante et la pérennité du service.
          </p>
        </div>

        {/* Équipe */}
        <div className="card bg-white p-6 sm:p-8 border border-border rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-primary">L'Équipe & Partenariats</h2>
          <p className="text-sm text-muted leading-relaxed">
            L'annuaire de confiance Service en Christ est une initiative soutenue par <strong>BEYOGBIN Ministries</strong> et diverses œuvres chrétiennes en Côte d'Ivoire. Nous travaillons activement pour équiper la communauté chrétienne dans son impact professionnel quotidien.
          </p>
        </div>

        {/* Contact */}
        <div className="card bg-white p-6 sm:p-8 border border-border rounded-2xl text-center space-y-4">
          <h2 className="text-lg font-bold text-primary">Nous Contacter</h2>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Une question, une suggestion de catégorie, ou besoin d'aide pour inscrire votre activité professionnelle ? Contactez notre équipe de modération.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-gray-50 rounded-xl text-primary font-bold text-sm">
            <Mail className="h-4.5 w-4.5 text-accent" />
            contact@servicenchrist.app
          </div>
        </div>
      </div>
    </div>
  );
};

export default APropos;
