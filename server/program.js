// Protected wedding programme content.
// Served ONLY to a verified attending session — never bundled into the public page.
// Keep this file free of credentials, guest records, or personal history that has not
// been supplied by the couple.

export const PROGRAM = {
  // Temporary sample — clearly marked; the couple's real story replaces this later.
  story: `Two souls, two paths, one promise. From quiet mornings to loud laughter with friends, every small moment led here. Through distance and doubt, kindness won. Now, before family and God, we choose each other — today, tomorrow, always. (Temporary sample text — the couple's real story will replace this.)`,

  // Public invitation already names the venues; the detailed programme repeats them
  // with full addresses and map links for confirmed guests.
  venues: [
    {
      id: 'ceremony',
      title: 'Wedding Ceremony Venue',
      name: 'Girasoles Farm Candelaria',
      address: 'Girasoles Farm, Candelaria, Quezon, Philippines',
      mapLink: 'https://www.google.com/maps?q=Girasoles+Farm+Candelaria+Quezon+Philippines',
      mapEmbed: 'https://www.google.com/maps?q=Girasoles+Farm+Candelaria+Quezon+Philippines&output=embed',
      placeholder: true,
    },
    {
      id: 'reception',
      title: 'Reception Venue',
      name: "Bride's Residence Sittio Bibingkahan Concepcion Uno Sariaya Quezon",
      address: "Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon, Philippines",
      mapLink: 'https://www.google.com/maps?q=Sitio+Bibingkahan+Concepcion+Uno+Sariaya+Quezon+Philippines',
      mapEmbed: 'https://www.google.com/maps?q=Sitio+Bibingkahan+Concepcion+Uno+Sariaya+Quezon+Philippines&output=embed',
      placeholder: true,
    },
  ],

  // Programme outline. Only the ceremony time is confirmed; everything else stays
  // deliberately vague until the couple supplies the final timeline image.
  stages: [
    { time: '6:30 AM', title: 'Ceremony', detail: 'Girasoles Farm, Candelaria, Quezon' },
    { time: 'To follow', title: 'Reception', detail: "Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon" },
  ],

  // Photos remain placeholder URLs; the couple supplies the real set later.
  photos: {
    curtainPortrait: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop',
    strip: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop',
    ],
    slideshow: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop',
    ],
    attireGuide: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop',
    attireGuidePlaceholder: true,
  },

  hashtag: '#NaKHATitiyakNaKayHARTH',
}
