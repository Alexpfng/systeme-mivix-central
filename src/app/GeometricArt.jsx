const shapes = {
  orbit: (
    <>
      <circle cx="92" cy="88" r="55" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".42" />
      <circle cx="92" cy="88" r="28" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".65" />
      <circle cx="92" cy="88" r="7" fill="currentColor" opacity=".7" />
      <path d="M20 120c35-50 100-73 160-34" fill="none" stroke="currentColor" strokeWidth="2" opacity=".55" />
    </>
  ),
  moon: (
    <>
      <path d="M126 36a48 48 0 1 0 12 88 41 41 0 0 1-12-88Z" fill="currentColor" opacity=".32" />
      <circle cx="52" cy="54" r="3" fill="currentColor" opacity=".7" />
      <circle cx="160" cy="112" r="4" fill="currentColor" opacity=".45" />
      <path d="m42 122 9-18 9 18-9 18Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".55" />
    </>
  ),
  paper: (
    <>
      <path d="m50 34 92 16-12 82-92-16Z" fill="currentColor" opacity=".16" />
      <path d="m72 46 92 16-12 82-92-16Z" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".6" />
      <path d="m91 72 38 7m-41 14 44 7m-47 7 26 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".42" />
    </>
  ),
  stack: (
    <>
      <path d="m42 106 80-31 43 18-81 32Z" fill="currentColor" opacity=".18" />
      <path d="m42 106 42 19v28l-42-19Z" fill="currentColor" opacity=".28" />
      <path d="m84 125 81-32v28l-81 32Z" fill="currentColor" opacity=".5" />
      <path d="M58 81 139 50l27 15-81 31Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
    </>
  ),
  spark: (
    <>
      <path d="m105 26 10 47 44 15-44 15-10 48-10-48-43-15 43-15Z" fill="currentColor" opacity=".25" />
      <circle cx="42" cy="52" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
      <path d="M157 43v24m-12-12h24" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
    </>
  ),
  tree: (
    <>
      <path d="M99 130V80m0 18L67 72m32 13 33-28m-33 9L77 45" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      <circle cx="77" cy="44" r="17" fill="currentColor" opacity=".22" /><circle cx="132" cy="55" r="22" fill="currentColor" opacity=".3" /><circle cx="66" cy="70" r="20" fill="currentColor" opacity=".18" />
    </>
  ),
  path: (
    <>
      <path d="M26 137c28-45 58-40 72-67 13-25 31-37 75-42" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".58" />
      <path d="m157 24 17 4-10 14Z" fill="currentColor" opacity=".6" />
      <circle cx="49" cy="119" r="7" fill="currentColor" opacity=".24" /><circle cx="119" cy="64" r="5" fill="currentColor" opacity=".4" />
    </>
  ),
};

export function GeometricArt({ kind = 'orbit', label = '' }) {
  return (
    <svg className="widget-art" viewBox="0 0 190 160" role="img" aria-label={label} focusable="false">
      <g className="shape-drift">{shapes[kind] || shapes.orbit}</g>
    </svg>
  );
}

export function MivixRobot() {
  return (
    <svg className="mivix-robot" viewBox="0 0 120 120" role="img" aria-label="Robot MIVIX flottant" focusable="false">
      <circle cx="60" cy="60" r="51" fill="var(--paper)" stroke="var(--line)" />
      <path d="M60 20v10" stroke="var(--ink-2)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="17" r="4" fill="var(--terracotta)" />
      <rect x="25" y="34" width="70" height="55" rx="22" fill="var(--ink)" />
      <rect x="33" y="44" width="54" height="32" rx="14" fill="var(--cream)" />
      <circle cx="50" cy="60" r="5" fill="var(--terracotta)" /><circle cx="70" cy="60" r="5" fill="var(--sauge-d)" />
      <path d="M49 69c7 5 15 5 22 0" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 58H15m90 0h-10" stroke="var(--ink-2)" strokeWidth="3" strokeLinecap="round" />
      <path d="M39 88v11m42-11v11" stroke="var(--ink)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
