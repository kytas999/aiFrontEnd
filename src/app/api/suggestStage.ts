export async function suggestStage({
  question,
  existingJourneyStages,
  objective,
}: {
  question: string;
  existingJourneyStages: string[];
  objective: string;
}) {
  console.log("Suggesting stage for question:", question);
  console.log("Existing journey stages:", existingJourneyStages);
  console.log("Objective:", objective);
  
  const res = await fetch("https://aiback-production.up.railway.app/llm/suggest", {
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