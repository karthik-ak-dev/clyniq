export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-(family-name:--font-nunito)">{children}</div>
  );
}
