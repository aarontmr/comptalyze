import type { Metadata } from "next";
import LegalLayout from "../LegalLayout";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente (CGV) – Comptalyze",
  description:
    "CGV du SaaS Comptalyze : objet, compte, plans (Gratuit/Pro/Premium), prix, paiement Stripe, rétractation, résiliation, responsabilités, droit applicable.",
  alternates: {
    canonical: "https://comptalyze.com/legal/cgv",
  },
};

export default function Page() {
  return (
    <LegalLayout
      title="Conditions Générales de Vente (CGV)"
      description="Les règles contractuelles applicables à l’utilisation du service Comptalyze (SaaS)."
      breadcrumbLabel="CGV"
      canonicalPath="/legal/cgv"
    >
      <section>
        <h2>Objet du contrat</h2>
        <p>
          Comptalyze est un service SaaS d’<strong>estimation et de suivi des cotisations URSSAF</strong> destiné aux
          micro‑entrepreneurs. Les informations fournies sont <strong>indicatives</strong> et <strong>n’ont pas de valeur légale</strong>.
          L’utilisateur demeure seul responsable de ses <strong>démarches et déclarations officielles</strong>.
        </p>
      </section>

      <section>
        <h2>Création de compte et usage</h2>
        <p>
          L’utilisateur s’engage à fournir des <strong>informations exactes</strong> lors de la création du compte et à
          maintenir ces informations à jour. Le compte est <strong>personnel</strong> et ne peut être partagé.
        </p>
      </section>

      <section>
        <h2>Plans et fonctionnalités</h2>
        <p>
          Comptalyze propose trois offres : <strong>Gratuit (0 €)</strong>, <strong>Pro (5,90 € / mois)</strong>,
          <strong> Premium (9,90 € / mois)</strong>.
        </p>
        <ul>
          <li><strong>Gratuit</strong> : accès de base, simulations simples.</li>
          <li><strong>Pro</strong> : simulations avancées, export, assistance prioritaire.</li>
          <li><strong>Premium</strong> : fonctionnalités Pro + historique détaillé et rapports.</li>
        </ul>
      </section>

      <section>
        <h2>Prix et facturation</h2>
        <p>
          Les prix sont indiqués <strong>TTC</strong> et peuvent être révisés. L’<strong>abonnement mensuel</strong>
          est reconduit automatiquement via <strong>Stripe</strong> jusqu’à résiliation.
        </p>
      </section>

      <section>
        <h2>Paiement</h2>
        <p>
          Le paiement s’effectue par <strong>carte bancaire</strong> via Stripe. Comptalyze ne <strong>stocke pas</strong>
          vos données bancaires.
        </p>
      </section>

      <section>
        <h2>Droit de rétractation</h2>
        <p>
          Conformément à l’<strong>article L221‑28 du Code de la consommation</strong>, le droit de rétractation ne
          s’applique pas aux contenus numériques fournis intégralement avant la fin du délai de rétractation.
          Sans préjudice, Comptalyze applique une <strong>politique de remboursement de bonne foi</strong> en cas
          d’<strong>incident technique avéré</strong> empêchant l’accès au service.
        </p>
      </section>

      <section>
        <h2>Durée et résiliation</h2>
        <p>
          L’abonnement est conclu pour une <strong>durée mensuelle</strong> avec reconduction tacite. L’utilisateur peut
          résilier <strong>à tout moment</strong> ; la résiliation prend effet <strong>à la fin de la période payée</strong>.
          La résiliation entraîne la <strong>perte d’accès</strong> aux fonctionnalités payantes.
        </p>
      </section>

      <section>
        <h2>Responsabilités et garanties</h2>
        <p>
          Le service est fourni <strong>« en l’état »</strong>, sans garantie d’exactitude ou d’adéquation à un besoin
          particulier. Comptalyze ne saurait être tenue responsable de conséquences liées à l’utilisation des
          estimations. L’utilisateur reste responsable de ses obligations légales et déclaratives.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Les contenus, interfaces, code, marque et logos de Comptalyze sont protégés. Toute utilisation non
          autorisée est interdite.
        </p>
      </section>

      <section>
        <h2>Données personnelles</h2>
        <p>
          Les traitements de données sont décrits dans la <a href="/legal/politique-de-confidentialite">Politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>Droit applicable et juridiction</h2>
        <p>
          Les présentes CGV sont régies par le <strong>droit français</strong>. Tout litige relèvera des <strong>tribunaux de Paris</strong>.
        </p>
      </section>

      <section>
        <h2>Service client</h2>
        <p>
          Pour toute demande, écrivez à <a href="mailto:support@comptalyze.com">support@comptalyze.com</a>.
          Délai moyen de réponse : <strong>48 h</strong>.
        </p>
      </section>
    </LegalLayout>
  );
}


