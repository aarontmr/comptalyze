"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Shield, Lock, History, ToggleLeft, ToggleRight, Copy, CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { QRCodeSVG } from "qrcode.react";

interface SecuritySettings {
  two_factor_enabled: boolean;
  login_history: Array<{
    date: string;
    ip: string;
    device?: string;
  }>;
}

export default function SecuritePage() {
  const [user, setUser] = useState<User | null>(null);
  const [security, setSecurity] = useState<SecuritySettings>({
    two_factor_enabled: false,
    login_history: [],
  });
  const [loading, setLoading] = useState(true);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [manualEntryKey, setManualEntryKey] = useState<string>("");
  const [generatingSecret, setGeneratingSecret] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadSecurityData(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const loadSecurityData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_security")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is OK
        console.error("Error loading security data:", error);
      } else if (data) {
        setSecurity({
          two_factor_enabled: data.two_factor_enabled || false,
          login_history: (data.login_history as any) || [],
        });
        // Charger les codes de secours si la 2FA est activée
        if (data.two_factor_enabled && data.backup_codes) {
          setBackupCodes((data.backup_codes as string[]) || []);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!user) return;

    if (!security.two_factor_enabled) {
      // Activer 2FA - Générer le secret et le QR code
      setGeneratingSecret(true);
      setShow2FASetup(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          alert("Vous devez être connecté");
          setShow2FASetup(false);
          return;
        }

        const response = await fetch("/api/2fa/generate-secret", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || "Erreur lors de la génération du secret");
          setShow2FASetup(false);
          return;
        }

        const data = await response.json();
        setQrCodeUrl(data.qrCodeUrl);
        setManualEntryKey(data.manualEntryKey);
      } catch (error) {
        console.error("Error generating 2FA secret:", error);
        alert("Erreur lors de la génération du secret 2FA");
        setShow2FASetup(false);
      } finally {
        setGeneratingSecret(false);
      }
    } else {
      // Désactiver 2FA
      if (confirm("Êtes-vous sûr de vouloir désactiver l'authentification à deux facteurs ?")) {
        try {
          await supabase
            .from("user_security")
            .update({ two_factor_enabled: false, two_factor_secret: null, backup_codes: null })
            .eq("user_id", user.id);

          setSecurity((prev) => ({ ...prev, two_factor_enabled: false }));
          setShow2FASetup(false);
          setQrCodeUrl("");
          setManualEntryKey("");
        } catch (error) {
          console.error("Error disabling 2FA:", error);
        }
      }
    }
  };

  const handleConfirm2FA = async () => {
    if (!user || !twoFactorCode || twoFactorCode.length !== 6) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert("Vous devez être connecté");
        return;
      }

      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: twoFactorCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Code invalide");
        return;
      }

      const data = await response.json();
      setBackupCodes(data.backupCodes || []);
      setSecurity((prev) => ({ ...prev, two_factor_enabled: true }));
      setShow2FASetup(false);
      setTwoFactorCode("");
      setQrCodeUrl("");
      setManualEntryKey("");
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      alert("Erreur lors de la vérification du code");
    }
  };

  const handleCopyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Sécurité" }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sécurité du compte</h1>
        <p className="text-gray-400">Gérez les paramètres de sécurité de votre compte</p>
      </div>

      {/* Authentification à deux facteurs */}
      <div
        className="rounded-xl p-6 border mb-6"
        style={{
          backgroundColor: "#14161b",
          borderColor: "#1f232b",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6" style={{ color: "#00D084" }} />
              <h3 className="text-xl font-semibold text-white">Authentification à deux facteurs (2FA)</h3>
              <button onClick={handleToggle2FA}>
                {security.two_factor_enabled ? (
                  <ToggleRight className="w-6 h-6" style={{ color: "#00D084" }} />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-500" />
                )}
              </button>
            </div>
            <p className="text-gray-400">
              {security.two_factor_enabled
                ? "L'authentification à deux facteurs est activée. Votre compte est mieux protégé."
                : "Activez l'authentification à deux facteurs pour renforcer la sécurité de votre compte."}
            </p>
          </div>
        </div>

        {/* Setup 2FA */}
        {show2FASetup && !security.two_factor_enabled && (
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "#0e0f12" }}>
            <h4 className="text-white font-medium mb-3">Configuration de la 2FA</h4>
            <div className="space-y-4">
              {generatingSecret ? (
                <div className="text-center py-8">
                  <div className="text-gray-400">Génération du secret 2FA...</div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400">
                      1. Scannez le QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
                    </p>
                    
                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div className="flex justify-center py-4">
                        <div 
                          className="p-4 rounded-lg"
                          style={{ 
                            backgroundColor: "#ffffff",
                            display: "inline-block"
                          }}
                        >
                          <QRCodeSVG
                            value={qrCodeUrl}
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                      </div>
                    )}

                    {/* Clé manuelle */}
                    {manualEntryKey && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">
                          Ou entrez manuellement cette clé :
                        </p>
                        <div className="flex items-center gap-2">
                          <code 
                            className="flex-1 px-3 py-2 rounded-lg text-sm font-mono text-white text-center"
                            style={{ backgroundColor: "#14161b", border: "1px solid #2d3441" }}
                          >
                            {manualEntryKey}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(manualEntryKey);
                              alert("Clé copiée !");
                            }}
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{ 
                              backgroundColor: "#2d3441",
                              color: "#9ca3af"
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-400 mt-4">
                      2. Entrez le code à 6 chiffres généré par l'application
                    </p>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-2 rounded-lg text-white text-center text-2xl tracking-widest"
                      style={{ backgroundColor: "#14161b", border: "1px solid #2d3441" }}
                    />
                    <button
                      onClick={handleConfirm2FA}
                      disabled={twoFactorCode.length !== 6}
                      className="w-full px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                      style={{
                        background: twoFactorCode.length === 6
                          ? "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)"
                          : "#6b7280",
                      }}
                    >
                      Activer la 2FA
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Codes de secours - affichés après activation réussie */}
        {security.two_factor_enabled && backupCodes.length > 0 && (
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.3)" }}>
            <p className="text-sm font-semibold text-white mb-2">✅ Codes de secours (à sauvegarder) :</p>
            <p className="text-xs text-gray-400 mb-3">
              Conservez ces codes en lieu sûr. Vous pourrez les utiliser si vous perdez l'accès à votre application d'authentification.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ backgroundColor: "#14161b" }}
                >
                  <code className="text-white font-mono text-sm">{code}</code>
                  <button
                    onClick={() => handleCopyBackupCode(code)}
                    className="p-1 rounded hover:bg-gray-800 transition-colors"
                  >
                    {copiedCode === code ? (
                      <CheckCircle2 className="w-4 h-4" style={{ color: "#00D084" }} />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Historique des connexions */}
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: "#14161b",
          borderColor: "#1f232b",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <History className="w-6 h-6" style={{ color: "#2E6CF6" }} />
          <h3 className="text-xl font-semibold text-white">Historique des connexions</h3>
        </div>

        {security.login_history.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400">Aucune connexion enregistrée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {security.login_history.slice(0, 10).map((login, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: "#0e0f12" }}
              >
                <div>
                  <p className="text-white font-medium">
                    {new Date(login.date).toLocaleString("fr-FR")}
                  </p>
                  <p className="text-sm text-gray-400">{login.ip}</p>
                  {login.device && (
                    <p className="text-xs text-gray-500">{login.device}</p>
                  )}
                </div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00D084" }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


