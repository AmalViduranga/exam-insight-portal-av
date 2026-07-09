export function Footer() {
  return (
    <footer className="w-full border-t bg-white py-8 mt-auto shrink-0">
      <div className="container mx-auto px-4 text-center text-slate-500 font-medium">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
          <p className="text-sm">
            Exam Insight Portal © 2026 All rights reserved.
          </p>
          <p className="text-sm">
            Designed by{' '}
            <a
              href="https://www.linkedin.com/in/amal-viduranga-3a681b27b?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 transition-colors font-semibold"
            >
              Amal Viduranga
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
