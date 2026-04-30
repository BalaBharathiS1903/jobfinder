export default function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#2563EB"/>
      <path d="M9 11 L17 29 L20 21 L23 29 L31 11" stroke="#4F46E5" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M9 11 L17 29 L20 21 L23 29 L31 11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6"/>
    </svg>
  );
}
