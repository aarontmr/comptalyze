'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { trackEvent, getStoredUTMParams, captureUTMParams } from '@/lib/analytics';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.png';
import { Mail, Lock, ArrowRight, Shield, UserPlus, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const recaptchaRef = useRef<any>(null);
  const router = useRouter();

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return Math.min(strength, 4); // 0-4
  };

  const passwordStrength = calculatePasswordStrength(password);
  
  const getPasswordStrengthInfo = () => {
    if (password.length === 0) return { text: '', color: '', width: '0%' };
    if (passwordStrength <= 1) return { text: 'Faible', color: '#ef4444', width: '25%' };
    if (passwordStrength === 2) return { text: 'Moyen', color: '#f59e0b', width: '50%' };
    if (passwordStrength === 3) return { text: 'Bon', color: '#10b981', width: '75%' };
    return { text: 'Excellent', color: '#00D084', width: '100%' };
  };

  const passwordStrengthInfo = getPasswordStrengthInfo();

  const passwordRequirements = [
    { text: 'Au moins 8 caractères', met: password.length >= 8 },
    { text: 'Une majuscule et une minuscule', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { text: 'Un chiffre', met: /\d/.test(password) },
    { text: 'Un caractère spécial', met: /[^a-zA-Z\d]/.test(password) },
  ];

  // Capturer les paramètres UTM au chargement
  useEffect(() => {
    captureUTMParams();
  }, []);

  // Charger reCAPTCHA
  useEffect(() => {
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!recaptchaSiteKey) {
      console.warn('reCAPTCHA site key not found');
      return;
    }

    // Charger le script reCAPTCHA
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setRecaptchaLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  // Écouter les changements d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setSuccessMessage('Inscription réussie...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 500);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleSignup = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Utiliser NEXT_PUBLIC_BASE_URL pour éviter d'afficher l'URL Supabase
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Erreur de connexion Google:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion avec Google.');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setShowVerificationMessage(false);

    // Validations côté client
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (!acceptTerms) {
      setError('Vous devez accepter les CGV et la Politique de confidentialité.');
      return;
    }

    setLoading(true);

    // Track signup started
    await trackEvent('signup_started', { email });

    try {
      // Vérifier le rate-limiting via l'API
      const rateLimitCheck = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, acceptTerms }),
      });

      if (rateLimitCheck.status === 429) {
        const data = await rateLimitCheck.json();
        setError(
          `⏱️ ${data.error || 'Trop de tentatives d\'inscription.'} Veuillez patienter.`
        );
        setLoading(false);
        return;
      }

      if (!rateLimitCheck.ok) {
        const data = await rateLimitCheck.json();
        setError(data.error || 'Erreur de validation');
        setLoading(false);
        return;
      }
      // Obtenir le token reCAPTCHA
      let recaptchaToken = null;
      const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      
      if (recaptchaSiteKey && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, { action: 'signup' });
        } catch (recaptchaError) {
          console.error('reCAPTCHA error:', recaptchaError);
          setError('Erreur de vérification reCAPTCHA. Veuillez réessayer.');
          setLoading(false);
          return;
        }
      }

      // Vérifier le token reCAPTCHA côté serveur
      if (recaptchaToken) {
        const verifyResponse = await fetch('/api/verify-recaptcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: recaptchaToken }),
        });

        const verifyData = await verifyResponse.json();
        
        if (!verifyResponse.ok || !verifyData.success) {
          setError('Vérification de sécurité échouée. Veuillez réessayer.');
          setLoading(false);
          return;
        }
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${baseUrl}/dashboard`,
          data: {
            accepted_terms: true,
            accepted_terms_at: new Date().toISOString(),
          }
        },
      });

      if (error) throw error;

      // Si l'email doit être vérifié, Supabase envoie automatiquement l'email avec le template personnalisé
      if (data.user) {
        try {
          const emailResponse = await fetch('/api/auth/send-verification-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: data.user.id, email }),
          });
          
          if (!emailResponse.ok) {
            const emailError = await emailResponse.json().catch(() => ({ error: 'Erreur inconnue' }));
            console.error('❌ Erreur envoi email de vérification:', emailError);
            // Ne pas bloquer le signup, mais logger l'erreur
          } else {
            console.log('✅ Email de vérification envoyé avec succès');
          }
        } catch (err) {
          console.error('❌ Erreur réseau lors de l\'envoi email de vérification:', err);
          // Ne pas bloquer le signup, mais logger l'erreur
        }
      }

      if (data.user && !data.session) {
        setShowVerificationMessage(true);
        setSuccessMessage('Un email de vérification vient de vous être envoyé. Pensez à vérifier vos spams !');
        
        await trackEvent('signup_completed', { 
          email,
          verification_required: true 
        });
        
        // Tracker la conversion Google Ads si applicable
        const utmParams = getStoredUTMParams();
        if (utmParams.utm_source === 'google' || utmParams.utm_medium === 'cpc') {
          fetch('/api/track-conversion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              eventType: 'free_signup',
              utmParams,
            }),
          }).catch((err) => console.error('Erreur tracking Google Ads (non bloquant):', err));
        }
        
        // Envoyer l'événement CompleteRegistration à Facebook (non bloquant)
        fetch('/api/facebook-events/complete-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, userId: data.user.id }),
        }).catch((err) => console.error('Erreur Facebook (non bloquant):', err));
      } else if (data.session) {
        setShowVerificationMessage(true);
        setSuccessMessage('Inscription réussie. Un email de confirmation vous a été envoyé.');
        
        await trackEvent('signup_completed', {
          email,
          verification_required: false 
        });
        
        // Tracker la conversion Google Ads si applicable
        const utmParams2 = getStoredUTMParams();
        if ((utmParams2.utm_source === 'google' || utmParams2.utm_medium === 'cpc') && data.user?.id) {
          fetch('/api/track-conversion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              eventType: 'free_signup',
              utmParams: utmParams2,
            }),
          }).catch((err) => console.error('Erreur tracking Google Ads (non bloquant):', err));
        }
        
        // Envoyer l'événement CompleteRegistration à Facebook (non bloquant)
        if (data.user?.id) {
          fetch('/api/facebook-events/complete-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, userId: data.user.id }),
          }).catch((err) => console.error('Erreur Facebook (non bloquant):', err));
        }
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ 
        backgroundColor: '#0e0f12',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      {/* Background gradient accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(closest-side, #00D084, rgba(0,0,0,0))" }}
        />
        <div 
          className="absolute top-1/3 -right-24 h-[500px] w-[500px] rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(closest-side, #2E6CF6, rgba(0,0,0,0))" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="Comptalyze"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div 
          className="rounded-2xl p-8 shadow-2xl relative"
          style={{ 
            backgroundColor: '#14161b',
            border: '1px solid rgba(46, 108, 246, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Gradient accent line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{
              background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
            }}
          />

          <h1 className="text-2xl font-semibold text-white mb-2 text-center">
            Créer un compte
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Commencez à gérer votre micro-entreprise facilement
          </p>

          {error && (
            <div 
              className="mb-4 p-4 rounded-lg text-sm text-red-300 flex items-start gap-2"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.3)' 
              }}
            >
              <span className="text-red-400">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div 
              className="mb-4 p-4 rounded-lg text-sm text-green-300 flex items-start gap-2"
              style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.3)' 
              }}
            >
              <span className="text-green-400">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {showVerificationMessage && (
            <div 
              className="mb-4 p-4 rounded-lg text-sm text-blue-300"
              style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.3)' 
              }}
            >
              <p className="mb-2">
                <strong>📧 Vérifiez votre boîte email</strong>
              </p>
              <p className="text-xs text-gray-400">
                Nous avons envoyé un lien de vérification à <strong>{email}</strong>. Cliquez sur le lien dans l'email pour activer votre compte.
              </p>
            </div>
          )}

          {!showVerificationMessage && (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" style={{ zIndex: 1 }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    style={{ 
                      backgroundColor: '#0e0f12',
                      border: '1px solid #2d3441',
                      fontSize: '16px',
                      WebkitAppearance: 'none',
                      position: 'relative',
                      zIndex: 0,
                    }}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" style={{ zIndex: 1 }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    style={{ 
                      backgroundColor: '#0e0f12',
                      border: '1px solid #2d3441',
                      fontSize: '16px',
                      WebkitAppearance: 'none',
                      position: 'relative',
                      zIndex: 0,
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    style={{ zIndex: 2 }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Indicateur de force du mot de passe */}
                {password.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Force du mot de passe :</span>
                      <span className="text-xs font-medium" style={{ color: passwordStrengthInfo.color }}>
                        {passwordStrengthInfo.text}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-300 rounded-full"
                        style={{ 
                          width: passwordStrengthInfo.width,
                          backgroundColor: passwordStrengthInfo.color
                        }}
                      />
                    </div>
                    
                    {/* Critères du mot de passe */}
                    <div className="mt-3 space-y-1.5">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#00D084' }} />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-gray-600" />
                          )}
                          <span className={req.met ? 'text-gray-300' : 'text-gray-500'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Checkbox CGV */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                  className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900 cursor-pointer"
                  style={{
                    backgroundColor: acceptTerms ? '#2E6CF6' : '#0e0f12',
                    borderColor: acceptTerms ? '#2E6CF6' : '#2d3441'
                  }}
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-300 cursor-pointer">
                  J'accepte les{' '}
                  <Link 
                    href="/legal/cgv" 
                    target="_blank"
                    className="font-medium text-transparent bg-clip-text hover:opacity-80 transition-opacity underline"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)"
                    }}
                  >
                    Conditions Générales de Vente
                  </Link>
                  {' '}et la{' '}
                  <Link 
                    href="/legal/politique-de-confidentialite" 
                    target="_blank"
                    className="font-medium text-transparent bg-clip-text hover:opacity-80 transition-opacity underline"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)"
                    }}
                  >
                    Politique de confidentialité
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.05] hover:brightness-110 hover:shadow-2xl cursor-pointer active:scale-95 disabled:hover:scale-100 disabled:hover:brightness-100 flex items-center justify-center gap-2"
                style={{
                  background: loading 
                    ? '#374151'
                    : 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                  boxShadow: loading 
                    ? 'none'
                    : '0 4px 20px rgba(46, 108, 246, 0.4)'
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Inscription...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>S'inscrire</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {!showVerificationMessage && (
            <>
              {/* Séparateur */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: '1px solid #1f232b' }} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-gray-500" style={{ backgroundColor: '#14161b' }}>ou</span>
                </div>
              </div>

              {/* Bouton Google */}
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                type="button"
                className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] hover:brightness-110 active:scale-95 flex items-center justify-center gap-3"
                style={{
                  backgroundColor: '#0e0f12',
                  border: '1px solid #2d3441',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continuer avec Google</span>
              </button>
            </>
          )}

          <div className="mt-6 pt-6 border-t" style={{ borderColor: '#1f232b' }}>
            <p className="text-center text-sm text-gray-400">
              Déjà un compte ?{' '}
              <Link 
                href="/login" 
                className="font-medium text-transparent bg-clip-text hover:opacity-80 transition-opacity"
                style={{
                  backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)"
                }}
              >
                Se connecter
              </Link>
            </p>
          </div>

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" style={{ color: '#00D084' }} />
            <span>Basé sur les données officielles de l'URSSAF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
