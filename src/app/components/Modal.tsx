"use client";

import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTrigger, DialogTitle } from "@radix-ui/react-dialog";
import { useState, useRef, useEffect } from "react";
import { suggestStage } from '../api/suggestStage';
import { ResearchQuestion } from '../types/question.type';

export default function ResearchModal() {
  const [open, setOpen] = useState(false);
  const [objective, setObjective] = useState("");
  const [questions, setQuestions] = useState<ResearchQuestion[]>([
    {
      id: 1,
      question: "",
      stage: "",
      confirmed: false,
      loading: false,
      error: null,
      disabled: true,
      manuallyEditing: false,
    },
  ]);
  const [allStages, setAllStages] = useState<string[]>([]);
  const [newStage, setNewStage] = useState("");
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState<number | null>(null);
  const stageInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].question = value;
    updated[index].stage = "";
    updated[index].confirmed = false;
    updated[index].disabled = true;
    updated[index].error = null;
    updated[index].manuallyEditing = false;
    setQuestions(updated);
  };

  const handleQuestionKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const current = questions[index];
      if (
        current.question.trim() &&
        !current.confirmed &&
        !current.loading &&
        !current.manuallyEditing
      ) {
        await generateStage(index);
      }
    }
  };

  const handleStageChange = (index: number, value: string) => {
    const updated = [...questions];
    const prevStage = updated[index].stage;
    updated[index].stage = value;
    updated[index].confirmed = false;
    updated[index].manuallyEditing = true;
    if (updated[index].error) updated[index].error = null;
    if (prevStage !== value && allStages.includes(prevStage)) {
      setAllStages((prev) => prev.filter((s) => s !== prevStage));
    }
    setQuestions(updated);
  };

  const confirmStage = (index: number) => {
    const updated = [...questions];
    if (updated[index].stage.trim() !== "") {
      updated[index].confirmed = true;
      if (!allStages.includes(updated[index].stage)) {
        setAllStages((prev) => [...prev, updated[index].stage]);
      }
    } else {
      updated[index].error = "Enter stage manually.";
    }
    setQuestions(updated);
    setDropdownOpenIndex(null);
  };

  const enableEditStage = (index: number) => {
    const updated = [...questions];
    updated[index].confirmed = false;
    updated[index].manuallyEditing = true;
    updated[index].disabled = false;
    setQuestions(updated);
    setTimeout(() => {
      stageInputs.current[index]?.focus();
    }, 0);
  };

  const generateStage = async (index: number) => {
    const updated = [...questions];
    updated[index].loading = true;
    updated[index].error = null;
    updated[index].manuallyEditing = false;
    setQuestions([...updated]);

    try {
      const existingJourneyStages = updated
        .filter((_, i) => i !== index)
        .map((q) => q.stage)
        .filter(Boolean);

      const stage = await suggestStage({
        question: updated[index].question,
        objective,
        existingJourneyStages,
      });

      if (!stage || stage.trim() === "") throw new Error("Empty result");

      updated[index].stage = stage;
      updated[index].confirmed = true;
      updated[index].disabled = true;

      if (!allStages.includes(stage)) {
        setAllStages((prev) => [...prev, stage]);
      }
    } catch (err) {
      console.error("Error generating stage:", err);
      updated[index].error = "Enter stage manually.";
      updated[index].disabled = false;
    } finally {
      updated[index].loading = false;
      setQuestions([...updated]);
    }
  };

  useEffect(() => {
    const last = questions[questions.length - 1];
    if (last.question.trim() !== "") {
      setQuestions((prev) => [
        ...prev,
        {
          id: Date.now(),
          question: "",
          stage: "",
          confirmed: false,
          loading: false,
          error: null,
          disabled: true,
          manuallyEditing: false,
        },
      ]);
    }
  }, [questions]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
        + Add Research Question
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-20" />
        <DialogContent className="fixed left-1/2 top-1/2 z-30 h-[92vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-white shadow-xl focus:outline-none animate-fadeIn">
          <DialogTitle className="sr-only">Add Research Questions</DialogTitle>

          <form className="flex h-full flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mb-3 flex items-center justify-between border-b border-gray-200 px-4 py-4">
                <input
                  className="peer block w-full rounded-md border-none p-0 text-xl font-semibold text-gray-900 placeholder:text-gray-500 placeholder:font-normal focus:outline-none"
                  placeholder="Name your Research Objective"
                  name="name"
                  autoComplete="off"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ml-2 rounded-full p-1 hover:bg-gray-100 text-gray-500"
                >✕</button>
              </div>

              <div className="px-4">
                <div className="text-sm font-medium text-gray-900 mb-2">Research Brief</div>
                <div className="grid grid-cols-10 border-b border-gray-200 text-sm font-normal text-gray-500 pb-2">
                  <div className="col-span-7">Research Questions</div>
                  <div className="col-span-3">Journey Stage</div>
                </div>
                <div className="space-y-2 pt-2">
                  {questions.map((q, index) => (
                    <div key={q.id} className="relative grid grid-cols-10 items-start gap-2 border-b border-gray-100 py-1 text-sm min-h-[60px]">
                      <textarea
                        placeholder="Paste or type your research questions here"
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        onKeyDown={(e) => handleQuestionKeyDown(e, index)}
                        className="col-span-7 resize-none border-0 py-1 text-gray-900 focus:outline-none"
                        rows={1}
                      />
                      <div className="col-span-3 relative">
                        {q.confirmed ? (
                          <div className="inline-flex h-[34px] items-center gap-1 rounded-md bg-green-100 border border-green-700 text-green-700 px-2 text-xs">
                            {q.stage}
                            <button
                              type="button"
                              onClick={() => enableEditStage(index)}
                              className="text-sm leading-none ml-1"
                            >✎</button>
                          </div>
                        ) : q.error || q.manuallyEditing ? (
                          <div className="relative">
                            <input
                              ref={(el) => {
                                stageInputs.current[index] = el;
                              }}
                              value={q.stage}
                              onFocus={() => setDropdownOpenIndex(index)}
                              onChange={(e) => handleStageChange(index, e.target.value)}
                              onBlur={() => confirmStage(index)}
                              className="w-full mb-1 border border-gray-400 rounded-md px-2 py-1 text-sm text-gray-900 focus:outline-none"
                            />
                            {dropdownOpenIndex === index && allStages.length > 0 && (
                              <div className="absolute z-10 top-full left-0 mt-1 w-full bg-white border border-gray-400 rounded-md shadow-md max-h-[120px] overflow-auto">
                                <div className="flex flex-wrap px-2 py-1 gap-1">
                                  {allStages.map((stage, i) => (
                                    <button
                                      type="button"
                                      key={i}
                                      onMouseDown={() => handleStageChange(index, stage)}
                                      className="inline-flex items-center gap-1 rounded-md bg-green-100 border border-green-700 text-green-700 px-2 py-1 text-xs"
                                    >{stage}</button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : !q.loading && q.question ? (
                          <button
                            type="button"
                            onClick={() => generateStage(index)}
                            className="text-xs text-blue-600 hover:underline"
                          >+ Add</button>
                        ) : q.loading ? (
                          <div className="text-xs text-gray-600">Loading...</div>
                        ) : null}
                        {q.error && (
                          <div className="mt-1 text-xs text-red-500 left-0 w-full">{q.error}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">All Stages</div>
                    <div className="flex flex-wrap gap-2">
                      {allStages.map((stage, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-md bg-green-100 border border-green-700 text-green-700 px-2 py-1 text-xs">
                          {stage}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={newStage}
                        onChange={(e) => setNewStage(e.target.value)}
                        placeholder="Add new stage"
                        className="border border-gray-400 rounded px-2 py-1 text-sm text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newStage.trim() && !allStages.includes(newStage)) {
                            setAllStages((prev) => [...prev, newStage]);
                            setNewStage("");
                          }
                        }}
                        className="bg-blue-500 text-white rounded px-3 py-1 text-sm"
                      >Add</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 flex justify-between gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center border border-gray-300 text-gray-700 bg-white rounded-md px-4 py-2 text-sm hover:bg-gray-50"
              >Save for later</button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md text-white px-4 py-2 text-sm bg-[#1E56B8] hover:bg-[#163F8C] focus:outline focus:outline-[rgba(207,_219,_231,_0.35)]"
              >Next: Add interviews</button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}