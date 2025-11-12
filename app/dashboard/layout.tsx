import { Session } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabaseServer';
import DashboardLayoutClient from './DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <DashboardLayoutClient initialSession={session}>
      {children}
    </DashboardLayoutClient>
  );
}

