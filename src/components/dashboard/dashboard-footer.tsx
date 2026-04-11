export function DashboardFooter() {
  return (
    <footer className="hidden lg:block">
      <div className="flex items-center gap-3 text-md leading-normal">
        <span className="font-bold text-black">Copyright &copy; 2026 Hormonia</span>
        <div className="flex gap-4 font-normal text-dark-grey">
          <a href="#" className="hover:text-black">Privacy Policy</a>
          <a href="#" className="hover:text-black">Terms and conditions</a>
          <a href="#" className="hover:text-black">Contact</a>
        </div>
        <div className="flex-1" />
        <div className="flex gap-3">
          <a href="#" className="text-dark-grey hover:text-black" aria-label="Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#" className="text-dark-grey hover:text-black" aria-label="X">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4l6.5 7.5M20 4l-6.5 7.5m0 0L20 20h-4l-4.5-5.5m2-3L4 20h4l4.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#" className="text-dark-grey hover:text-black" aria-label="Instagram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
          </a>
          <a href="#" className="text-dark-grey hover:text-black" aria-label="YouTube">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.35 29 29 0 0 0-.46-5.33Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#" className="text-dark-grey hover:text-black" aria-label="LinkedIn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2V9ZM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
