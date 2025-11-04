interface BadgePlanProps {
  plan: 'free' | 'pro' | 'premium';
  className?: string;
}

export default function BadgePlan({ plan, className = '' }: BadgePlanProps) {
  const labels = {
    free: 'Gratuit',
    pro: 'Pro',
    premium: 'Premium',
  };

  const getStyles = () => {
    if (plan === 'premium') {
      return {
        background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
        border: '1px solid rgba(0, 208, 132, 0.3)',
      };
    }
    if (plan === 'pro') {
      return {
        background: 'linear-gradient(135deg, #2E6CF6 0%, #00D084 100%)',
        border: '1px solid rgba(46, 108, 246, 0.3)',
      };
    }
    return {
      backgroundColor: '#6b7280',
      border: '1px solid #4b5563',
    };
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold text-white ${className}`}
      style={getStyles()}
    >
      {labels[plan]}
    </span>
  );
}

