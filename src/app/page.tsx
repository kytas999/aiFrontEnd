import ResearchModal from "./components/Modal";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome to Research Planner</h1>
      <ResearchModal />
    </main>
  );
}
