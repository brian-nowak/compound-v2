import SideNav from '@/app/ui/dashboard/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-900 md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="grow p-6 text-gray-900 dark:text-gray-100 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}