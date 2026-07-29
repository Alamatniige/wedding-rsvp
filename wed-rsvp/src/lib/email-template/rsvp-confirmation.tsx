import { Hr, Link, Row, Section, Text } from '@react-email/components'
import { couple, footer, thankYou } from '#/data/weddingData'
import { EmailShell } from './_components/EmailShell'
import { layoutStyles, textStyles } from './theme'

export type RSVPConfirmationEmailProps = {
  guestName: string
  guestEmail: string
  additionalDetails?: string
}

function RSVPConfirmationEmail({
  guestName,
  guestEmail,
  additionalDetails,
}: RSVPConfirmationEmailProps) {
  return (
    <EmailShell
      previewText={`RSVP received for ${guestName}`}
      eyebrow="RSVP Confirmed"
      title={thankYou.title}
      titleStyle="saveLabel"
      subtitle={couple.weddingDateDisplay}
    >
      <Section style={layoutStyles.section}>
        <Text style={textStyles.body}>Hi {guestName},</Text>
        <Text style={{ ...textStyles.body, marginTop: '16px' }}>
          Thank you for sharing your details with us. We&apos;ve received your
          RSVP, and your formal invitation is on its way in a separate email.
        </Text>
      </Section>

      <Section style={layoutStyles.section}>
        <div style={layoutStyles.paperCard}>
          <Text style={textStyles.detailLabel}>Guest</Text>
          <Text style={textStyles.detailValue}>{guestName}</Text>
          <Hr style={layoutStyles.divider} />
          <Row>
            <Text style={textStyles.detailLabel}>Email Address</Text>
            <Text style={{ ...textStyles.detailValue, margin: '0 0 18px' }}>
              {guestEmail}
            </Text>
          </Row>
          <Row>
            <Text style={textStyles.detailLabel}>Wedding Date</Text>
            <Text
              style={{
                ...textStyles.gateDate,
                fontSize: '40px',
                margin: '0 0 18px',
              }}
            >
              {couple.weddingDateDisplay}
            </Text>
          </Row>
          <Row>
            <Text style={textStyles.detailLabel}>Venue</Text>
            <Text style={{ ...textStyles.body, margin: '0' }}>
              {couple.location}
            </Text>
          </Row>
        </div>
      </Section>

      {additionalDetails ? (
        <Section style={layoutStyles.section}>
          <Text style={textStyles.detailLabel}>Your Additional Details</Text>
          <Text style={{ ...textStyles.body, margin: '0' }}>
            {additionalDetails}
          </Text>
        </Section>
      ) : null}

      <Section style={layoutStyles.sectionLast}>
        <Text style={{ ...textStyles.body, marginBottom: '16px' }}>
          {thankYou.message}
        </Text>
        <Text style={{ ...textStyles.body, marginBottom: '0' }}>
          If you need to update any submitted details, reply to this email or
          contact {footer.coordinatorName} at{' '}
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

RSVPConfirmationEmail.PreviewProps = {
  guestName: 'Joaquin Reyes',
  guestEmail: 'joaquin@example.com',
  additionalDetails: 'Looking forward to celebrating with you both.',
} satisfies RSVPConfirmationEmailProps

export default RSVPConfirmationEmail
