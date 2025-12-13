import Image from 'next/image';

export default function AcmeLogo() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Image
        src="/compound-no-background.png"
        alt="Compound Logo"
        width={300}
        height={100}
        className="h-auto w-full max-w-full object-contain"
        priority
      />
    </div>
  );
}
