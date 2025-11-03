import type { Metadata } from "next";
import LegalLayout from "../LegalLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité (RGPD) – Comptalyze",
  description:
    "Politique RGPD de Comptalyze : données traitées, finalités, bases légales, sous-traitants (Vercel, Stripe), durées, droits, sécurité, transferts, cookies.",
  alternates: {
    canonical: "https://comptalyze.com/legal/politique-de-confidentialite",
  },
};

export default function Page() {
  return (
    <LegalLayout
      title="Politique de confidentialité (RGPD)"
      description="Comment Comptalyze traite vos données personnelles, dans le respect du RGPD."
      breadcrumbLabel="Politique de confidentialité"
      canonicalPath="/legal/politique-de-confidentialite"
    >
      <section>
        <h2>Données traitées</h2>
        <p>
          Comptalyze traite des données nécessaires au fonctionnement du service :
          <strong> email</strong>, <strong>identifiants de connexion</strong>,
          <strong> logs techniques</strong>, ainsi que vos <strong>simulations</strong> liées à votre compte.
        </p>
      </section>

      <section>
        <h2>Finalités</h2>
        <p>
          Les données sont utilisées pour : <strong>authentification</strong>, <strong>fourniture du service</strong>,
          <strong> amélioration produit</strong>, <strong>support client</strong>, <strong>facturation</strong>.
        </p>
      </section>

      <section>
        <h2>Base légale</h2>
        <p>
          Le traitement repose sur l’<strong>exécution du contrat</strong> et l’<strong>intérêt légitime</strong> de
          l’éditeur (sécurité, amélioration du service). Pour toute opération de <strong>marketing</strong>, votre
          <strong> consentement explicite</strong> est requis et peut être retiré à tout moment.
        </p>
      </section>

      <section>
        <h2>Sous‑traitants</h2>
        <p>
          Comptalyze recourt à des prestataires pour l’hébergement et les paiements : <strong>Vercel</strong> (hébergement)
          et <strong>Stripe</strong> (paiements). Aucune <strong>revente de données</strong> à des tiers.
        </p>
      </section>

      <section>
        <h2>Durées de conservation</h2>
        <p>
          Tant que le <strong>compte est actif</strong>, les données nécessaires au service sont conservées.
          En cas de <strong>suppression</strong> du compte, les données associées sont supprimées à la demande, sous
          réserve d’obligations légales ou de sécurité. Les <strong>logs techniques</strong> sont conservés <strong>12 mois</strong>.
        </p>
      </section>

      <section>
        <h2>Droits RGPD</h2>
        <p>
          Vous disposez des droits d’<strong>accès</strong>, <strong>rectification</strong>, <strong>effacement</strong>,
          <strong> opposition</strong> et <strong>portabilité</strong>. Pour exercer ces droits :
          <a href="mailto:contact@comptalyze.com">contact@comptalyze.com</a>.
        </p>
      </section>

      <section>
        <h2>Sécurité</h2>
        <p>
          Les communications sont protégées par <strong>HTTPS</strong> et le chiffrement en transit.
          Comptalyze applique un principe de <strong>minimisation</strong> des données. Aucune <strong>donnée de carte</strong>
          n’est stockée chez Comptalyze (les paiements sont traités par Stripe).
        </p>
      </section>

      <section>
        <h2>Transferts hors UE</h2>
        <p>
          Certains sous‑traitants (Vercel, Stripe) peuvent impliquer des transferts hors UE. Des mesures contractuelles
          appropriées s’appliquent (SCC/DPAs des prestataires).
        </p>
      </section>

      <section>
        <h2>Cookies et traceurs</h2>
        <p>
          Nous n’utilisons que des <strong>cookies nécessaires</strong> au fonctionnement du site (ex. session).
          D’éventuelles <strong>mesures d’audience respectueuses de la vie privée</strong> peuvent être activées.
        </p>
      </section>

      <section>
        <h2>Mise à jour de la politique</h2>
        <p>
          Cette politique peut être mise à jour pour refléter les évolutions légales, techniques ou du service.
        </p>
      </section>
    </LegalLayout>
  );
}


