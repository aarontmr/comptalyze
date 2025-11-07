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
        <h2>Sous‑traitants et transferts de données</h2>
        <p className="mb-3">
          Comptalyze recourt à des sous-traitants certifiés pour assurer le fonctionnement du service. 
          Aucune <strong>revente de données</strong> à des tiers commerciaux.
        </p>
        
        <div className="space-y-3">
          <div>
            <strong className="block text-white">Hébergement web et infrastructure :</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>
                <strong>Vercel Inc.</strong> – Hébergement dans des régions UE, transferts encadrés par SCC –{" "}
                <a 
                  href="https://vercel.com/legal/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00D084] hover:text-[#00c077] underline"
                >
                  Politique de confidentialité Vercel
                </a>
              </li>
              <li>
                <strong>Supabase (Supabase Inc.)</strong> – Base de données PostgreSQL hébergée en Europe –{" "}
                <a 
                  href="https://supabase.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00D084] hover:text-[#00c077] underline"
                >
                  Politique de confidentialité Supabase
                </a>
                {" "}|{" "}
                <a 
                  href="https://supabase.com/docs/guides/platform/shared-responsibility-model#gdpr-and-dpa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00D084] hover:text-[#00c077] underline"
                >
                  DPA Supabase
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <strong className="block text-white">Paiements et facturation :</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>
                <strong>Stripe Inc.</strong> – Traitement sécurisé des paiements, conforme PCI-DSS –{" "}
                <a 
                  href="https://stripe.com/fr/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00D084] hover:text-[#00c077] underline"
                >
                  Politique de confidentialité Stripe
                </a>
                {" "}|{" "}
                <a 
                  href="https://stripe.com/fr/privacy-center/legal#data-processing-agreement" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00D084] hover:text-[#00c077] underline"
                >
                  DPA Stripe
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <strong className="block text-white">Emails transactionnels :</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>
                <strong>Resend</strong> – Envoi d'emails de service (vérification, notifications) –{" "}
                <a 
                  href="https://resend.com/legal/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00D084] hover:text-[#00c077] underline"
                >
                  Politique de confidentialité Resend
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <strong className="block text-white">Intelligence Artificielle (Premium) :</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>
                <strong>OpenAI</strong> – Assistant IA (fonctionnalités Premium uniquement) –{" "}
                <a 
                  href="https://openai.com/policies/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00D084] hover:text-[#00c077] underline"
                >
                  Politique de confidentialité OpenAI
                </a>
                {" "}|{" "}
                <a 
                  href="https://openai.com/policies/data-processing-agreement" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00D084] hover:text-[#00c077] underline"
                >
                  DPA OpenAI
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <p className="mt-4 text-sm text-gray-400">
          Tous les sous-traitants sont sélectionnés selon des critères stricts de sécurité et de conformité RGPD. 
          Les transferts hors UE sont encadrés par les <strong>Clauses Contractuelles Types (SCC)</strong> de la Commission Européenne 
          ou d'autres mécanismes appropriés.
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
        <h2>Droits RGPD et contact DPO</h2>
        <p className="mb-3">
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
        </p>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Droit d'accès</strong> – obtenir la confirmation du traitement de vos données et y accéder</li>
          <li><strong>Droit de rectification</strong> – corriger les données inexactes ou incomplètes</li>
          <li><strong>Droit à l'effacement</strong> (&quot;droit à l'oubli&quot;) – supprimer vos données sous certaines conditions</li>
          <li><strong>Droit d'opposition</strong> – vous opposer au traitement de vos données</li>
          <li><strong>Droit à la portabilité</strong> – récupérer vos données dans un format structuré</li>
          <li><strong>Droit à la limitation</strong> – demander la suspension du traitement</li>
        </ul>
        <p className="mb-2">
          <strong>Pour exercer vos droits, contactez notre Délégué à la Protection des Données (DPO) :</strong>
        </p>
        <p className="mb-2">
          📧 Email : <a href="mailto:dpo@comptalyze.com" className="text-[#00D084] hover:text-[#00c077] underline font-medium">dpo@comptalyze.com</a>
        </p>
        <p className="text-sm text-gray-400">
          Nous nous engageons à répondre à votre demande dans un délai d'<strong>un mois</strong> maximum 
          (extensible à 3 mois en cas de complexité). Une pièce d'identité pourra être demandée pour vérifier votre identité.
        </p>
        <p className="mt-3 text-sm text-gray-400">
          Vous disposez également du droit d'introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale 
          de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#00D084] hover:text-[#00c077] underline">www.cnil.fr</a>
        </p>
      </section>

      <section>
        <h2>Sécurité</h2>
        <p className="mb-3">
          Les communications sont protégées par <strong>HTTPS</strong> et le chiffrement en transit.
          Comptalyze applique un principe de <strong>minimisation</strong> des données. Aucune <strong>donnée de carte bancaire</strong>
          n'est stockée chez Comptalyze (les paiements sont traités par Stripe, certifié PCI-DSS).
        </p>
        <p className="mb-3">
          Mesures de sécurité mises en œuvre :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Chiffrement des données en transit (TLS/SSL) et au repos (AES-256)</li>
          <li>Authentification sécurisée avec hashage des mots de passe (bcrypt)</li>
          <li>Accès restreint aux données selon le principe du moindre privilège</li>
          <li>Surveillance continue et détection des intrusions</li>
          <li>Journaux d'accès conservés pour audit de sécurité</li>
        </ul>
      </section>

      <section>
        <h2>Sauvegardes et continuité</h2>
        <p>
          Pour assurer la disponibilité et l'intégrité de vos données, des <strong>sauvegardes automatisées</strong> 
          sont effectuées régulièrement :
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Fréquence</strong> : sauvegardes quotidiennes automatiques (minimum)</li>
          <li><strong>Rétention</strong> : conservation des sauvegardes pendant <strong>30 jours</strong></li>
          <li><strong>Localisation</strong> : stockées dans des régions UE distinctes du serveur principal</li>
          <li><strong>Chiffrement</strong> : toutes les sauvegardes sont chiffrées (AES-256)</li>
        </ul>
        <p className="mt-3 text-sm text-gray-400">
          En cas d'incident technique majeur, ces sauvegardes permettent la restauration de vos données. 
          Supabase assure également une réplication continue pour une haute disponibilité.
        </p>
      </section>

      <section>
        <h2>Transferts hors UE et garanties</h2>
        <p className="mb-3">
          <strong>Hébergement principal</strong> : Vos données sont hébergées dans des <strong>régions de l'Union Européenne</strong> 
          chez Vercel (infrastructure AWS/Google Cloud en Europe) et Supabase (PostgreSQL en Europe).
        </p>
        <p className="mb-3">
          Certains sous-traitants ayant leur siège social hors UE (notamment Vercel, Stripe, OpenAI, Resend) peuvent impliquer 
          des transferts de données. Ces transferts sont <strong>strictement encadrés</strong> par :
        </p>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>
            <strong>Clauses Contractuelles Types (SCC)</strong> de la Commission Européenne – mécanisme validé par le RGPD 
            pour les transferts internationaux
          </li>
          <li>
            <strong>Data Processing Agreements (DPA)</strong> signés avec chaque sous-traitant, garantissant le respect 
            du RGPD et de vos droits
          </li>
          <li>
            <strong>Certifications de sécurité</strong> : ISO 27001, SOC 2 Type II, et conformité aux standards européens
          </li>
        </ul>
        <p className="text-sm text-gray-400">
          Conformément à l'arrêt &quot;Schrems II&quot; de la CJUE, nous veillons à ce que chaque transfert soit accompagné 
          de garanties appropriées et que les droits des personnes concernées soient respectés. Les liens vers les DPA et 
          politiques de confidentialité de nos sous-traitants sont fournis dans la section &quot;Sous-traitants&quot; ci-dessus.
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


