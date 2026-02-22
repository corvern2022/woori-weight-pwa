const SEOUL_TZ = "Asia/Seoul";

export function toSeoulISODate(date = new Date()): string {
  // timeZone 지정으로 클라이언트 로컬 TZ와 무관하게 Seoul 기준 날짜를 얻는다.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addDaysISO(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function buildDateRange(endISO: string, days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    dates.push(addDaysISO(endISO, -i));
  }
  return dates;
}

export function formatDelta(delta: number | null): string {
  if (delta === null || Number.isNaN(delta)) return "기록 없음";
  const rounded = Math.round(delta * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toFixed(1)}kg`;
}

export function formatISOWithWeekday(isoDate: string): string {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const [y, m, d] = isoDate.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${isoDate} (${weekdays[day]})`;
}

export function formatISOWithWeekdayKorean(isoDate: string): string {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const [y, m, d] = isoDate.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${y}. ${String(m).padStart(2, "0")}. ${String(d).padStart(2, "0")}. (${weekdays[day]})`;
}
