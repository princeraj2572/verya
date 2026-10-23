// All brand content lives here (plus the bottle profile in bottle.ts).
// To reskin for a client: copy and edit this file. See README, "Reskin for a client".

export interface Note {
  name: string;
  detail: string;
}

export interface Chapter {
  id: string;
  /** short name for the side navigation */
  label: string;
  kicker: string;
  /** headline split into lines; each line is revealed separately */
  headline: string[];
  body: string;
  notes?: Note[];
  /** alt text for the static still shown in reduced-motion / no-WebGL mode */
  stillAlt: string;
}

export interface Edition {
  id: string;
  name: string;
  /** liquid colour in the 3D bottle */
  liquid: number;
  /** page accent (CSS hex) used for rules, buttons and focus */
  accent: string;
  description: string;
}

export interface CraftPart {
  id: 'cap' | 'neck' | 'glass' | 'liquid' | 'base';
  label: string;
  detail: string;
}

export const brand = {
  name: 'Veyra',
  product: 'Ember & Fig',
  tagline: 'A slow fragrance of warm fig and smouldering amber.',
  siteTitle: 'Veyra · Ember & Fig — a slow, warm fragrance',
  description:
    'Veyra is a fictional fragrance house. Ember & Fig is a placeholder product: fig leaf, jasmine, amber and sandalwood, told in eight slow chapters.',
  url: 'https://example.com/',
  placeholderNote:
    'Veyra and Ember & Fig are invented for this demonstration. No product is for sale.',
};

/** Page background per chapter, as hex numbers. The 3D scene and the page both read these. */
export const palette = {
  charcoal: 0x15120f,
  amber: 0x2a1708,
  deepAmber: 0x2b1505,
  plum: 0x24101f,
  cream: 0xeadfcb,
  ink: 0xf1e7d6,
  inkDark: 0x1b1510,
};

export const chapters: Chapter[] = [
  {
    id: 'hero',
    label: 'Overture',
    kicker: 'Eau de parfum · 50 ml',
    headline: ['Ember', '& Fig'],
    body: 'A fragrance for the hour after sunset, when the day is still warm in the walls.',
    stillAlt: 'A faceted glass perfume bottle with amber liquid, lit from the side on a dark ground.',
  },
  {
    id: 'glass',
    label: 'The Glass',
    kicker: 'Chapter I · The Glass',
    headline: ['Finished', 'by hand.'],
    body: 'Each flask is blown, cooled slowly and polished until the light travels through it without hurry. No two edges catch the light in quite the same way.',
    stillAlt: 'Close view of the bottle shoulder, a soft band of light sweeping across thick glass.',
  },
  {
    id: 'top',
    label: 'Top notes',
    kicker: 'Chapter II · Top notes',
    headline: ['First light,', 'bright and brief.'],
    body: 'The opening lasts a few minutes: sharp, clean and a little sunlit.',
    notes: [
      { name: 'Bergamot', detail: 'Cold-pressed citrus peel, green and bright.' },
      { name: 'Pink pepper', detail: 'A dry, rosy spark that lifts the opening.' },
    ],
    stillAlt: 'The bottle tilted slightly, surrounded by drifting golden specks of light.',
  },
  {
    id: 'heart',
    label: 'Heart',
    kicker: 'Chapter III · Heart',
    headline: ['Then the', 'fig leaf unfolds.'],
    body: 'The heart arrives softly. Green, milky and floral, it warms as it settles on skin.',
    notes: [
      { name: 'Fig leaf', detail: 'Green, creamy and faintly sweet.' },
      { name: 'Jasmine', detail: 'White petals, warm rather than sharp.' },
    ],
    stillAlt: 'The bottle in plum light with the liquid turning warmer, pale petals drifting past.',
  },
  {
    id: 'base',
    label: 'Base',
    kicker: 'Chapter IV · Base',
    headline: ['Settling into', 'amber.'],
    body: 'The base is what stays: resinous, woody and close to the skin for hours.',
    notes: [
      { name: 'Amber', detail: 'Resinous, golden and slow.' },
      { name: 'Sandalwood', detail: 'Soft, creamy wood.' },
      { name: 'Musk', detail: 'A clean, quiet warmth.' },
    ],
    stillAlt: 'The bottle at rest in deep amber light, the liquid glowing from within.',
  },
  {
    id: 'craft',
    label: 'Craft',
    kicker: 'Chapter V · Craft',
    headline: ['Built from', 'five quiet parts.'],
    body: 'Take it apart and the design is plain: one cap, one neck, one block of glass, one measure of liquid, one weighted base.',
    stillAlt: 'The bottle in an exploded view, cap lifted above the neck and the parts floating apart.',
  },
  {
    id: 'editions',
    label: 'Editions',
    kicker: 'Chapter VI · Editions',
    headline: ['Three', 'tones of glow.'],
    body: 'The scent is the same. Choose the colour of the liquid you would like to see.',
    stillAlt: 'The bottle at rest, its liquid in the chosen edition colour.',
  },
  {
    id: 'finale',
    label: 'Finale',
    kicker: 'Chapter VII · Finale',
    headline: ['Discover', 'Ember & Fig'],
    body: 'Leave an email address and we will write once, when the demonstration ends. Nothing is stored.',
    stillAlt: 'The bottle facing the viewer on a warm cream ground, soft light across the glass.',
  },
];

export const editions: Edition[] = [
  {
    id: 'ember',
    name: 'Ember',
    liquid: 0xd9822b,
    accent: '#e0a24f',
    description: 'Burnt orange, like the last coal.',
  },
  {
    id: 'fig',
    name: 'Fig',
    liquid: 0x8a3f6b,
    accent: '#c57ba3',
    description: 'Deep violet-plum, like ripe skin.',
  },
  {
    id: 'sage',
    name: 'Leaf',
    liquid: 0x7d8f4b,
    accent: '#a6bb73',
    description: 'Soft green, like a fig leaf in shade.',
  },
];

export const craftParts: CraftPart[] = [
  { id: 'cap', label: 'Cap', detail: 'Turned and weighted, with a brushed-gold collar.' },
  { id: 'neck', label: 'Neck', detail: 'A slim ring where cap and glass meet.' },
  { id: 'glass', label: 'Glass', detail: 'Thick, hand-finished flask.' },
  { id: 'liquid', label: 'Liquid', detail: 'The fragrance, 50 ml.' },
  { id: 'base', label: 'Base', detail: 'A heavy foot that keeps it steady.' },
];

export const form = {
  label: 'Email address',
  placeholder: 'you@example.com',
  button: 'Notify me',
  errorEmpty: 'Please enter your email address.',
  errorInvalid: 'That does not look like an email address.',
  success: 'Thank you. This is a demonstration, so nothing was sent or stored.',
};

export const footer = {
  line: 'Veyra is a placeholder brand. Imagery is generated in code.',
};
