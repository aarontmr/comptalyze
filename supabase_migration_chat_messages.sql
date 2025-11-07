-- ============================================
-- Table chat_messages pour l'historique du chatbot
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(user_id, created_at DESC);

-- Activer RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can select their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat_messages" ON public.chat_messages;

-- Politiques RLS pour chat_messages
CREATE POLICY "Users can select their own chat_messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat_messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat_messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour nettoyer les anciens messages (garder seulement les 100 derniers par utilisateur)
CREATE OR REPLACE FUNCTION clean_old_chat_messages()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.chat_messages
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM public.chat_messages
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour nettoyer automatiquement
DROP TRIGGER IF EXISTS trigger_clean_old_chat_messages ON public.chat_messages;
CREATE TRIGGER trigger_clean_old_chat_messages
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION clean_old_chat_messages();

-- Commentaires pour documentation
COMMENT ON TABLE public.chat_messages IS 'Historique des conversations du chatbot pour les utilisateurs Premium';
COMMENT ON COLUMN public.chat_messages.role IS 'Rôle du message: user ou assistant';
COMMENT ON COLUMN public.chat_messages.content IS 'Contenu textuel du message';
COMMENT ON COLUMN public.chat_messages.metadata IS 'Métadonnées additionnelles (plan, tokens utilisés, etc.)';


