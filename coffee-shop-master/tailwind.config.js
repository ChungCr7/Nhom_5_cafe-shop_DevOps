/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	colors: {
  		transparent: 'transparent',
  		current: 'currentColor',
  		white: '#ffffff',
  		black: '#000000',
  		primary: {
  			'50': '#d7e4dd',
  			'100': '#afc9bb',
  			'200': '#89ae9b',
  			'300': '#62957b',
  			'400': '#3b7b5e',
  			'500': '#006241',
  			'600': '#0a5237',
  			'700': '#0f422d',
  			'800': '#103223',
  			'900': '#0f241a',
  			'950': '#0a1610',
  			DEFAULT: '#006241'
  		},
  		neutral: {
  			'50': '#fafafa',
  			'100': '#f5f5f5',
  			'200': '#e5e5e5',
  			'300': '#d4d4d4',
  			'400': '#a3a3a3',
  			'500': '#737373',
  			'600': '#525252',
  			'700': '#404040',
  			'800': '#262626',
  			'900': '#171717',
  			'950': '#0a0a0a'
  		},
  		gray: {
  			'50': '#f9fafb',
  			'100': '#f3f4f6',
  			'200': '#e5e7eb',
  			'300': '#d1d5db',
  			'400': '#9ca3af',
  			'500': '#6b7280',
  			'600': '#4b5563',
  			'700': '#374151',
  			'800': '#1f2937',
  			'900': '#111827',
  			'950': '#030712'
  		},
  		red: {
  			'50': '#fef2f2',
  			'100': '#fee2e2',
  			'200': '#fecaca',
  			'300': '#fca5a5',
  			'400': '#f87171',
  			'500': '#ef4444',
  			'600': '#dc2626',
  			'700': '#b91c1c',
  			'800': '#991b1b',
  			'900': '#7f1d1d',
  			'950': '#450a0a'
  		}
  	},
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
