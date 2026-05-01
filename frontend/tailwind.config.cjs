module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-raised': 'var(--bg-raised)',
        'bg-overlay': 'var(--bg-overlay)',
        'border-subtle': 'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
        'border-violet': 'var(--border-violet)',
        'violet': 'var(--violet)',
        'violet-light': 'var(--violet-light)',
        'violet-dim': 'var(--violet-dim)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-violet': 'var(--text-violet)',
        'green': 'var(--green)',
        'green-dim': 'var(--green-dim)',
        'amber': 'var(--amber)',
        'amber-dim': 'var(--amber-dim)',
        'red': 'var(--red)',
        'red-dim': 'var(--red-dim)',
      },
      borderRadius: {
        'sm': 'var(--r-sm)',
        'md': 'var(--r-md)',
        'lg': 'var(--r-lg)',
        'xl': 'var(--r-xl)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif']
      },
      transitionDuration: { DEFAULT: '150ms' }
    }
  },
  plugins: []
}
