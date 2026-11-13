// Fixed background layers: gradient sky, moving perspective grid floor, scan lines.
export default function Background() {
  return (
    <>
      <div className="sys-sky" aria-hidden="true" />
      <div className="sys-floor-wrap" aria-hidden="true">
        <div className="sys-floor" />
      </div>
      <div className="sys-scan" aria-hidden="true" />
    </>
  );
}
