import { redirect } from 'next/navigation';

export default function Home() {
  // With basePath: /dtq, internal routes don't need the prefix
  redirect('/dashboard');
}
