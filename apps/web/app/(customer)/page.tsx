import { Hero } from "@/components/customer/Hero";
import { MenuGrid } from "@/components/customer/MenuGrid";
import { ReservationForm } from "@/components/customer/ReservationForm";
import { ChatWidget } from "@/components/customer/ChatWidget";
import { GrowthWidgets } from "@/components/customer/GrowthWidgets";

export default function HomePage() {
  return (
    <div className="space-y-2xl">
      <Hero />
      <MenuGrid />
      <GrowthWidgets />
      <ReservationForm />
      <ChatWidget />
    </div>
  );
}
