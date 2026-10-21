"use client";

import { useState } from "react";

export type DrawingEntry = {
  followedPrompt: boolean;
  customTopic: string;
  tools: string[];
};

type CheckInFormProps = {
  onSave: (entry: DrawingEntry) => void;
};

export default function CheckInForm({ onSave }: CheckInFormProps) {
  const [followedPrompt, setFollowedPrompt] = useState(true);
  const [customTopic, setCustomTopic] = useState("");
  const [tools, setTools] = useState<string[]>([]);

  const canSave = (followedPrompt || customTopic.trim().length > 0) && tools.length > 0;

  function toggleTool(tool: string) {
    setTools((currentTools) => {
      console.log("selected tools: ", [...tools]);

      if (currentTools.includes(tool)) {
        return currentTools.filter((item) => item !== tool);
      }

      return [...currentTools, tool];
    });
  }

  return (
    <form
      className="mt-4 space-y-5"
      onSubmit={(event) => {
        event.preventDefault();

        if (!canSave) return;

        onSave({
          followedPrompt,
          customTopic: followedPrompt ? "" : customTopic.trim(),
          tools: [...tools],
        });
      }}
    >
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="followedPrompt"
          checked={followedPrompt}
          onChange={(event) => setFollowedPrompt(event.target.checked)}
          className="h-4 w-4"
        />
        <span>I followed the prompt.</span>
      </label>

      {!followedPrompt && (
        <div>
          <label htmlFor="custom-topic" className="text-sm font-medium text-zinc-500">
            What did I draw?
          </label>

          <input
            id="custom-topic"
            name="customTopic"
            type="text"
            required
            value={customTopic}
            onChange={(event) => setCustomTopic(event.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
          />
        </div>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-zinc-500">Tools used</legend>

        <div className="mt-2 flex flex-wrap gap-2">
          {["Pen", "Pencil", "Digital"].map((tool) => (
            <label
              key={tool}
              className="flex items-center gap-2 rounded-md border border-dashed border-zinc-200 bg-zinc-50 px-2 py-1"
            >
              <input
                type="checkbox"
                name="tools"
                value={tool}
                checked={tools.includes(tool)}
                onChange={() => toggleTool(tool)}
              />
              {tool}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={!canSave}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Check-in!
      </button>
    </form>
  );
}
