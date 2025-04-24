export async function suggestStage({
  question,
  existingJourneyStages,
  objective,
}: {
  question: string;
  existingJourneyStages: string[];
  objective: string;
}) { 
  const res = await fetch("https://aibackend-production-bf6e.up.railway.app/llm/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, objective, existingJourneyStages }),
  });

  if (!res.ok) {
    throw new Error("Failed to get stage");
  }

  const data = await res.json();
  
  return data.suggestedStage;
}