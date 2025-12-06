import { InstitutionGroupSkeleton } from '@/app/ui/accounts/institution-group';

export default function Loading() {
  return (
    <main>
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
      </div>

      <div className="mt-6 space-y-6">
        <InstitutionGroupSkeleton />
        <InstitutionGroupSkeleton />
      </div>
    </main>
  );
}
