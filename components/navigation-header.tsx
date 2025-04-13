import Link from "next/link"

export function NavigationHeader({ currentLibrary }: { currentLibrary: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-600"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Examples</span>
        </Link>
      </div>

      <div className="text-lg font-semibold">Workflow Builder with {currentLibrary}</div>

      <div className="flex space-x-2">
        <button className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
          Download
        </button>
        <button className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
          Layout
        </button>
      </div>
    </div>
  )
}
