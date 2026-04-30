import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cursor.js Pro",
  description: "Advanced features for Cursor.js",
};

export default function ProLandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          Cursor.js Pro
        </h1>
        <p className="text-lg leading-8 text-muted-foreground mb-8">
          Take your cursor interactions to the next level with advanced plugins,
          premium effects, and priority support.
        </p>
        <div className="flex items-center justify-center gap-x-6">
          <a
            href="#"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Get Started
          </a>
          <Link href="/docs" className="text-sm font-semibold leading-6">
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Feature 1 */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Advanced Trails</h3>
          <p className="text-muted-foreground">
            Create complex, multi-layered cursor trails with custom physics and
            particle systems.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Magnetic Elements</h3>
          <p className="text-muted-foreground">
            Easily create magnetic buttons and elements that attract the cursor
            with realistic physics.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Priority Support</h3>
          <p className="text-muted-foreground">
            Get direct access to the core team for help with implementation and
            custom effects.
          </p>
        </div>
      </div>
    </div>
  );
}
