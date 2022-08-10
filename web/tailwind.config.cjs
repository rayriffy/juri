/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: 'SF Pro Display,system-ui,-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Arial,sans-serif',
        mono: 'SF Mono,SFMono-Regular,ui-monospace,Menlo,monospace',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
