export const rediTheme = {
  colors: {
    primary: '#6320ee',
    secondary: '#1c77c3',
    accent: '#39ff14',
    accent2: '#ff3864',
    accent3: '#00fff5',
    background: '#121212',
    surface: '#1e1e1e',
    gridLine: 'rgba(57, 255, 20, 0.15)',
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    border: '#39ff14',
    success: '#00ff9d',
    error: '#ff3864',
    neon: {
      pink: '#ff3864',
      blue: '#00fff5',
      purple: '#9d00ff',
      green: '#39ff14',
      yellow: '#ffdf00',
    },
    gradient: {
      horizon: 'linear-gradient(0deg, #ff3864 0%, #6320ee 60%, #1e1e1e 100%)',
      neonGrid: 'repeating-linear-gradient(90deg, rgba(57, 255, 20, 0.15), rgba(57, 255, 20, 0.15) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, rgba(57, 255, 20, 0.15), rgba(57, 255, 20, 0.15) 1px, transparent 1px, transparent 80px)',
      sunsetText: 'linear-gradient(90deg, #ff3864, #6320ee, #00fff5)',
      cyberpunkBtn: 'linear-gradient(90deg, #9d00ff, #6320ee)',
    }
  },
  fonts: {
    heading: 'Orbitron, ui-sans-serif, system-ui, sans-serif',
    body: 'ui-sans-serif, system-ui, sans-serif',
    code: 'ui-monospace, monospace',
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
  },
  effects: {
    glow: {
      pink: '0 0 10px #ff3864, 0 0 20px #ff3864, 0 0 30px #ff3864',
      blue: '0 0 10px #00fff5, 0 0 20px #00fff5, 0 0 30px #00fff5',
      green: '0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14',
      purple: '0 0 10px #9d00ff, 0 0 20px #9d00ff, 0 0 30px #9d00ff',
    },
    shadows: {
      neon: '0 0 10px rgba(57, 255, 20, 0.5)',
      subtle: '0 4px 6px rgba(0, 0, 0, 0.3)',
      card: '0 10px 20px rgba(0, 0, 0, 0.5)',
    },
    glitch: {
      keyframes: `
        0% {
          transform: translate(0);
        }
        20% {
          transform: translate(-2px, 2px);
        }
        40% {
          transform: translate(-2px, -2px);
        }
        60% {
          transform: translate(2px, 2px);
        }
        80% {
          transform: translate(2px, -2px);
        }
        100% {
          transform: translate(0);
        }
      `,
      animation: 'glitch 200ms ease-in-out infinite',
    }
  },
  animations: {
    scanline: {
      keyframes: `
        from {
          transform: translateY(-100%);
        }
        to {
          transform: translateY(100%);
        }
      `,
      animation: 'scanline 3s linear infinite',
    },
    pulse: {
      keyframes: `
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      `,
      animation: 'pulse 2s ease-in-out infinite',
    },
    flicker: {
      keyframes: `
        0% {
          opacity: 1;
        }
        2% {
          opacity: 0.4;
        }
        4% {
          opacity: 1;
        }
        8% {
          opacity: 0.8;
        }
        70% {
          opacity: 0.8;
        }
        80% {
          opacity: 1;
        }
        84% {
          opacity: 0.6;
        }
        87% {
          opacity: 1;
        }
        91% {
          opacity: 0.2;
        }
        92% {
          opacity: 0.8;
        }
        100% {
          opacity: 1;
        }
      `,
      animation: 'flicker 4s linear infinite',
    }
  }
};