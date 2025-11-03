import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  // La vérification d'authentification se fait uniquement côté client
  // car Supabase stocke les sessions dans localStorage, pas dans les cookies HTTP
  return <DashboardClient user={null} />;
}
