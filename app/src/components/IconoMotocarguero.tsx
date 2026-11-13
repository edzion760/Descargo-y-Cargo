import type { SVGProps } from 'react';

// Motocarguero (motocarro de carga de tres ruedas: cajón atrás, moto adelante).
// Lucide no trae este vehículo; mismo trazo que sus íconos para que combine.
export default function IconoMotocarguero({ strokeWidth = 2, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="1.5" y="6" width="9.5" height="8" rx="1" />
      <path d="M11 14h4.5l2-6.5h2.5" />
      <path d="M12.5 10.5h3" />
      <path d="M17.5 7.5 19 16" />
      <circle cx="5.5" cy="17" r="2" />
      <circle cx="19" cy="17.5" r="2" />
    </svg>
  );
}
