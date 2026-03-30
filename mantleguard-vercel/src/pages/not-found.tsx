import { Shield } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-bg">
      <div className="text-center space-y-4">
        <Shield className="w-16 h-16 text-primary mx-auto opacity-50" />
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <Link href="/" className="text-primary hover:underline">
          Return to MantleGuard
        </Link>
      </div>
    </div>
  );
}
