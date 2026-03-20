export function AuthPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 mb-4">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">{title}</h1>
            {description && (
              <p className="text-muted-foreground text-balance">{description}</p>
            )}
          </div>

          <div className="flex justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}
