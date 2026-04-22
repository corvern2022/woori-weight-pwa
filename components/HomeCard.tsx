import Link from "next/link";

type Props = {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
};

export function HomeCard({ href, icon, title, subtitle, badge }: Props) {
  return (
    <Link href={href} className="block bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{title}</span>
            {badge && (
              <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-0.5">{badge}</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <span className="text-gray-300">›</span>
      </div>
    </Link>
  );
}
