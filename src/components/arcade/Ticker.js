// Scrolling strip across the top of the screen.
// The items are rendered twice so the loop is seamless; the copy is hidden from screen readers.
export default function Ticker({ items }) {
  const list = items.length ? items : ['The System online'];
  let row = list;
  while (row.length < 6) row = row.concat(list);
  return (
    <div className="sys-ticker">
      <div className="sys-ticker-track">
        {row.map((text, i) => (
          <span key={`a${i}`}>{text}</span>
        ))}
        {row.map((text, i) => (
          <span key={`b${i}`} aria-hidden="true">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
