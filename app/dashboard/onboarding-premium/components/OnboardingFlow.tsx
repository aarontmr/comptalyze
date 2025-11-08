'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Step1Welcome from './Step1Welcome';
import Step2IRRegime from './Step2IRRegime';
import Step3ACRE from './Step3ACRE';
import Step4Integrations from './Step4Integrations';
import Step5Recap from './Step5Recap';

interface OnboardingFlowProps {
  user: User;
}

export interface OnboardingData {
  ir_mode: 'versement_liberatoire' | 'bareme' | 'non_soumis' | null;
  ir_rate: number | null;
  has_acre: boolean;
  acre_year: number | null;
  company_creation_date: string | null;
  shopify_connected: boolean;
  stripe_connected: boolean;
}

const TOTAL_STEPS = 5;

export default function OnboardingFlow({ user }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    ir_mode: null,
    ir_rate: null,
    has_acre: false,
    acre_year: null,
    company_creation_date: null,
    shopify_connected: false,
    stripe_connected: false,
  });

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Welcome onNext={nextStep} />;
      case 2:
        return <Step2IRRegime data={onboardingData} onUpdate={updateData} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <Step3ACRE data={onboardingData} onUpdate={updateData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <Step4Integrations data={onboardingData} onUpdate={updateData} onNext={nextStep} onBack={prevStep} userId={user.id} />;
      case 5:
        return <Step5Recap data={onboardingData} userId={user.id} onBack={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0e0f12' }}>
      {/* Background gradients */}
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

      <div className="relative w-full max-w-3xl">
        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[...Array(TOTAL_STEPS)].map((_, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${
                    index + 1 < currentStep
                      ? 'bg-gradient-to-r from-[#00D084] to-[#2E6CF6] text-white'
                      : index + 1 === currentStep
                      ? 'bg-gradient-to-r from-[#00D084] to-[#2E6CF6] text-white ring-4 ring-[#2E6CF6]/30'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {index + 1 < currentStep ? '✓' : index + 1}
                </div>
                {index < TOTAL_STEPS - 1 && (
                  <div 
                    className="flex-1 h-1 mx-2 rounded-full transition-all duration-300"
                    style={{
                      background: index + 1 < currentStep
                        ? 'linear-gradient(90deg, #00D084, #2E6CF6)'
                        : '#1f232b',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-gray-400 px-2">
            <span className={currentStep === 1 ? 'text-white font-medium' : ''}>Bienvenue</span>
            <span className={currentStep === 2 ? 'text-white font-medium' : ''}>Régime IR</span>
            <span className={currentStep === 3 ? 'text-white font-medium' : ''}>ACRE</span>
            <span className={currentStep === 4 ? 'text-white font-medium' : ''}>Intégrations</span>
            <span className={currentStep === 5 ? 'text-white font-medium' : ''}>Récap</span>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

