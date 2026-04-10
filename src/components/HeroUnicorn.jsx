import UnicornScene from 'unicornstudio-react';

export default function HeroUnicorn() {
  return (
    <div className="hero-canvas">
      <UnicornScene
        projectId="ls2GMMfphEx75JbBhSXt"
        width="100%"
        height="100%"
        scale={1}
        dpi={1.5}
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.6/dist/unicornStudio.umd.js"
      />
    </div>
  );
}
