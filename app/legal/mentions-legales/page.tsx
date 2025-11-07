import type { Metadata } from "next";
import LegalLayout from "../LegalLayout";

export const metadata: Metadata = {
  title: "Mentions légales – Comptalyze",
  description:
    "Informations légales de Comptalyze (éditeur Micro-entreprise Noraa, SIRET 992 132 167 00014). Hébergement Vercel. Contact et responsabilité.",
  alternates: {
    canonical: "https://comptalyze.com/legal/mentions-legales",
  },
};

export default function Page() {
  return (
    <LegalLayout
      title="Mentions légales"
      description="Les informations réglementaires relatives à l’éditeur, l’hébergeur et les conditions d’accès au service Comptalyze."
      breadcrumbLabel="Mentions légales"
      canonicalPath="/legal/mentions-legales"
    >
      <section>
        <h2>Éditeur du site</h2>
        <p>
          Le site <strong>Comptalyze</strong> est édité par <strong>Micro-entreprise Noraa</strong>,
          SIRET <strong>992 132 167 00014</strong>, dont l’adresse est <strong>72 Rue Charlot, 75003 Paris, France</strong>.
          Courriel public : <a href="mailto:contact@comptalyze.com">contact@comptalyze.com</a>.
          Régime de TVA : <strong>Non applicable – art. 293 B du CGI</strong>.
        </p>
      </section>

      <section>
        <h2>Directeur de la publication</h2>
        <p>
          <strong>Aaron Thimeur</strong>.
        </p>
      </section>

      <section>
        <h2>Hébergement et infrastructure</h2>
        <p>
          <strong>Hébergement web :</strong> <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, USA –
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#00D084] hover:text-[#00c077] underline">https://vercel.com</a>.
        </p>
        <p className="mt-2">
          Les données sont hébergées dans des <strong>régions de l'Union Européenne</strong> chez Vercel. 
          Les transferts de données hors UE sont encadrés par les <strong>Clauses Contractuelles Types (SCC)</strong> 
          conformément au RGPD.
        </p>
        <p className="mt-2">
          <strong>Base de données :</strong> Supabase (PostgreSQL hébergé en Europe) – 
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#00D084] hover:text-[#00c077] underline">https://supabase.com/privacy</a>
        </p>
      </section>

      <section>
        <h2>Objet du site</h2>
        <p>
          Comptalyze est un <strong>outil SaaS</strong> d’aide à la gestion pour <strong>micro‑entrepreneurs français</strong>.
          Il propose notamment des <strong>simulations URSSAF</strong> et des fonctionnalités d’estimation et de suivi.
          Le service est <strong>informatif</strong> et n’a pas de valeur légale : il ne remplace ni
          un <strong>expert‑comptable</strong> ni les informations officielles des administrations (URSSAF, impôts, etc.).
        </p>
      </section>

      <section>
        <h2>Accès au service et disponibilité</h2>
        <p>
          Le site est accessible 7j/7 et 24h/24 sous réserve d’éventuelles interruptions pour maintenance ou
          mises à jour. Comptalyze met en œuvre des moyens raisonnables pour assurer la disponibilité du service,
          sans garantie d’absence d’interruption ni de défaut.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L’ensemble des contenus présents sur le site (textes, interfaces, éléments graphiques, logos, marque,
          code et structure logicielle) est protégé par le droit de la propriété intellectuelle. Toute reproduction,
          représentation, modification, distribution, ou exploitation non autorisée est interdite.
        </p>
      </section>

      <section>
        <h2>Liens externes et responsabilité</h2>
        <p>
          Le site peut contenir des liens vers des sites tiers. Comptalyze ne peut être tenue responsable du
          contenu, de l’exactitude ni de la disponibilité de ces sites externes. L’utilisation de ces liens se fait
          sous la seule responsabilité de l’utilisateur.
        </p>
      </section>

      <section>
        <h2>Contact et Délégué à la Protection des Données (DPO)</h2>
        <p>
          Pour toute question générale : <a href="mailto:contact@comptalyze.com" className="text-[#00D084] hover:text-[#00c077] underline">contact@comptalyze.com</a>
        </p>
        <p className="mt-2">
          Pour toute question relative à la protection de vos données personnelles (RGPD) : 
          <a href="mailto:dpo@comptalyze.com" className="text-[#00D084] hover:text-[#00c077] underline"> dpo@comptalyze.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}


