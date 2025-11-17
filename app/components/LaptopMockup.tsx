'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LaptopMockupProps {
  screenshotSrc: string;
  alt?: string;
  className?: string;
}

export default function LaptopMockup({ 
  screenshotSrc, 
  alt = "Dashboard Comptalyze",
  className = "" 
}: LaptopMockupProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`laptop-mockup ${className}`}>
      <div className="laptop-screen">
        {!imageError ? (
          <Image
            src={screenshotSrc}
            alt={alt}
            width={1920}
            height={1080}
            className="dashboard-screenshot"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className="screenshot-placeholder">
            <p className="text-gray-400">Screenshot non disponible</p>
            <p className="text-sm text-gray-500 mt-2">
              Exécutez: npm run screenshot:dashboard
            </p>
          </div>
        )}
      </div>
      <div className="laptop-base"></div>
      
      <style jsx>{`
        .laptop-mockup {
          position: relative;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          perspective: 1000px;
        }

        .laptop-screen {
          position: relative;
          padding: 2.5% 2.5% 0 2.5%;
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
          border-radius: 12px 12px 0 0;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          transform: rotateX(5deg);
          transform-style: preserve-3d;
        }

        .dashboard-screenshot {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .screenshot-placeholder {
          width: 100%;
          aspect-ratio: 16/9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0e0f12;
          border-radius: 8px;
          border: 2px dashed #2d3441;
        }

        .laptop-base {
          height: 20px;
          background: linear-gradient(to bottom, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
          border-radius: 0 0 8px 8px;
          margin: 0 8%;
          box-shadow: 
            0 5px 20px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          position: relative;
        }

        .laptop-base::after {
          content: '';
          display: block;
          width: 200px;
          height: 4px;
          background: #0a0a0a;
          margin: 8px auto;
          border-radius: 2px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        /* Animation au survol */
        .laptop-mockup:hover .laptop-screen {
          transform: rotateX(2deg) translateY(-5px);
          transition: transform 0.3s ease;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .laptop-mockup {
            max-width: 100%;
          }
          
          .laptop-screen {
            padding: 3% 3% 0 3%;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}



