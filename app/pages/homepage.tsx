import { ButtonAdmin } from "~/components/buttonAdmin";
import { ButtonEventOrganizer } from "~/components/buttonEventOrganizer";
import { Footer } from "~/components/footer";
import { Hero } from "~/components/hero";
import { Navbar } from "~/components/navbar";
import { PromotionSection } from "~/components/promotionSection";
import { TicketSection } from "~/components/ticketSection";
import { useAuth } from "../contexts/auth";

export default function Homepage() {
  const { user } = useAuth();

  return (
    <main>
      <Navbar />
      <Hero />
      <TicketSection />
      {(!user || user.role === "user") && <PromotionSection />}
      {user?.role === "eventOrganizer" && (
        <ButtonEventOrganizer />
      )}
      {user?.role === "admin" && (
        <ButtonAdmin />
      )}
      <Footer />
    </main>
  )
}
