import { Link } from "react-router-dom"
import ShortLogo from "../brand/ShortLogo"

export default function NotFound() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white dark:bg-black overflow-hidden">
      <div className="mx-auto max-w-lg px-4 text-center">
        <ShortLogo className="mx-auto h-20 w-auto text-gray-900 dark:text-white" />
        <h1 className="mt-8 text-8xl font-bold tracking-tight text-gray-900 dark:text-white">
          404
        </h1>
        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
          This page doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-10 inline-block rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent px-12 py-4 text-base font-medium text-gray-700 dark:text-gray-300 transition-all hover:border-gray-900 dark:hover:border-white"
        >
          Go home
        </Link>
      </div>
    </section>
  )
}
