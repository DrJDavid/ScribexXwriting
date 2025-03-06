export const owlTheme = {
  colors: {
    primary: '#3cb371', // Medium sea green
    secondary: '#8b4513', // Saddle brown
    accent: '#ffd700', // Gold
    accent2: '#64dfdf', // Teal accent
    accent3: '#ff7e67', // Coral
    background: '#1a2f23', // Dark forest green
    surface: '#2d4438', // Medium forest green
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    border: '#64dfdf',
    success: '#72efdd',
    error: '#ff5a5f',
    natural: {
      leaf: '#3cb371',
      wood: '#8b4513',
      water: '#64dfdf',
      flower: '#ff7e67',
      earth: '#684e32',
    },
    gradient: {
      forest: 'linear-gradient(to bottom, #1a2f23, #2d4438)',
      meadow: 'linear-gradient(to right, #3cb371, #64dfdf)',
      sunrise: 'linear-gradient(to right, #ff7e67, #ffd700)',
      leafPattern: `radial-gradient(circle at 10% 20%, rgba(60, 179, 113, 0.05) 0%, transparent 20%),
                   radial-gradient(circle at 30% 70%, rgba(60, 179, 113, 0.05) 0%, transparent 20%),
                   radial-gradient(circle at 55% 35%, rgba(60, 179, 113, 0.05) 0%, transparent 20%),
                   radial-gradient(circle at 70% 80%, rgba(60, 179, 113, 0.05) 0%, transparent 20%),
                   radial-gradient(circle at 90% 10%, rgba(60, 179, 113, 0.05) 0%, transparent 20%)`
    }
  },
  fonts: {
    heading: 'ui-sans-serif, system-ui, sans-serif',
    body: 'ui-sans-serif, system-ui, sans-serif',
    display: 'ui-serif, Georgia, serif',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
    natural: '40% 60% 60% 40% / 60% 30% 70% 40%', // Organic shape
  },
  effects: {
    shadows: {
      subtle: '0 4px 6px rgba(0, 0, 0, 0.1)',
      leaf: '0 8px 16px rgba(60, 179, 113, 0.2)',
      card: '0 10px 25px rgba(0, 0, 0, 0.2)',
    },
    glow: {
      leaf: '0 0 10px rgba(60, 179, 113, 0.5)',
      water: '0 0 15px rgba(100, 223, 223, 0.6)',
      gold: '0 0 20px rgba(255, 215, 0, 0.5)',
    }
  },
  animations: {
    growth: {
      keyframes: `
        from {
          transform: scale(0.95);
          opacity: 0.5;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      `,
      animation: 'growth 2s ease-out',
    },
    floating: {
      keyframes: `
        0% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
        100% {
          transform: translateY(0px);
        }
      `,
      animation: 'floating 4s ease-in-out infinite',
    },
    leafSway: {
      keyframes: `
        0% {
          transform: rotate(0deg);
        }
        25% {
          transform: rotate(3deg);
        }
        75% {
          transform: rotate(-3deg);
        }
        100% {
          transform: rotate(0deg);
        }
      `,
      animation: 'leafSway 5s ease-in-out infinite',
    },
    shimmer: {
      keyframes: `
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      `,
      animation: 'shimmer 3s ease-in-out infinite',
    }
  }
};