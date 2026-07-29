import type { PropsWithChildren, ReactNode } from 'react'
import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { couple, footer } from '#/data/weddingData'
import { fontStacks, googleFontsUrl } from '../fonts'
import { emailTheme, layoutStyles, textStyles } from '../theme'

type EmailShellProps = PropsWithChildren<{
  previewText: string
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  titleStyle?: 'names' | 'saveLabel'
}>

export function EmailShell({
  previewText,
  eyebrow,
  title,
  subtitle,
  titleStyle = 'names',
  children,
}: EmailShellProps) {
  const titleStyles =
    titleStyle === 'saveLabel' ? textStyles.gateSaveLabel : textStyles.gateNames

  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={googleFontsUrl} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('${googleFontsUrl}');
            `,
          }}
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="Arial"
          webFont={{
            url: googleFontsUrl,
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="Arial"
          webFont={{
            url: googleFontsUrl,
            format: 'woff2',
          }}
          fontWeight={500}
          fontStyle="normal"
        />
        <Font
          fontFamily="Pinyon Script"
          fallbackFontFamily="cursive"
          webFont={{
            url: googleFontsUrl,
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body
        style={{
          ...layoutStyles.page,
          fontFamily: fontStacks.body,
        }}
      >
        <Container style={layoutStyles.container}>
          <Section style={layoutStyles.hero}>
            <Text style={textStyles.gateGreeting}>{eyebrow}</Text>
            <Text style={{ ...titleStyles, color: emailTheme.colors.surface }}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={{
                  ...textStyles.gateDate,
                  margin: '18px 0 0',
                  color: emailTheme.colors.surface,
                }}
              >
                {subtitle}
              </Text>
            ) : null}
          </Section>

          {children}

          <Section style={layoutStyles.footer}>
            <Hr style={layoutStyles.divider} />
            <Text
              style={{
                ...textStyles.body,
                margin: '0',
                textAlign: 'center',
                color: emailTheme.colors.text,
              }}
            >
              {footer.closingMessage}
            </Text>
            <Text
              style={{
                ...textStyles.cardNames,
                margin: '18px 0 0',
                textAlign: 'center',
                color: emailTheme.colors.accent,
              }}
            >
              {couple.name1} &amp; {couple.name2}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
