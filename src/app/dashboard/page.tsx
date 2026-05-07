import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingDashboard } from "@/components/dashboard/booking-dashboard";
import { getDashboardData } from "@/lib/booking";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { month } = await searchParams;
  const dashboardData = await getDashboardData(session.user.id, month);

  return (
    <BookingDashboard
      dashboardData={dashboardData}
      userEmail={session.user.email ?? ""}
      userName={session.user.name ?? ""}
    />
  );
}
