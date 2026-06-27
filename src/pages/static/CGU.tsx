import React from 'react';
import { ShieldCheck, ArrowLeft, Scale, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CGU: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5 pb-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 border border-border bg-white rounded-lg hover:bg-gray-50 text-text cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-1.5">
            <Scale className="h-5.5 w-5.5 text-accent" />
            Conditions Générales d'Utilisation (CGU)
          </h1>
          <p className="text-xs text-muted">Dernière mise à jour : Juin 2026</p>
        </div>
      </div>

      <div className="card bg-white p-6 sm:p-8 border border-border rounded-2xl space-y-6 text-text">
        
        {/* Encart Clause de responsabilité obligatoire */}
        <div className="rounded-xl border border-sky-100 bg-sky-50/35 p-5 text-sm text-primary leading-relaxed flex gap-3">
          <Info className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
          <p className="font-medium">
            "Service en Christ est un annuaire numérique facilitant la mise en relation entre prestataires et demandeurs. La plateforme n'est pas partie au contrat pouvant se former entre un prestataire et un demandeur. La validation d'un profil par l'administration signifie que les informations paraissent cohérentes et conformes à la charte — elle ne constitue pas une garantie de la qualité finale de chaque prestation. Les utilisateurs sont invités à exercer leur propre discernement avant de confier une mission."
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">1. Objet de la plateforme</h2>
          <p className="text-sm text-muted leading-relaxed">
            La plateforme "Service en Christ" est un annuaire numérique chrétien en Côte d'Ivoire. Son objet exclusif est de faciliter la mise en relation entre des prestataires de services professionnels (artisans, indépendants, entreprises) membres ou sympathisants de la communauté chrétienne, et des demandeurs de services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">2. Accès à la plateforme</h2>
          <p className="text-sm text-muted leading-relaxed">
            L'accès et la consultation des fiches de l'annuaire sont entièrement gratuits et ne requièrent aucune inscription préalable pour le grand public. L'inscription est uniquement obligatoire pour les prestataires de services souhaitant référencer leur activité sur la plateforme.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">3. Rôle et indépendance de la plateforme</h2>
          <p className="text-sm text-muted leading-relaxed">
            Le rôle de Service en Christ se limite strictement à celui d'un tiers diffuseur d'informations de mise en relation. À ce titre, la plateforme ne conclut aucune vente, n'encaisse aucun paiement de prestation et ne perçoit aucune commission. Elle n'est en aucun cas partie aux accords ou contrats, formels ou informels, susceptibles d'être conclus directement entre les prestataires de l'annuaire et leurs clients.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">4. Absence de garantie des compétences</h2>
          <p className="text-sm text-muted leading-relaxed">
            Bien que Service en Christ effectue un examen administratif avant de valider l'affichage d'un profil, cette validation ne constitue pas et ne doit pas être interprétée comme une certification ou une garantie d'aptitude professionnelle ou de qualité d'exécution technique de la part de l'administration. Il appartient exclusivement au client d'évaluer les compétences professionnelles du prestataire, de solliciter des devis détaillés et de convenir des termes d'exécution du contrat.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">5. Obligations des prestataires (Charte v1.0)</h2>
          <p className="text-sm text-muted leading-relaxed">
            Chaque prestataire s'engage formellement, lors de la soumission de sa candidature, à respecter la Charte d'Engagement Professionnel Chrétien v1.0 de Service en Christ. Cette charte prône la probité, l'honnêteté intellectuelle, le respect des tarifs, la ponctualité, et le témoignage du Christ par l'excellence. Le non-respect de cette charte entraîne le retrait immédiat et sans indemnité de la fiche de l'annuaire.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">6. Obligations des demandeurs</h2>
          <p className="text-sm text-muted leading-relaxed">
            Les demandeurs de services s'engagent à faire un usage strictement personnel, loyal et non commercial des coordonnées obtenues via la plateforme. Ils s'engagent à respecter le travail des professionnels référencés et à honorer leurs engagements contractuels directement avec eux.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">7. Procédure de signalement</h2>
          <p className="text-sm text-muted leading-relaxed">
            En cas de comportement inapproprié, d'arnaque ou de manquement flagrant à la charte de la part d'un prestataire, tout utilisateur peut initier une demande de signalement via le formulaire de contact ou le bouton "Signaler" de la fiche publique. L'équipe d'administration s'engage à traiter chaque signalement de manière équitable et à prendre les sanctions requises pouvant aller jusqu'au bannissement définitif.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">8. Protection des données personnelles (Loi Ivoirienne)</h2>
          <p className="text-sm text-muted leading-relaxed">
            Conformément à la Loi ivoirienne n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel, l'ARTCI veille au traitement intègre des informations. Service en Christ recueille le minimum d'informations requises pour l'établissement des fiches d'activité et ne commercialise aucune donnée personnelle auprès de tiers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">9. Limitation de responsabilité</h2>
          <p className="text-sm text-muted leading-relaxed">
            Service en Christ ne pourra en aucun cas être tenu responsable de tout dommage direct ou indirect, perte financière, retard, malfaçon ou litige survenant lors de la réalisation d'une prestation initiée via l'annuaire.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">10. Droit applicable et Règlement des litiges</h2>
          <p className="text-sm text-muted leading-relaxed">
            Les présentes CGU sont régies par le droit ivoirien. En cas de contestation sur l'utilisation du service de l'annuaire et à défaut de résolution amiable, les tribunaux compétents d'Abidjan seront seuls habilités à trancher le litige.
          </p>
        </section>

      </div>
    </div>
  );
};

export default CGU;
