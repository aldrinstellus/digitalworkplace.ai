import { mockNewsPosts } from "@/lib/mockData";
import NewsDetail from "./NewsDetail";

export function generateStaticParams() {
  return mockNewsPosts.map((p) => ({ id: p.id }));
}

export default function Page() {
  return <NewsDetail />;
}
