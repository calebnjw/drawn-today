import Image from "next/image";

export default function Home() {
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
            aria-labelledby="check-in-form"
            className="rounded-b-xl border border-zinc-200 bg-white p-6"
          >
            <h2 className="text-sm font-medium text-zinc-500">Record today's drawing</h2>

            <form action="" className="mt-4 space-y-5">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="followedPrompt" defaultChecked className="h-4 w-4" />
                <span>I followed the prompt.</span>
              </label>

              <div>
                <label htmlFor="custom-topic" className="block text-sm font-medium">
                  Custom topic
                </label>

                <input
                  id="custom-topic"
                  name="custom-topic"
                  type="text"
                  placeholder="What did you draw?"
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
                />
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Tools used</legend>

                <div className="mt-2 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="tools" value="pen" />
                    Pen
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="tools" value="pencil" />
                    Pencil
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="tools" value="digital" />
                    Digital
                  </label>
                </div>
              </fieldset>

              <button
                type="submit"
                disabled
                className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Check-in!
              </button>
            </form>
          </section>
        </section>

        {/* Recent drawings go here */}
        <section
          aria-labelledby="recent-heading"
          className="rounded-xl border border-zinc-200 bg-white p-6"
        >
          <h2 id="recent-heading" className="text-xl font-semibold">
            Recent drawings
          </h2>

          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
            <p className="text-zinc-600">No drawings recorded yet.</p>

            <p className="mt-1 text-sm text-zinc-500">Your saved entries will appear here.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
