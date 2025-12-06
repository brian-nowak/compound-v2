import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import UserSwitcher from '@/app/ui/user-switcher';
import CreateUserButton from '@/app/ui/dashboard/create-user-button';
import ThemeToggle from '@/app/ui/dashboard/theme-toggle';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col bg-white px-3 py-4 dark:bg-gray-900 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 dark:bg-blue-700 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-gray-800 md:block"></div>
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
