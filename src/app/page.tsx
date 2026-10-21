"use client";

import { useEffect, useState } from "react";
import CheckInForm, { type DrawingEntry } from "@/components/check-in-form";

const STORAGE_KEY = "drawn-today-entry";

export default function Home() {
  const [entry, setEntry] = useState<DrawingEntry | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    try {
      const savedEntry = localStorage.getItem(STORAGE_KEY);

      if (savedEntry) {
        const parsedEntry = JSON.parse(savedEntry);

        if (
          parsedEntry !== null &&
          typeof parsedEntry === "object" &&
          typeof parsedEntry.followedPrompt === "boolean" &&
          typeof parsedEntry.customTopic === "string" &&
          Array.isArray(parsedEntry.tools) &&
          parsedEntry.tools.every((tool: unknown) => typeof tool === "string")
        ) {
          setEntry(parsedEntry);
        } else {
          setStorageError("The saved check-in could not be loaded.");
        }
      }
    } catch {
      setStorageError("The saved check-in could not be loaded.");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  function handleSave(nextEntry: DrawingEntry) {
    setEntry(nextEntry);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntry));
      setStorageError("");
    } catch {
      setStorageError("Your check-in is visible, but could not be saved in this browser.");
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

            <p className="mt-3 text-3xl font-semibold">Draw a quiet street corner</p>
          </section>

          {/* Check-in form goes here */}
          <section
            aria-labelledby="check-in-heading"
            className="rounded-b-xl border border-zinc-200 bg-white p-6"
          >
            <h2 id="check-in-heading" className="text-sm font-medium text-zinc-500">
              Record today&apos;s drawing
            </h2>

            {isLoaded ? (
              <CheckInForm onSave={handleSave} />
            ) : (
              <p className="mt-4 text-sm text-zinc-500">Loading your check-in…</p>
            )}

            {storageError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {storageError}
              </p>
            )}
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
            {entry ? (
              <article className="mt-4 rounded-xl border border-zinc-200 p-6">
                <p className="text-sm text-zinc-500">Today&apos;s check-in</p>

                <h3 className="mt-2 text-lg font-semibold">
                  {entry.followedPrompt ? "Draw a quiet street corner" : entry.customTopic}
                </h3>

                <p className="mt-2 text-sm text-zinc-600">
                  Tools: {entry.tools.length > 0 ? entry.tools.join(", ") : "None selected"}
                </p>

                <p className="mt-3 text-sm text-green-700">Check-in saved for this session.</p>
              </article>
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
