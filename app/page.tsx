import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="mb-8 text-3xl font-bold">Workflow Builder Examples</h1>
      <p className="mb-8 text-center text-gray-600 max-w-2xl">
        Three implementations of the same workflow builder using different drag and drop libraries. Each implementation
        allows you to drag nodes from the sidebar and drop them on edge connections.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LibraryCard
          title="React DnD"
          description="Low-level drag and drop library with fine-grained control"
          href="/react-dnd"
          color="bg-blue-500"
        />
        <LibraryCard
          title="DnD Kit"
          description="Modern, accessible drag and drop library with a simpler API"
          href="/dnd-kit"
          color="bg-purple-500"
        />
        <LibraryCard
          title="Hello Pangea DnD"
          description="Component-based drag and drop with smooth animations"
          href="/hello-pangea"
          color="bg-green-500"
        />
      </div>
    </main>
  )
}

function LibraryCard({
  title,
  description,
  href,
  color,
}: {
  title: string
  description: string
  href: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mb-4`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8L10 16L6 12" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-center text-gray-600">{description}</p>
      <div className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200">
        View Example
      </div>
    </Link>
  )
}
