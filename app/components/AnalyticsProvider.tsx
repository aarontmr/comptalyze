"use client";

import { useEffect, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

function AnalyticsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
  const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  // Persist UTM parameters to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(searchParams.toString());
    const utm_source = params.get("utm_source");
    const utm_medium = params.get("utm_medium");
    const utm_campaign = params.get("utm_campaign");
    const utm_content = params.get("utm_content");
    const utm_term = params.get("utm_term");
    const gclid = params.get("gclid");
    const fbclid = params.get("fbclid");

    // Store attribution data in localStorage
    if (utm_source) localStorage.setItem("utm_source", utm_source);
    if (utm_medium) localStorage.setItem("utm_medium", utm_medium);
    if (utm_campaign) localStorage.setItem("utm_campaign", utm_campaign);
    if (utm_content) localStorage.setItem("utm_content", utm_content);
    if (utm_term) localStorage.setItem("utm_term", utm_term);
    if (gclid) localStorage.setItem("gclid", gclid);
    if (fbclid) localStorage.setItem("fbclid", fbclid);

    // Store landing page
    const landing_slug = pathname;
    if (!localStorage.getItem("landing_slug")) {
      localStorage.setItem("landing_slug", landing_slug);
    }

    // Store referrer
    if (document.referrer && !localStorage.getItem("referrer")) {
      localStorage.setItem("referrer", document.referrer);
    }
  }, [searchParams, pathname]);

  // Track page views
  useEffect(() => {
    if (typeof window === "undefined") return;

    // GA4 page view
    if (GA4_ID && (window as any).gtag) {
      (window as any).gtag("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
      });
    }

    // GTM page view
    if (GTM_ID && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "pageview",
        page: pathname,
      });
    }

    // Meta Pixel page view
    if (META_PIXEL_ID && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname, GA4_ID, GTM_ID, META_PIXEL_ID]);

  return null;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
  const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracking />
      </Suspense>

      {/* Google Tag Manager */}
      {GTM_ID && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 (GA4) - avec Consent Mode v2 */}
      {GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                // Consent Mode v2 - Default to denied
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                
                gtag('consent', 'default', {
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                  'analytics_storage': 'denied',
                  'wait_for_update': 500
                });

                gtag('js', new Date());
                gtag('config', '${GA4_ID}', {
                  page_path: window.location.pathname,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `,
            }}
          />
        </>
      )}

      {/* Meta Pixel (Facebook) */}
      {META_PIXEL_ID && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {children}
    </>
  );
}
