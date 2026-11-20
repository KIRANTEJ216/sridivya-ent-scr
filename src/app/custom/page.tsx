import { parseCustomParams } from "@/lib/customizer";
import { Configurator } from "@/components/configurator-client";

// server component: reads searchParams at request time so crawlers
// get fully rendered HTML (client-only Suspense rendered an empty shell)
export default async function CustomPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const initial = parseCustomParams(raw);
  return <Configurator initial={initial} />;
}
