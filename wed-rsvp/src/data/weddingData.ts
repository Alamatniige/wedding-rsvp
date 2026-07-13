export const couple = {
  name1: 'Jianne',
  name2: 'Joe',
  monogram: 'J&J',
  weddingDateISO: '2027-04-27T16:00:00',
  weddingDateDisplay: '04. 27. 2027',
  rsvpByDisplay: 'April 27, 2027',
  location: 'Villa D’este, Tagaytay, Philippines',
}

export const hero = {
  backgroundImageUrl:
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
  tagline: 'Together with their families',
}

/** Hero landing route (post-welcome-gate) — plain photos, not polaroid/strip. */
export const heroLanding = {
  meetUsPrefix: 'Meet us at',
  venue: couple.location,
  hopeMessage: 'We hope to meet you…',
  ctaLabel: 'RSVP',
  images: [
    {
      id: 'couple',
      src: '/images/entrance/couple-photo.png',
      alt: `${couple.name1} and ${couple.name2}`,
    },
    // Placeholder — replace when a second hero photo is provided
    {
      id: 'placeholder-1',
      src: '',
      alt: 'Wedding photo placeholder',
      placeholder: true,
    },
  ] as const,
}

export type StoryCard = {
  id: string
  title: string
  description: string
  src: string
  alt: string
  width: number
  height: number
}

export const story = {
  quote:
    'We met on a rainy afternoon in a bookstore, reached for the same novel, and have been writing our story ever since. Every chapter has led us here — to this day, surrounded by the people we love most.',
  galleryImages: [
    {
      id: 'bookstore',
      title: 'The Bookstore',
      description:
        'A rainy afternoon, one worn novel, and two hands reaching at once. We laughed, traded numbers, and walked out into the drizzle still talking.',
      src: 'https://images.unsplash.com/photo-1771774573984-71e594341c49?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Couple walking through a garden',
      width: 600,
      height: 800,
    },
    {
      id: 'first-date',
      title: 'First Date',
      description:
        'Coffee turned into dinner, dinner into a stroll beneath city lights. By the end of the night, we already knew this was different.',
      src: 'https://images.unsplash.com/photo-1571771826307-98d0d0999028?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Couple laughing together',
      width: 600,
      height: 800,
    },
    {
      id: 'adventures',
      title: 'Our Adventures',
      description:
        'Road trips, quiet mornings, and spontaneous plans — every new place became ours to discover together.',
      src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
      alt: 'Couple at sunset',
      width: 600,
      height: 800,
    },
    {
      id: 'proposal',
      title: 'The Proposal',
      description:
        'On a golden evening overlooking the hills, one question and a ring — and a joyful yes that still makes us smile.',
      src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80',
      alt: 'Engagement moment',
      width: 600,
      height: 800,
    },
    {
      id: 'together',
      title: 'Building a Life',
      description:
        'Slow Sundays, shared dreams, and the quiet certainty that home is wherever we are side by side.',
      src: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80',
      alt: 'Couple holding hands',
      width: 600,
      height: 800,
    },
    {
      id: 'forever',
      title: 'Forever Begins',
      description:
        'Every chapter has led us here — to this day, surrounded by the people we love most.',
      src: 'https://plus.unsplash.com/premium_photo-1671050940729-895764a09c89?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Romantic portrait',
      width: 600,
      height: 800,
    },
  ] satisfies StoryCard[],
}

export type Milestone = {
  id: string
  title: string
  time: string
  venue: string
  dressCode: string
  description: string
}

export const itinerary: Milestone[] = [
  {
    id: 'ceremony',
    title: 'Ceremony',
    time: '4:00 PM',
    venue: 'Rosewood Garden Pavilion',
    dressCode: 'Formal Attire',
    description:
      'Please arrive by 3:45 PM. The ceremony will be held outdoors in the garden pavilion.',
  },
  {
    id: 'cocktail',
    title: 'Cocktail Hour',
    time: '5:00 PM',
    venue: 'Terrace Lounge',
    dressCode: 'Formal Attire',
    description:
      'Enjoy handcrafted cocktails and hors d\'oeuvres on the terrace overlooking the vineyards.',
  },
  {
    id: 'reception',
    title: 'Reception',
    time: '6:30 PM',
    venue: 'Grand Ballroom',
    dressCode: 'Formal Attire',
    description:
      'Dinner, dancing, and celebration until midnight. Live band and open bar.',
  },
]

export const travel = {
  venueName: 'Rosewood Estate',
  venueAddress: '1234 Vineyard Lane, Napa Valley, CA 94558',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.5076402013653!3d38.50463907827404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8084a23eacbbaf67%3A0x59aeb4d351a67e8b!2sNapa%20Valley!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus',
  mapsLinks: {
    google: 'https://maps.google.com/?q=Rosewood+Estate+Napa+Valley',
    apple: 'https://maps.apple.com/?q=Rosewood+Estate+Napa+Valley',
    waze: 'https://waze.com/ul?q=Rosewood+Estate+Napa+Valley',
  },
  hotels: [
    {
      name: 'The Vineyard Inn',
      discountCode: 'ELEANORJAMES',
      distance: '0.5 miles from venue',
      description: 'Boutique hotel with complimentary shuttle service on wedding day.',
    },
    {
      name: 'Napa Valley Lodge',
      discountCode: 'EJ2026',
      distance: '1.2 miles from venue',
      description: 'Luxury accommodations with vineyard views and spa amenities.',
    },
    {
      name: 'Harvest House Hotel',
      discountCode: 'WEDDING26',
      distance: '2.0 miles from venue',
      description: 'Charming inn with garden courtyard and farm-to-table breakfast.',
    },
  ],
}

export const countdown = {
  meetUsPrefix: 'Meet us at',
  venue: couple.location,
  dateDisplay: couple.weddingDateDisplay,
}

export const coupleSection = {
  backgroundImageUrl: hero.backgroundImageUrl,
  ctaLabel: 'Share Your Address',
}

/** @deprecated Orphaned AddressForm only — live form uses rsvpForm. */
export const addressForm = {
  label: 'Your Details',
  title: 'Mailing Address',
  helper:
    'Please share your mailing address so we can send the official invitation.',
  fullNameLabel: 'Full Name',
  mailingAddressLabel: 'Mailing Address',
  additionalDetailsLabel: 'Additional Details',
  additionalDetailsPlaceholder: 'Apartment, landmarks, or delivery notes (optional)',
  submitLabel: 'Submit',
  savedTitle: 'Saved',
  savedCopy: 'Your details are saved. Scroll down for a little thank-you.',
  fullNameRequired: 'Please enter your full name.',
  mailingAddressRequired: 'Please enter your mailing address.',
}

export const rsvpForm = {
  label: 'RSVP',
  title: 'Let Us Know',
  helper: `Please reply by ${couple.rsvpByDisplay} so we can celebrate with you.`,
  firstNameLabel: 'First Name',
  lastNameLabel: 'Last Name',
  emailLabel: 'Email Address',
  submitLabel: 'Submit',
  submittingLabel: 'Saving…',
  submittedLabel: 'Submitted',
  firstNameRequired: 'Please enter your first name.',
  lastNameRequired: 'Please enter your last name.',
  emailRequired: 'Please enter your email address.',
  emailInvalid: 'Please enter a valid email address.',
}

/** @deprecated Orphaned attendance wizard only — live form uses rsvpForm. */
export const rsvp = {
  dietaryOptions: [
    'No dietary restrictions',
    'Vegetarian',
    'Vegan',
    'Gluten-free',
    'Halal',
    'Kosher',
    'Other',
  ],
}

export const registry = {
  links: [
    {
      name: 'Crate & Barrel',
      url: 'https://www.crateandbarrel.com/',
      description: 'Home essentials for our new chapter',
    },
    {
      name: 'Honeyfund',
      url: 'https://www.honeyfund.com/',
      description: 'Contribute to our honeymoon adventure',
    },
  ],
  wishingWell: {
    title: 'Wishing Well',
    description: 'Your presence is the greatest gift. If you wish to contribute, scan below.',
    qrImageUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com/wishing-well',
  },
}

export const footer = {
  coupleBackgroundImageUrl: '/images/entrance/couple-photo.png',
  initials: couple.monogram,
  heroMessage: '',
  rsvpThankYouMessage: 'Thank you for celebrating with us.',
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
  baybayinNames: 'ᜇ᜔ᜌᜒᜀᜈ᜔ - ᜇ᜔ᜌᜓ',
  saveTheDateLabel: 'Save the Date',
  photoboothMachineSrc: '/images/entrance/photobooth-machine.png',
  palmTreeLeftSrc: '/images/entrance/palm-tree-slanted.png',
  palmTreeRightSrc: '/images/entrance/palm-tree-slanted.png',
  couplePhotoSrc: '/images/entrance/couple-photo.png',
  pullPrompt: 'Pull the film down to reveal photos',
  exitCta: 'Open the Invitation',
}

export const saveTheDate = {
  cardTitle: 'Save the Date',
  cardSubtitle: couple.weddingDateDisplay,
  cardVenue: couple.location,
  note: 'Can’t wait to celebrate with you under the palms.',
  stripPhotoSrc: entranceGate.couplePhotoSrc,
  stripAlt: `${couple.name1} and ${couple.name2}`,
}

export const contactBlock = {
  heading: 'Questions?',
  body: `Reach out to our day-of coordinator, ${footer.coordinatorName}, at ${footer.coordinatorPhone} or ${footer.coordinatorEmail}.`,
  goBackLabel: 'Go Back',
}

export const preWeddingParallax = {
  /** Main page background for Hero + RSVP routes */
  pageBackgroundSrc: '/images/entrance/palm-leaf-bg-1.avif',
  palmBackLeftSrc: '/images/entrance/palm-tree-1.png',
  palmBackRightSrc: '/images/entrance/palm-tree-2.png',
  palmMidSrc: '/images/entrance/twin-palm-tree.png',
  palmForeLeftSrc: '/images/entrance/palm-tree-slanted.png',
  palmForeRightSrc: '/images/entrance/palm-tree-leaves.png',
}

export const thankYou = {
  label: 'With love',
  title: 'Thank You!',
  message:
    'Your address is saved. We cannot wait to send your invitation and celebrate with you under the golden hour sky.',
  monogram: couple.monogram,
}
