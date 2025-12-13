import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import UserSwitcher from '@/app/ui/user-switcher';
import CreateUserButton from '@/app/ui/dashboard/create-user-button';
import ThemeToggle from '@/app/ui/dashboard/theme-toggle';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col bg-card border-r border-border px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-center justify-center rounded-md p-4 md:h-40"
        href="/"
      >
        <div className="w-full max-w-48">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-muted md:block"></div>
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <div className="hidden md:block">
          <CreateUserButton />
        </div>
        <div className="hidden md:block">
          <UserSwitcher />
        </div>
      </div>
    </div>
  );
}
