import type { CSSProperties } from 'react'
import { fontStacks } from './fonts'

export const emailTheme = {
  colors: {
    background: '#ede9df',
    surface: '#f5f2ea',
    card: '#fbf7f0',
    text: '#262b30',
    textSoft: '#5a6166',
    accent: '#c0866a',
    accentSoft: '#d4a890',
    deep: '#3d464b',
    gold: '#c9a27a',
    line: '#d4cbb8',
    white: '#ffffff',
  },
  fonts: {
    /** Mirrors `--font-names` in src/styles.css */
    names: fontStacks.names,
    /** Mirrors `--font-body` in src/styles.css */
    body: fontStacks.body,
  },
  shadows: {
    card: '0 12px 32px rgba(38, 43, 48, 0.12)',
  },
  radius: {
    card: '24px',
    pill: '999px',
  },
} as const

/** Typography aligned with `.photobooth-gate` in styles.css */
export const textStyles = {
  body: {
    margin: '0',
    fontFamily: emailTheme.fonts.body,
    fontSize: '16px',
    lineHeight: '26px',
    color: emailTheme.colors.textSoft,
  } satisfies CSSProperties,
  gateGreeting: {
    margin: '0 0 16px',
    fontFamily: emailTheme.fonts.body,
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    lineHeight: '1.35',
    color: emailTheme.colors.surface,
  } satisfies CSSProperties,
  gateNames: {
    margin: '0',
    fontFamily: emailTheme.fonts.names,
    fontSize: '72px',
    fontWeight: 400,
    lineHeight: '1.15',
    color: emailTheme.colors.surface,
  } satisfies CSSProperties,
  gateSaveLabel: {
    margin: '0',
    fontFamily: emailTheme.fonts.names,
    fontSize: '48px',
    fontWeight: 400,
    lineHeight: '1.2',
    color: emailTheme.colors.text,
  } satisfies CSSProperties,
  gateDate: {
    margin: '0',
    fontFamily: emailTheme.fonts.names,
    fontSize: '40px',
    fontWeight: 400,
    letterSpacing: '0.04em',
    lineHeight: '1.2',
    color: emailTheme.colors.text,
  } satisfies CSSProperties,
  cardSaveLabel: {
    margin: '0 0 8px',
    fontFamily: emailTheme.fonts.names,
    fontSize: '48px',
    fontWeight: 400,
    lineHeight: '1.2',
    color: emailTheme.colors.accent,
  } satisfies CSSProperties,
  cardNames: {
    margin: '0',
    fontFamily: emailTheme.fonts.names,
    fontSize: '48px',
    fontWeight: 400,
    lineHeight: '1.15',
    color: emailTheme.colors.text,
  } satisfies CSSProperties,
  detailLabel: {
    margin: '0 0 6px',
    fontFamily: emailTheme.fonts.body,
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: emailTheme.colors.accent,
  } satisfies CSSProperties,
  detailValue: {
    margin: '0',
    fontFamily: emailTheme.fonts.body,
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '26px',
    color: emailTheme.colors.text,
  } satisfies CSSProperties,
} as const

export const layoutStyles = {
  page: {
    margin: 0,
    padding: '32px 16px',
    width: '100%',
    backgroundColor: emailTheme.colors.background,
    color: emailTheme.colors.text,
  } satisfies CSSProperties,
  container: {
    margin: '0 auto',
    maxWidth: '620px',
    backgroundColor: emailTheme.colors.surface,
    borderRadius: emailTheme.radius.card,
    overflow: 'hidden',
    boxShadow: emailTheme.shadows.card,
  } satisfies CSSProperties,
  section: {
    padding: '40px 40px 0',
  } satisfies CSSProperties,
  sectionLast: {
    padding: '40px',
  } satisfies CSSProperties,
  hero: {
    padding: '48px 40px',
    background:
      'linear-gradient(180deg, rgba(61, 70, 75, 0.94) 0%, rgba(38, 43, 48, 0.92) 100%)',
    textAlign: 'center',
  } satisfies CSSProperties,
  paperCard: {
    padding: '28px',
    backgroundColor: emailTheme.colors.card,
    border: `1px solid ${emailTheme.colors.line}`,
    borderRadius: '18px',
  } satisfies CSSProperties,
  divider: {
    margin: '22px auto',
    width: '56px',
    borderColor: emailTheme.colors.accentSoft,
  } satisfies CSSProperties,
  button: {
    display: 'inline-block',
    padding: '14px 26px',
    borderRadius: emailTheme.radius.pill,
    backgroundColor: emailTheme.colors.deep,
    color: emailTheme.colors.surface,
    fontFamily: emailTheme.fonts.body,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.18em',
    textDecoration: 'none',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  footer: {
    padding: '0 40px 40px',
  } satisfies CSSProperties,
} as const
