module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        primaryHover: 'var(--primary-hover)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)'
      },
      transitionDuration: { DEFAULT: '150ms' }
    }
  },
  plugins: []
}
