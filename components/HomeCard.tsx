import Link from "next/link";

interface HomeCardProps {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  accentColor: string; // 'duck', 'dolphin', 'mint', 'peach'
}

export function HomeCard({ href, icon, title, subtitle, accentColor }: HomeCardProps) {
  const colorMap: Record<string, string> = {
    duck: "var(--duck)",
    dolphin: "var(--dolphin)",
    mint: "var(--mint)",
    peach: "var(--peach)",
  };

  const borderColor = colorMap[accentColor] ?? colorMap.duck;

  return (
    <Link
      href={href}
      className="block bg-card rounded-2xl shadow-card p-5 hover:shadow-soft hover:-translate-y-0.5 transition-all"
      style={{ borderTop: `4px solid ${borderColor}` }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-jua text-lg text-ink leading-tight">{title}</div>
      <div className="font-gaegu text-sm text-ink-soft mt-0.5">{subtitle}</div>
    </Link>
  );
}
