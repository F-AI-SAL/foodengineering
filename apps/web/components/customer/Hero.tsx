import Link from "next/link";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { Badge } from "@/components/design-system/Badge";

export function Hero() {
  return (
    <section className="grid gap-xl px-lg py-2xl lg:grid-cols-2">
      <div className="flex flex-col justify-center gap-md">
        <Badge label="Easy Order Flow" variant="primary" size="sm" />
        <h1 className="text-4xl font-semibold">
          Food Engineering makes ordering simple for everyone.
        </h1>
        <p className="text-md text-muted">
          Choose food, add to cart, pay, and track delivery. Clear steps for kids, parents, and busy professionals.
        </p>
        <div className="flex flex-wrap gap-sm">
          <Button variant="primary" size="lg">
            Order Now
          </Button>
          <Button variant="outline" size="lg">
            See Menu
          </Button>
        </div>
        <div className="flex flex-wrap gap-sm text-sm text-muted">
          <span className="rounded-full bg-surface px-sm py-xs">3-step order</span>
          <span className="rounded-full bg-surface px-sm py-xs">Live delivery tracking</span>
          <span className="rounded-full bg-surface px-sm py-xs">Help chat anytime</span>
        </div>
      </div>
      <div className="flex items-center">
        <Card
          title="Order in 3 steps"
          subtitle="Simple and fast for everyone"
          className="w-full"
          action={
            <Link href="/menu" className="focus-ring rounded-full px-sm py-xs text-sm font-medium text-primary">
              Start now
            </Link>
          }
        >
          <div className="grid gap-md sm:grid-cols-2">
            <div className="subtle-panel p-md">
              <p className="text-sm font-semibold">1. Pick your food</p>
              <p className="text-xs text-muted">Tap a category and choose items.</p>
            </div>
            <div className="subtle-panel p-md">
              <p className="text-sm font-semibold">2. Add to cart</p>
              <p className="text-xs text-muted">See price and options clearly.</p>
            </div>
            <div className="subtle-panel p-md">
              <p className="text-sm font-semibold">3. Pay & track</p>
              <p className="text-xs text-muted">We show live delivery updates.</p>
            </div>
            <div className="subtle-panel p-md">
              <p className="text-sm font-semibold">Need help?</p>
              <p className="text-xs text-muted">Chat is always available.</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
