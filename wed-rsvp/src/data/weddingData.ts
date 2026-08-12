export const couple = {
  name1: 'Jianne',
  name2: 'Joe',
  /** Script flourish letters (0-based) for Loren Blake mixed formatting */
  name1ScriptIndices: [0], // J in JIANNE
  name2ScriptIndices: [0], // J in JOE
  monogram: 'J&J',
  weddingDateISO: '2027-04-27T16:00:00',
  weddingDateDisplay: '27. 04. 2027',
  rsvpByDisplay: 'April 27, 2027',
  replyByDisplay: '1st December, 2026',
  location: 'Villa D’este, Tagaytay, Philippines',
}

export const hero = {
  backgroundImageUrl: '/images/entrance/teal-bg.jpg',
  tagline: 'Together with their families',
}

/** Hero landing route (post-welcome-gate). */
export const heroLanding = {
  meetUsPrefix: 'Meet us at',
  /** Two-line venue for mobile-friendly mixed display */
  venueLines: ["Villa D'este", 'Tagaytay, Philippines'] as const,
  venue: couple.location,
  hopeMessage: 'We hope you can join us in...',
  date: 'Tuesday, 27th April, 2027',
  /** Two-line description under the countdown */
  descriptionLines: [
    'Formal invitation to follow.',
    'Please click below to share your email address',
  ] as const,
  ctaLabel: 'Share Your Details',
}

/** Flat-lay invitation collage on the hero landing. */
export const invitationCollage = {
  saveTheDate: {
    inviteLine: 'We kindly invite you to our wedding with love.',
    title: 'Save the Date',
    names: `${couple.name1} & ${couple.name2}`,
  },
  celebration: {
    details: `Tuesday, 27th April, 2027. Villa D'este, Tagaytay, Philippines.`,
    note: `Finally making it official`,
    noteAside: `(& throwing a massive party while we're at it).`,
    secondNote: `Bring your best moves and your appetite!`,
    footer: 'Formal invitation to follow.',
  },
  filmStripSrcs: [
    '/images/couple/couple-1.jpg',
    '/images/couple/couple-2.jpg',
    '/images/couple/couple-3.jpg',
    '/images/couple/couple-4.jpg',
  ],
  filmStripAlt: `${couple.name1} and ${couple.name2}`,
}

export const rsvpForm = {
  backLabel: 'Go Back',
  title: 'Details',
  description: 'Come raise a glass  with us! Please share your mailing address so we can send the official invitation with all the details for our wedding day.',
  helperPrefix: 'Please kindly reply by',
  helperDate: couple.replyByDisplay,
  firstNameLabel: 'First Name',
  lastNameLabel: 'Last Name',
  emailLabel: 'Email Address',
  additionalDetailsLabel: 'Additional Details',
  submitLabel: 'Submit',
  submittingLabel: 'Saving…',
  submittedLabel: 'Submitted',
  firstNameRequired: 'Please enter your first name.',
  lastNameRequired: 'Please enter your last name.',
  emailRequired: 'Please enter your email address.',
  emailInvalid: 'Please enter a valid email address.',
}

export const footer = {
  initials: 'Jianne & Joe',
  heroMessage: '',
  rsvpThankYouMessage: 'Thank you for your response. We cannot wait to celebrate our new chapter with you!',
  closingMessage:
    'We are so grateful to share this day with you. Your love and support have shaped our journey, and we cannot wait to celebrate together.',
  coordinatorName: 'Sarah Mitchell',
  coordinatorPhone: '(555) 123-4567',
  coordinatorEmail: 'sarah@rosewoodweddings.com',
  attribution: 'Created with love',
}

export const siteMeta = {
  title: `${couple.name1} & ${couple.name2} — Wedding`,
  description: `Join ${couple.name1} and ${couple.name2} on ${couple.weddingDateDisplay} at ${couple.location}.`,
}

export const entranceGate = {
  greeting: 'We are getting married!',
  // Couple's names written in Baybayin (old Filipino script): "Jianne - Joe"
  saveTheDateLabel: 'Save the Date',
  pullHint: 'Pull the strip to open the invitation',
  photoboothMachineSrc: '/images/entrance/photobooth-machine.png',
  couplePhotoSrcs: [
    '/images/couple/couple-1.jpg',
    '/images/couple/couple-2.jpg',
    '/images/couple/couple-3.jpg',
    '/images/couple/couple-4.jpg',
  ],
  exitCta: 'Open invitation',
}

export const preWeddingParallax = {
  /** Main page background for Hero + RSVP routes */
  pageBackgroundSrc: '/images/entrance/teal-bg.jpg',
}

export const thankYou = {
  label: 'With love',
  title: 'Thank You!',
  message:
    'Your address is saved. We cannot wait to send your invitation and celebrate with you under the golden hour sky.',
  monogram: couple.monogram,
}
