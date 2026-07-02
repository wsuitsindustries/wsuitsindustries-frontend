import ShortLogo from "../brand/ShortLogo"

interface ErrorFallbackProps {
  error: Error
  resetError?: () => void
}

export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center gap-6 px-4 text-center bg-white dark:bg-black">
      <ShortLogo className="h-16 w-auto" />
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {error.message || "An unexpected error occurred"}
        </p>
      </div>
      {resetError && (
        <button
          onClick={resetError}
          className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent px-8 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:border-gray-400 dark:hover:border-gray-400"
        >
          Try again
        </button>
      )}
      <a
        href="/"
        className="text-sm text-accent hover:underline"
      >
        Back to home
      </a>
    </section>
  )
}
