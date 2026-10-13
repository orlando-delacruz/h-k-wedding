// Hand-rolled stroke icon set (premium thin-line, lucide-like) — no deps.
const S = ({ children, size = 20, className = '', strokeWidth = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
)

export const CalendarIcon = (p) => <S {...p}><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M8 2.8v3.4M16 2.8v3.4M3 9.4h18" /><path d="M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2" /></S>
export const MapPinIcon = (p) => <S {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></S>
export const ChurchIcon = (p) => <S {...p}><path d="M12 3v4M10 5h4" /><path d="M12 7 6 11v10h12V11l-6-4Z" /><path d="M10 21v-4a2 2 0 0 1 4 0v4" /></S>
export const HomeIcon = (p) => <S {...p}><path d="m3.5 11 8.5-7 8.5 7" /><path d="M6 9.8V20h12V9.8" /><path d="M10 20v-5h4v5" /></S>
export const MusicIcon = (p) => <S {...p}><path d="M9 18.5V6.2l10-2v11.6" /><circle cx="6.4" cy="18.5" r="2.6" /><circle cx="16.4" cy="15.8" r="2.6" /></S>
export const HeartIcon = (p) => <S {...p}><path d="M12 20.5S3.8 15.4 3.8 9.4A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.2 2.8c0 6-8.2 11.1-8.2 11.1Z" /></S>
export const GiftIcon = (p) => <S {...p}><rect x="4" y="9.4" width="16" height="11.6" rx="2" /><path d="M3 9.4h18M12 9.4V21" /><path d="M12 9.4S10.6 4 8.2 4a2 2 0 0 0 0 4c1.4.6 3.8 1.4 3.8 1.4s2.4-.8 3.8-1.4a2 2 0 0 0 0-4c-2.4 0-3.8 5.4-3.8 5.4Z" /></S>
export const DressIcon = (p) => <S {...p}><path d="M9.5 3.5h5l-.8 3.6L18 20a1.6 1.6 0 0 1-1.5 2H7.5A1.6 1.6 0 0 1 6 20L10.3 7.1 9.5 3.5Z" /><path d="M9.8 7.2h4.4" /></S>
export const CameraOffIcon = (p) => <S {...p}><path d="M4 8.6h2.2l1.6-2.4h8.4l1.6 2.4H20a1.6 1.6 0 0 1 1.6 1.6v8A1.6 1.6 0 0 1 20 21.8H4A1.6 1.6 0 0 1 2.4 20.2v-8A1.6 1.6 0 0 1 4 8.6Z" /><circle cx="12" cy="14.8" r="3.4" /><path d="m3 3 18 18" /></S>
export const UsersIcon = (p) => <S {...p}><circle cx="9" cy="8.4" r="3.4" /><path d="M2.8 20.2c.6-3.6 3.2-5.6 6.2-5.6s5.6 2 6.2 5.6" /><path d="M15.4 5.6a3.2 3.2 0 0 1 0 5.6M17.6 14.9c2.1.7 3.3 2.3 3.6 4.6" /></S>
export const ClockIcon = (p) => <S {...p}><circle cx="12" cy="12" r="8.6" /><path d="M12 7.2V12l3 2.2" /></S>
export const SparkleIcon = (p) => <S {...p}><path d="M12 3.6c.7 3.4 1.6 4.3 5 5-3.4.7-4.3 1.6-5 5-.7-3.4-1.6-4.3-5-5 3.4-.7 4.3-1.6 5-5Z" /><path d="M18.6 14.4c.4 1.8.8 2.3 2.6 2.6-1.8.4-2.3.8-2.6 2.6-.4-1.8-.8-2.3-2.6-2.6 1.8-.4 2.3-.8 2.6-2.6Z" /></S>
export const MailIcon = (p) => <S {...p}><rect x="2.8" y="5.4" width="18.4" height="13.6" rx="2.4" /><path d="m3.6 7 8.4 6 8.4-6" /></S>
export const ScrollIcon = (p) => <S {...p}><path d="M7 3.6h8.4a3 3 0 0 1 3 3v13.8H8.6a3 3 0 0 1-3-3V6.4" /><path d="M5.6 6.4A2.2 2.2 0 0 1 7.8 4h.4a2 2 0 0 1 2 2.2l-.6 10.8" /><path d="M12 8.6h3.2M12 12h3.2" /></S>
export const PlayIcon = (p) => <S {...p}><path d="M7.4 4.8 19 12 7.4 19.2V4.8Z" fill="currentColor" stroke="none" /></S>
export const PauseIcon = (p) => <S {...p}><rect x="6.6" y="4.8" width="3.6" height="14.4" rx="1.4" fill="currentColor" stroke="none" /><rect x="13.8" y="4.8" width="3.6" height="14.4" rx="1.4" fill="currentColor" stroke="none" /></S>
export const ChevronDownIcon = (p) => <S {...p}><path d="m5.5 9 6.5 6.5L18.5 9" /></S>
export const FlowerIcon = (p) => <S {...p}><circle cx="12" cy="12" r="2.4" /><path d="M12 9.6c0-2 .3-3.8 0-4.8-.4-1.3-2.6-1.3-3 0-.3 1 0 2.8 0 4.8M14.4 12c2 0 3.8.3 4.8 0 1.3-.4 1.3-2.6 0-3-1-.3-2.8 0-4.8 0M12 14.4c0 2-.3 3.8 0 4.8.4 1.3 2.6 1.3 3 0 .3-1 0-2.8 0-4.8M9.6 12c-2 0-3.8-.3-4.8 0-1.3.4-1.3 2.6 0 3 1 .3 2.8 0 4.8 0" /></S>
export const CheckIcon = (p) => <S {...p}><path d="m4.5 12.8 5 5L19.5 6.8" /></S>
export const RingIcon = (p) => <S {...p}><circle cx="12" cy="14.5" r="5.6" /><path d="m9 5.4 1.4-2.4h3.2L15 5.4 12 8.6 9 5.4Z" /><path d="M8.9 8.9 12 8.6l3.1.3" /></S>
