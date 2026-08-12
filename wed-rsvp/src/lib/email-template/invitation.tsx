import { Hr, Link, Section, Text } from '@react-email/components'
import {
  couple,
  footer,
  hero,
  heroLanding,
  invitationCollage,
} from '#/data/weddingData'
import { EmailShell } from './_components/EmailShell'
import { layoutStyles, textStyles } from './theme'

export type InvitationEmailProps = {
  guestName: string
}

function InvitationEmail({ guestName }: InvitationEmailProps) {
  return (
    <EmailShell
      previewText={`You're invited, ${guestName}`}
      eyebrow={hero.tagline}
      title={
        <>
          {couple.name1} &amp; {couple.name2}
        </>
      }
      subtitle={couple.weddingDateDisplay}
    >
      <Section style={layoutStyles.section}>
        <Text style={{ ...textStyles.body, marginBottom: '16px' }}>
          Dear {guestName},
        </Text>
        <Text style={{ ...textStyles.body, marginBottom: '0' }}>
          {invitationCollage.saveTheDate.inviteLine}{' '}
          {invitationCollage.celebration.note}{' '}
          {invitationCollage.celebration.noteAside}
        </Text>
      </Section>

      <Section style={layoutStyles.section}>
        <div style={layoutStyles.paperCard}>
          <Text style={{ ...textStyles.cardSaveLabel, textAlign: 'center' }}>
            You&apos;re Invited
          </Text>
          <Text style={{ ...textStyles.cardNames, textAlign: 'center' }}>
            {couple.name1} &amp; {couple.name2}
          </Text>
          <Hr style={layoutStyles.divider} />
          <Text style={{ ...textStyles.detailLabel, textAlign: 'center' }}>
            Date
          </Text>
          <Text
            style={{
              ...textStyles.gateDate,
              marginBottom: '18px',
              textAlign: 'center',
            }}
          >
            {heroLanding.date}
          </Text>
          <Text style={{ ...textStyles.detailLabel, textAlign: 'center' }}>
            Venue
          </Text>
          <Text
            style={{ ...textStyles.body, margin: '0', textAlign: 'center' }}
          >
            {couple.location}
          </Text>
        </div>
      </Section>

      <Section style={layoutStyles.sectionLast}>
        <Text style={{ ...textStyles.body, marginBottom: '16px' }}>
          {invitationCollage.celebration.details} We cannot wait to celebrate
          with you.
        </Text>
        <Text style={{ ...textStyles.body, margin: '0' }}>
          For questions, you may reach out to {footer.coordinatorName} at{' '}
          <Link
            href={`mailto:${footer.coordinatorEmail}`}
            style={{ color: '#c0866a' }}
          >
            {footer.coordinatorEmail}
          </Link>
          .
        </Text>
      </Section>
    </EmailShell>
  )
}

InvitationEmail.PreviewProps = {
  guestName: 'Maria Santos',
} satisfies InvitationEmailProps

export default InvitationEmail
