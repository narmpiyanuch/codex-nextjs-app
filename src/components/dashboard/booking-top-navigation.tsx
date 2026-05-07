"use client";

import Link from "next/link";
import { logoutAction } from "@/app/dashboard/actions";
import { Icon } from "@/components/dashboard/icons";

type BookingTopNavigationProps = {
  active: "rooms" | "bookings" | "schedule";
  onCreateBooking?: () => void;
  signedInName?: string;
};

const navItems = [
  { key: "rooms", href: "/dashboard/rooms", label: "Find a Room" },
  { key: "bookings", href: "/dashboard", label: "My Bookings" },
  { key: "schedule", href: "/dashboard/schedule", label: "Schedule" },
] as const;

export function BookingTopNavigation({ active, onCreateBooking, signedInName }: BookingTopNavigationProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6 lg:gap-12">
          <Link className="text-2xl font-bold tracking-[-0.05em] text-[var(--booking-logo)]" href="/dashboard">
            Reserve
          </Link>
          <nav aria-label="Primary" className="hidden h-20 items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                className={`booking-nav-link ${active === item.key ? "booking-nav-link-active" : ""}`}
                href={item.href}
                key={item.key}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {onCreateBooking ? (
            <button className="booking-pill-button hidden sm:inline-flex" onClick={onCreateBooking} type="button">
              Create Booking
            </button>
          ) : (
            <Link className="booking-pill-button hidden sm:inline-flex" href="/dashboard">
              Create Booking
            </Link>
          )}
          {signedInName ? (
            <div className="hidden rounded-full border border-[var(--booking-border)] bg-white px-4 py-2 text-sm text-[var(--booking-muted)] shadow-sm sm:block">
              Sign in as <span className="font-semibold text-[var(--booking-text)]">{signedInName}</span>
            </div>
          ) : null}
          <form action={logoutAction}>
            <button aria-label="Log out" className="booking-icon-button" type="submit">
              <Icon name="logOut" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
