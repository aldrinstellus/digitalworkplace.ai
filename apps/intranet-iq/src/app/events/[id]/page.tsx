import { mockEvents } from "@/lib/mockData";
import EventDetail from "./EventDetail";

export function generateStaticParams() {
  return mockEvents.map((e) => ({ id: e.id }));
}

export default function Page() {
  return <EventDetail />;
}
