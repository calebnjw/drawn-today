"use client";

import { useEffect, useState } from "react";
import CheckInForm, { type DrawingEntry, DrawingEntryDraft } from "@/components/check-in-form";

const STORAGE_KEY = "drawn-today-entries-v2";

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

function getLocalDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getNewPrompt(): string {
  return "a house on stilts.";
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isPromptLoaded, setIsPromptLoaded] = useState(false);
  const [entries, setEntries] = useState<DrawingEntry[]>([]);
  const [isEntriesLoaded, setIsEntriesLoaded] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    // load today's prompt. currently hardcoded, but to fetch from API or random word generator in the future.
    try {
      const newPrompt = getNewPrompt();
      setPrompt(newPrompt);
    } catch {
      setPromptError("Failed to load today's prompt.");
    } finally {
      setIsPromptLoaded(true);
    }

    // load saved entries from local storage. filter out valid entries, and display error message if any entries were skipped.
    try {
      const savedEntries = localStorage.getItem(STORAGE_KEY);

      if (savedEntries !== null) {
        const parsedEntries: unknown = JSON.parse(savedEntries);

        if (Array.isArray(parsedEntries)) {
          const validEntries = parsedEntries.filter(isDrawingEntry);
          const skippedCount = parsedEntries.length - validEntries.length;
          console.log(validEntries, skippedCount);

          setEntries(validEntries);

          if (skippedCount > 0) {
            setStorageError(`Some saved check-ins could not be loaded.`);
          }
        }
      }
    } catch {
      setStorageError("The saved check-ins could not be loaded.");
    } finally {
      setIsEntriesLoaded(true);
    }
  }, []);

  function handleSave(draft: DrawingEntryDraft) {
    if (!isEntriesLoaded) return;

    const nextEntry: DrawingEntry = {
      ...draft,
      date: getLocalDate(),
    };

    const updatedEntries = [...entries.filter((entry) => entry.date !== nextEntry.date), nextEntry];

    setEntries(updatedEntries);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
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
            <span className="font-bold tracking-tight">Drawn Today</span> | caleb's daily drawing
            check-ins.
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

            <CheckInForm isPromptLoaded={isPromptLoaded} prompt={prompt} onSave={handleSave} />
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
