"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { copy, type Locale } from "@/lib/i18n";

export function AuthControl({ locale }: { locale: Locale }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key)
    return (
      <Link
        className="btn btn-primary !px-4 !py-2 text-sm"
        href={`/${locale}/sign-in`}
      >
        {copy[locale].signIn}
      </Link>
    );
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="btn btn-primary !px-4 !py-2 text-sm">
            {copy[locale].signIn}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
