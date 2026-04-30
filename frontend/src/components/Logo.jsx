export default function Logo({ size = 48 }) {
  return (
    <img
      src="/vdart.png"
      alt="VDart Academy"
      height={size}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}
