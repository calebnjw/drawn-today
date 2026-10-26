"use client";

import { useEffect, useState } from "react";
import CheckInForm, { type DrawingEntry, DrawingEntryDraft } from "@/components/check-in-form";

type PromptHistory = Record<string, string>;

const STORAGE_KEY = "drawn-today-entries-v2";
const PROMPT_KEY = "drawn-today-prompt-v1";

function isDrawingEntry(value: unknown): value is DrawingEntry {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
    typeof entry.followedPrompt === "boolean" &&
    typeof entry.topic === "string" &&
    Array.isArray(entry.tools) &&
    entry.tools.every((tool: unknown) => typeof tool === "string")
  );
}

function isPromptHistory(value: unknown): value is PromptHistory {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([date, prompt]) =>
      /^\d{4}-\d{2}-\d{2}$/.test(date) && typeof prompt === "string" && prompt.trim().length > 0,
  );
}

function getLocalDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function loadOrCreatePrompt(today: string): string {
  const rawHistory = localStorage.getItem(PROMPT_KEY);

  const parsedHistory: unknown = rawHistory === null ? {} : JSON.parse(rawHistory);

  if (!isPromptHistory(parsedHistory)) {
    throw new Error("Invalid prompt history.");
  }

  const savedPrompt = parsedHistory[today];

  if (savedPrompt !== undefined) {
    return savedPrompt;
  }

  const newPrompt = getNewPrompt();

  if (newPrompt.trim().length === 0) {
    throw new Error("The generated prompt is empty.");
  }

  const updatedHistory: PromptHistory = {
    ...parsedHistory,
    [today]: newPrompt,
  };

  localStorage.setItem(PROMPT_KEY, JSON.stringify(updatedHistory));

  return newPrompt;
}

function getNewPrompt(): string {
  return "a house on stilts.";
}

export default function Home() {
  const [promptDate, setPromptDate] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isPromptLoaded, setIsPromptLoaded] = useState(false);
  const [entries, setEntries] = useState<DrawingEntry[]>([]);
  const [isEntriesLoaded, setIsEntriesLoaded] = useState(false);
  const [canSaveEntries, setCanSaveEntries] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [storageError, setStorageError] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect -- Initialize state from browser-only storage after hydration. */
  useEffect(() => {
    function loadPrompt() {
      const today = getLocalDate();

      try {
        const todaysPrompt = loadOrCreatePrompt(today);

        lastLoadedDate = today;
        setPrompt(todaysPrompt);
        setPromptDate(today);
        setPromptError("");
      } catch {
        setPrompt("");
        setPromptDate("");
        setPromptError("Failed to load today's prompt.");
      } finally {
        setIsPromptLoaded(true);
      }
    }

    let lastLoadedDate = "";
    loadPrompt();

    function checkDate() {
      if (getLocalDate() !== lastLoadedDate) {
        loadPrompt();
      }
    }

    const intervalId = window.setInterval(checkDate, 60_000);

    window.addEventListener("focus", checkDate);
    document.addEventListener("visibilitychange", checkDate);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkDate);
      document.removeEventListener("visibilitychange", checkDate);
    };
  }, []);

  useEffect(() => {
    // load saved entries from local storage. filter out valid entries, and display error message if any entries were skipped.
    try {
      const rawEntries = localStorage.getItem(STORAGE_KEY);
      const parsedEntries: unknown = rawEntries === null ? [] : JSON.parse(rawEntries);

      if (!Array.isArray(parsedEntries)) {
        throw new Error("Invalid check-in history.");
      }

      const validEntries = parsedEntries.filter(isDrawingEntry);
      const skippedCount = parsedEntries.length - validEntries.length;
      setEntries(validEntries);

      if (skippedCount > 0) {
        setCanSaveEntries(false);
        setStorageError(
          "Some saved check-ins are invalid. Saving is disabled to preserve the original history.",
        );
      } else {
        setCanSaveEntries(true);
        setStorageError("");
      }
    } catch {
      setCanSaveEntries(false);
      setStorageError("The saved check-ins could not be loaded.");
    } finally {
      setIsEntriesLoaded(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleSave(draft: DrawingEntryDraft) {
    const today = getLocalDate();

    if (!canSaveEntries) return;
    if (!isEntriesLoaded) return;

    if (draft.followedPrompt && promptDate !== today) {
      setPromptError("The date changed. Refresh today's prompt before saving.");
      return;
    }

    const nextEntry: DrawingEntry = {
      ...draft,
      date: today,
    };

    const updatedEntries = [...entries.filter((entry) => entry.date !== nextEntry.date), nextEntry];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      setStorageError("");
    } catch {
      setStorageError("Your check-in could not be saved.");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
        <header>
          <h1 className="text-sm">
            <span className="font-bold tracking-tight">Drawn Today</span> | caleb&apos;s daily
            drawing check-ins.
          </h1>
        </header>

        <section>
          {/* Today's prompt goes here */}
          <section
            aria-labelledby="prompt-heading"
            className="rounded-t-xl border border-zinc-200 bg-white p-6"
          >
            <h2 id="prompt-heading" className="text-sm font-medium text-zinc-500">
              Today&apos;s prompt
            </h2>

            {promptError ? (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {promptError}
              </p>
            ) : (
              <p className="mt-3 text-3xl font-semibold">
                {!isPromptLoaded ? "Loading prompt..." : `Draw ${prompt}`}
              </p>
            )}
          </section>

          {/* Check-in form goes here */}
          <section
            aria-labelledby="check-in-heading"
            className="rounded-b-xl border border-zinc-200 bg-white p-6"
          >
            <h2 id="check-in-heading" className="text-sm font-medium text-zinc-500">
              Record today&apos;s drawing
            </h2>

            <CheckInForm
              canSaveEntries={canSaveEntries}
              isPromptLoaded={isPromptLoaded}
              prompt={prompt}
              onSave={handleSave}
            />
          </section>
        </section>

        {/* Recent drawings go here */}
        <section
          aria-labelledby="recent-heading"
          className="rounded-xl border border-zinc-200 bg-white p-6"
        >
          <h2 id="recent-heading" className="text-sm font-medium text-zinc-500">
            Recent drawings
          </h2>

          <div aria-live="polite">
            {storageError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {storageError}
              </p>
            )}
            {!isEntriesLoaded ? (
              <p className="mt-4 text-sm text-zinc-500">Loading your check-in…</p>
            ) : entries.length > 0 ? (
              [...entries]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((entry) => (
                  <article key={entry.date} className="mt-4 rounded-xl border border-zinc-200 p-6">
                    <time dateTime={entry.date} className="text-sm text-zinc-500">
                      {entry.date}
                    </time>

                    <h3 className="mt-2 text-lg font-semibold">{entry.topic}</h3>

                    <p className="mt-2 text-sm text-zinc-600">
                      Tools: {entry.tools.length > 0 ? entry.tools.join(", ") : "None selected"}
                    </p>
                  </article>
                ))
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
                <p className="text-zinc-600">No drawings recorded yet.</p>
                <p className="mt-1 text-sm text-zinc-500">Your saved entries will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
