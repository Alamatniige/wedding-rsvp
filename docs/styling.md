:root {
  /* Color Tokens */
  --bg-cream: #FAF7F2;
  --text-espresso: #2B221A;
  --accent-terracotta: #C2775C;
  --leaf-green: #606C38;
  --twine-tan: #B59A73;
  --capiz-white: rgba(255, 255, 255, 0.75);

  /* Typography Tokens */
  --font-names: 'Great Vibes', cursive;
  --font-header: 'Cormorant Garamond', serif;
  --font-body: 'Montserrat', sans-serif;
}

/* Global Reset Overlays */
body {
  background-color: var(--bg-cream);
  color: var(--text-espresso);
  font-family: var(--font-body);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}