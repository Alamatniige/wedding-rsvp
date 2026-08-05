import { Hr, Row, Section, Text } from '@react-email/components'
import { couple } from '#/data/weddingData'
import { EmailShell } from './_components/EmailShell'
import { layoutStyles, textStyles } from './theme'

export type RSVPOwnerNotificationEmailProps = {
  event: 'created' | 'updated'
  guestName: string
  guestEmail: string
  additionalDetails?: string
  submissionSource: string
}

export default function RSVPOwnerNotificationEmail({
  event,
  guestName,
  guestEmail,
  additionalDetails,
  submissionSource,
}: RSVPOwnerNotificationEmailProps) {
  const action = event === 'created' ? 'submitted' : 'updated'

  return (
    <EmailShell
      previewText={`${guestName} ${action} an RSVP`}
      eyebrow="Guest RSVP"
      title={`RSVP ${event === 'created' ? 'received' : 'updated'}`}
      titleStyle="saveLabel"
      subtitle={couple.weddingDateDisplay}
    >
      <Section style={layoutStyles.section}>
        <Text style={textStyles.body}>
          {guestName} has {action} RSVP details.
        </Text>
      </Section>
      <Section style={layoutStyles.section}>
        <div style={layoutStyles.paperCard}>
          <Text style={textStyles.detailLabel}>Guest</Text>
          <Text style={textStyles.detailValue}>{guestName}</Text>
          <Hr style={layoutStyles.divider} />
          <Row>
            <Text style={textStyles.detailLabel}>Email Address</Text>
            <Text style={textStyles.detailValue}>{guestEmail}</Text>
          </Row>
          <Row>
            <Text style={textStyles.detailLabel}>Submission Source</Text>
            <Text style={textStyles.detailValue}>
              {submissionSource.replaceAll('_', ' ')}
            </Text>
          </Row>
          <Row>
            <Text style={textStyles.detailLabel}>Additional Details</Text>
            <Text style={{ ...textStyles.body, margin: '0' }}>
              {additionalDetails || 'None provided'}
            </Text>
          </Row>
        </div>
      </Section>
    </EmailShell>
  )
}

RSVPOwnerNotificationEmail.PreviewProps = {
  event: 'created',
  guestName: 'Joaquin Reyes',
  guestEmail: 'joaquin@example.com',
  additionalDetails: 'Vegetarian meal, please.',
  submissionSource: 'pre_wedding',
} satisfies RSVPOwnerNotificationEmailProps
