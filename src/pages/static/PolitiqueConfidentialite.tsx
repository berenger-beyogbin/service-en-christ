import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PolitiqueConfidentialite: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5 pb-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-1.5">
            <Lock className="h-5.5 w-5.5 text-accent" />
            Politique de Confidentialité
          </h1>
          <p className="text-xs text-muted">Dernière mise à jour : Juin 2026</p>
        </div>
      </div>

      <div className="card bg-white p-6 sm:p-8 border border-border rounded-2xl space-y-6 text-text">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">1. Responsable du traitement</h2>
          <p className="text-sm text-muted leading-relaxed">
            Le traitement des données à caractère personnel collectées sur l'annuaire "Service en Christ" est placé sous la responsabilité de l'association ou entité éditrice (ci-après désignée "Service en Christ" ou "l'Équipe d'Administration").
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">2. Cadre légal et Juridiction applicable</h2>
          <p className="text-sm text-muted leading-relaxed">
            Conformément aux réglementations numériques en vigueur, le cadre juridique de référence pour la collecte et le traitement de vos données est la <strong>Loi ivoirienne n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel</strong> sous le contrôle de l'<strong>ARTCI</strong> (Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire). Le Règlement Général sur la Protection des Données (RGPD) européen est cité et pris en compte à titre de référentiel de bonnes pratiques d'ingénierie logicielle pour assurer un haut niveau de confidentialité, mais n'est pas juridiquement applicable sur le territoire ivoirien.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">3. Données personnelles collectées</h2>
          <p className="text-sm text-muted leading-relaxed">
            Nous veillons à collecter uniquement le strict nécessaire pour le bon fonctionnement de l'annuaire :
          </p>
          <ul className="list-disc pl-5 text-sm text-muted space-y-2">
            <li><strong>Pour les utilisateurs visiteurs :</strong> Aucune donnée personnelle nominative n'est collectée lors de la simple navigation de recherche.</li>
            <li><strong>Pour les prestataires (membres de l'annuaire) :</strong> Nom, prénom, numéro de téléphone portable, coordonnées de messagerie professionnelle, lien WhatsApp de contact, adresse professionnelle, descriptif d'activité, photos d'illustration professionnelles et version de la charte approuvée.</li>
            <li><strong>Pour les signalements (reports) :</strong> Adresse e-mail ou identifiant unique du demandeur signalant, afin de pouvoir lui adresser un suivi d'instruction.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">4. Finalités du traitement des données</h2>
          <p className="text-sm text-muted leading-relaxed">
            Vos données sont exploitées pour les seules finalités suivantes :
          </p>
          <ul className="list-disc pl-5 text-sm text-muted space-y-2">
            <li>Gestion et publication des profils d'artisans au sein de l'annuaire de confiance.</li>
            <li>Permettre la mise en relation téléphonique, e-mail et WhatsApp avec les clients intéressés.</li>
            <li>Vérifier la conformité de la fiche avec la charte d'éthique professionnelle chrétienne v1.0.</li>
            <li>Suivre les signalements en vue de préserver la sécurité globale de l'annuaire.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">5. Sécurité et Hébergement des données</h2>
          <p className="text-sm text-muted leading-relaxed">
            Toutes les données sont stockées et sécurisées par le service cloud <strong>Supabase</strong> avec des bases de données PostgreSQL chiffrées au repos et protégées par des politiques de sécurité strictes au niveau des lignes (Row Level Security - RLS). L'accès aux interfaces d'administration est rigoureusement réservé aux seuls modérateurs autorisés de Service en Christ.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">6. Cookies et technologies de suivi</h2>
          <p className="text-sm text-muted leading-relaxed">
            La plateforme Service en Christ n'utilise <strong>aucun cookie publicitaire tiers</strong>. Seuls des cookies techniques de session indispensables (via Supabase Auth) sont employés pour vous maintenir connecté à votre espace membre lors de vos visites.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">7. Durée de conservation des données</h2>
          <p className="text-sm text-muted leading-relaxed">
            Les données des prestataires sont conservées tant que le compte est actif. En cas de fermeture de compte ou de inactivité prolongée de plus de 24 mois, les données d'identification sont définitivement purgées de nos serveurs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">8. Vos droits et modalités d'exercice</h2>
          <p className="text-sm text-muted leading-relaxed">
            Conformément à la Loi ivoirienne n°2013-450, vous disposez d'un droit permanent d'accès, de rectification, de mise à jour et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment depuis votre tableau de bord membre, ou en nous contactant par courriel à l'adresse officielle de l'annuaire.
          </p>
        </section>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 text-xs text-emerald-800 leading-normal flex gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Service en Christ s'engage fermement à ne jamais commercialiser, louer ou divulguer vos coordonnées à des fins de prospection publicitaire.</span>
        </div>

      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
