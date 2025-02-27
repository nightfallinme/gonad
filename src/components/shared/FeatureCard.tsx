import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7829F9]/10 to-[#FF3D86]/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-black/50 backdrop-blur border border-[#7829F9]/20 rounded-xl p-6 hover:border-[#7829F9]/40 transition-colors">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
          {title}
        </h3>
        <p className="text-sm text-neutral-400">{description}</p>
      </div>
    </div>
  );
} 