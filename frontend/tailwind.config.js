export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        robot: {
          bg: '#0f1117',
          panel: '#1a1d27',
          border: '#2a2d3a',
          accent: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          text: '#e2e8f0',
          muted: '#64748b',
        }
      }
    }
  },
  plugins: []
}
