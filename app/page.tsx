import EditCarousel from "@/components/EditCarousel";
import PicksOfTheWeek from "@/components/PicksOfTheWeek";
import WhatsOn from "@/components/WhatsOn";
import FeatureEdit from "@/components/FeatureEdit";
import AlwaysBand from "@/components/AlwaysBand";
import FlodeskForm from "@/components/FlodeskForm";
import { getLatestEdits, getHomepage, getClockCities } from "@/lib/content";

// Render on every request so a newly published edit/product in Sanity appears
// immediately, instead of being frozen into the build-time static page.
export const dynamic = "force-dynamic";

// Order follows Silke's homepage sketch: current edit, Our Picks of the Week,
// What's On, the Men or Beauty feature edit, then the city clocks.
export default async function Home() {
  const [edits, home] = await Promise.all([getLatestEdits(2), getHomepage()]);
  const cities = getClockCities();

  return (
    <>
      <EditCarousel edits={edits} />
      <PicksOfTheWeek {...home.picks} />
      <WhatsOn {...home.whatsOn} />
      <FeatureEdit data={home.feature} />
      <AlwaysBand cities={cities} />
      <FlodeskForm />
    </>
  );
}
