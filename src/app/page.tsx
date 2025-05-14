import { ImageUploadForm } from '@/components/citylens/ImageUploadForm';
import { CityLensLogo } from '@/components/citylens/CityLensLogo';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary/50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center">
          <CityLensLogo />
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8">
        <ImageUploadForm />
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CityLens. Help make your city better.
          </p>
        </div>
      </footer>
    </div>
  );
}
