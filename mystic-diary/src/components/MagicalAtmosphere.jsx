/*
 * Mystic Diary
 * © 2026 Saurav Raj
 * All rights reserved.
 */
function MagicalAtmosphere() {
  return <div className="atmosphere" aria-hidden="true">
    <div className="light-rays" /><div className="fog fog-left" /><div className="fog fog-right" />
    <div className="atmosphere-glow atmosphere-glow-warm" /><div className="atmosphere-glow atmosphere-glow-cool" />
    <div className="particle-field">{Array.from({ length: 30 }, (_, index) => <span key={index} className="particle" style={{ left: `${(index * 37 + 7) % 96}%`, bottom: `${(index * 19 + 9) % 85}%`, animationDelay: `${index * -0.57}s`, animationDuration: `${11 + (index % 7)}s` }} />)}</div>
    <div className="atmosphere-vignette" />
  </div>;
}

export default MagicalAtmosphere;
