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

// The four bands (current edits, Our Picks of the Week, What's On, the Men or
// Beauty feature edit) run in the order set in the Studio under Homepage >
// Section order; the city clocks and newsletter form always close the page.
export default async function Home() {
  const [edits, home] = await Promise.all([getLatestEdits(2), getHomepage()]);
  const cities = getClockCities();

  return (
    <>
      {home.order.map((key) =>
        key === "edits" ? <EditCarousel key={key} edits={edits} /> :
        key === "picks" ? <PicksOfTheWeek key={key} {...home.picks} /> :
        key === "whatsOn" ? <WhatsOn key={key} {...home.whatsOn} /> :
        <FeatureEdit key={key} data={home.feature} />
      )}
      <AlwaysBand cities={cities} />
      <FlodeskForm />
    </>
  );
}
