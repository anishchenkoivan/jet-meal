export type LogoProps = {
  title?: string;
};

export function Logo({ title = "Jet Meal" }: LogoProps) {
  return (
    <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
      {title}
    </span>
  );
}
