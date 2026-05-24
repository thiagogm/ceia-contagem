interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Cálice Gradient (Ouro Nobre) */}
        <linearGradient id="chaliceGrad" x1="22" y1="18" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="30%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        {/* Vinho/Suco de Uva Gradient (Rubi Sagrado) */}
        <linearGradient id="wineGrad" x1="23.5" y1="19.5" x2="40.5" y2="26.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>
        {/* Pão Gradient (Trigo Dourado) */}
        <linearGradient id="breadGrad" x1="7" y1="35" x2="29" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>

      {/* Pão Partido (Elemento do Corpo) */}
      <path
        d="M12 46C9.2 46 7 43.8 7 41C7 36.3 11.5 33.5 17.5 33.5C23.5 33.5 28 36.3 28 41C28 43.8 25.8 46 23 46H12Z"
        fill="url(#breadGrad)"
      />
      {/* Detalhes de cortes delicados no pão */}
      <path d="M12 37.5L14.5 41.5" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
      <path d="M17.5 36.5L20 40.5" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
      <path d="M22 37.5L24 41" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />

      {/* Cálice Sagrado (Elemento do Sangue) */}
      {/* Copa Principal do Cálice */}
      <path
        d="M22 18C22 28.5 40 28.5 40 18H22Z"
        fill="url(#chaliceGrad)"
      />
      {/* Vinho no interior do cálice */}
      <path
        d="M23.5 19.2C23.5 26.2 38.5 26.2 38.5 19.2H23.5Z"
        fill="url(#wineGrad)"
      />
      {/* Haste do Cálice */}
      <path
        d="M29.5 27V42.5"
        stroke="url(#chaliceGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Base do Cálice */}
      <path
        d="M24.5 43.5C24.5 42 27.5 41.5 31 41.5C34.5 41.5 37.5 42 37.5 43.5C37.5 45.2 34.5 46 31 46C27.5 46 24.5 45.2 24.5 43.5Z"
        fill="url(#chaliceGrad)"
      />
    </svg>
  );
}
