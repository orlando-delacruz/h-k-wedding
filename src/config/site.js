// Client-side configuration for the PUBLIC invitation site.
// All content is public: there is no access gate and no backend.

export const SITE = {
  couple: { groom: 'Harthwel', bride: 'Khatrina' },
  dateISO: '2026-11-30T06:30:00+08:00',
  dateLabel: 'November 30, 2026',
  timeLabel: '6:30 AM',
  hashtag: '#NaKHATitiyakNaKayHARTH',
  rsvpDeadline: 'PLEASE RESPOND BY NOVEMBER 15, 2026',
}

// Venue names and addresses are part of the public invitation; detailed maps are not.
export const PUBLIC_VENUES = [
  {
    id: 'ceremony',
    title: 'Wedding Ceremony Venue',
    name: 'Girasoles Farm Candelaria',
    address: 'Girasoles Farm, Candelaria, Quezon, Philippines',
  },
  {
    id: 'reception',
    title: 'Reception Venue',
    name: "Bride's Residence Sittio Bibingkahan Concepcion Uno Sariaya Quezon",
    address: "Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon, Philippines",
  },
]

// Song catalogue. Real files go in public/audio/ (committed site assets);
// until then the gramophone streams clearly marked demo audio.
export const SONGS = [
  { id: 'pahintulot', title: 'Pahintulot', file: 'pahintulot.mp3', isDefault: true },
  { id: 'paninindigan', title: 'Paninindigan kita', file: 'paninindigan-kita.mp3' },
  { id: 'feeling-good', title: 'Feeling good', file: 'feeling-good.mp3' },
]

// Temporary demonstration streams so the gramophone works before the couple
// supplies real recordings. Replace by placing files in public/audio/ instead.
export const FALLBACK_AUDIO = {
  pahintulot: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  paninindigan: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'feeling-good': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
}

const un = (id) => `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`

// Photographs that appear on the PUBLIC page. All are temporary stock imagery,
// clearly labelled in the interface, and replaced when the couple supplies photos.
export const PHOTOS = {
  heroPortrait: un('photo-1519741497674-611481863552'),
}

export const RSVP_FORM = {
  linkUrl: 'https://forms.gle/Nq1jWqWfMTg4eYa98',
  embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSd1kdBdnjrrrHBmfB_AJOQYCWqsZAZBW0TLLK-5HkbnuHMYfA/viewform?embedded=true',
}
