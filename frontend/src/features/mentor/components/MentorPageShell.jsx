export default function MentorPageShell({ title, description, children }) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3] mb-1" style={{ color: '#0F172A' }}>
        {title}
      </h1>
      {description && (
        <p className="text-[14px] leading-[1.55] max-w-[560px] mb-2.5" style={{ color: '#64748B' }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
