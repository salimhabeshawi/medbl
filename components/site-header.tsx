import Link from "next/link";
import { getCurrentUserWithRole, isModerator } from "@/lib/moderation";
import { signOut } from "@/app/actions";
import { MyProfileLink } from "./my-profile-link";

export async function SiteHeader() {
  const user = await getCurrentUserWithRole();
  const isStaff = user ? isModerator(user.role) : false;

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Medbl
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300">
          <Link href="/" className="hover:text-zinc-950 dark:hover:text-white">
            Home
          </Link>
          <Link href="/poets" className="hover:text-zinc-950 dark:hover:text-white">
            Poets
          </Link>
          <Link href="/poems" className="hover:text-zinc-950 dark:hover:text-white">
            Poems
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link
                href="/submit"
                className="rounded-md px-2 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Submit a poem
              </Link>
              <MyProfileLink className="rounded-md px-2 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800" />
              {isStaff ? (
                <Link
                  href="/moderate"
                  className="rounded-md px-2 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Moderate
                </Link>
              ) : null}
              <Link
                href="/favorites"
                className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              >
                Favorites
              </Link>
              <span className="max-w-[200px] truncate text-zinc-600 dark:text-zinc-300">
                {user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border px-3 py-1.5 font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border px-3 py-1.5 font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white transition hover:bg-zinc-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
