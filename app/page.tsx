import EditCarousel from "@/components/EditCarousel";
import MenEdit from "@/components/MenEdit";
import AlwaysBand from "@/components/AlwaysBand";
import FlodeskForm from "@/components/FlodeskForm";
import {
  getLatestEdits,
  getMenEdit,
  getClockCities,
} from "@/lib/content";

// Render on every request so a newly published edit/product in Sanity appears
// immediately, instead of being frozen into the build-time static page.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [edits, men] = await Promise.all([
    getLatestEdits(2),
    getMenEdit(),
  ]);
  const cities = getClockCities();

  return (
    <>
      <EditCarousel edits={edits} />
      <MenEdit data={men} />
      <AlwaysBand cities={cities} />
      <FlodeskForm />
    </>
  );
}
