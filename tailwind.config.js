/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			// Brand colors defined with hex values for direct reference
  			brand: {
  				blue: '#4A7CFF', // Primary blue
  				coral: '#FF7D54', // Coral/secondary
  				yellow: '#FFD166', // Accent yellow
  			},
  			primary: {
  				// Shades of blue based on brand blue (#4A7CFF)
  				'50': '#f0f6ff',
  				'100': '#e0edff',
  				'200': '#c1dbff',
  				'300': '#92bfff',
  				'400': '#699eff',
  				'500': '#4A7CFF', // Brand blue
  				'600': '#3a62cc',
  				'700': '#2d4da3',
  				'800': '#25407f',
  				'900': '#1f3463',
  				'950': '#0f1b37',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				// Shades of coral based on brand coral (#FF7D54)
  				'50': '#fff4f0',
  				'100': '#ffe9df',
  				'200': '#ffd3bf',
  				'300': '#ffb599',
  				'400': '#ff9670',
  				'500': '#FF7D54', // Brand coral
  				'600': '#cc6443',
  				'700': '#a34e36',
  				'800': '#7f3d2a',
  				'900': '#663123',
  				'950': '#331811',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				// Shades of yellow based on brand yellow (#FFD166)
  				'50': '#fffaeb',
  				'100': '#fff5d6',
  				'200': '#ffebad',
  				'300': '#ffe085',
  				'400': '#FFD166', // Brand yellow
  				'500': '#fab317',
  				'600': '#de8e0e',
  				'700': '#b86b10',
  				'800': '#925415',
  				'900': '#784516',
  				'950': '#432508',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
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
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
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
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'ui-sans-serif',
  				'system-ui'
  			],
  			display: [
  				'var(--font-montserrat)',
  				'ui-sans-serif',
  				'system-ui'
  			]
  		},
  		borderRadius: {
  			'4xl': '2rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: ['class', 'class'],
} 