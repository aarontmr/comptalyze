interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionTitle({ title, subtitle, className = '' }: SectionTitleProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
}

