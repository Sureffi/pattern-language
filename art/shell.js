// shell.js — shared skeleton for art pieces
// Handles: fonts, reset CSS, nav, vignette, title sequence, controls, canvas + resize

function shell(cfg) {
  const {
    num, title, epigraph, accent = 'rgba(200,200,220,0.35)',
    controls, cursor = 'crosshair',
    prev, next,
    setup // (canvas, ctx, W, H) => { tick, resize? }
  } = cfg

  // inject styles
  const style = document.createElement('style')
  style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&family=Space+Mono:wght@400;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:#06060c;overflow:hidden;cursor:${cursor}}
canvas{display:block;position:fixed;top:0;left:0;width:100%;height:100%}

#sh-nav{
  position:fixed;top:24px;left:24px;z-index:100;
  font:11px 'Space Mono',monospace;letter-spacing:2px;text-transform:uppercase;
  text-decoration:none;color:rgba(255,255,255,0.4);transition:color .3s;
  text-shadow:0 1px 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.5);
}
#sh-nav:hover{color:rgba(255,255,255,0.7)}

#sh-vig{
  position:fixed;top:0;left:0;width:100%;height:100%;
  background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.35) 100%);
  pointer-events:none;z-index:10;
}

#sh-ctrl{
  position:fixed;bottom:56px;left:24px;z-index:50;
  font:12px/1.7 'Space Mono',monospace;
  color:rgba(255,255,255,0.55);pointer-events:none;transition:opacity .8s;
  text-shadow:0 1px 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.5);
}
#sh-ctrl.dimmed{opacity:0.12}
body:hover #sh-ctrl.dimmed{opacity:0.55}

#sh-pn{
  position:fixed;bottom:24px;left:0;right:0;z-index:50;
  display:flex;justify-content:space-between;align-items:center;padding:0 24px;
  pointer-events:none;
}
#sh-pn a{
  font:11px 'Space Mono',monospace;letter-spacing:1.5px;text-transform:uppercase;
  text-decoration:none;color:rgba(255,255,255,0.4);transition:color .3s;
  pointer-events:auto;
  text-shadow:0 1px 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.5);
}
#sh-pn a:hover{color:rgba(255,255,255,0.7)}

#sh-title{
  position:fixed;top:0;left:0;width:100%;height:100%;z-index:200;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:#06060c;transition:opacity 1.5s ease;
}
#sh-title.fade-out{opacity:0}

#sh-num{
  font:400 14px 'Space Mono',monospace;color:${accent};
  letter-spacing:4px;opacity:0;margin-bottom:16px;
  animation:sh-fi .8s ease forwards .5s;
}
#sh-name{
  font:700 clamp(2rem,5vw,3.2rem) 'Space Mono',monospace;color:#e0e0f0;
  letter-spacing:.3em;opacity:0;filter:blur(16px);
  animation:sh-mat 1.2s cubic-bezier(.22,1,.36,1) forwards 1s;
}
#sh-epi{
  font:italic clamp(.9rem,2vw,1.15rem) 'EB Garamond',serif;color:${accent};
  margin-top:20px;opacity:0;animation:sh-fi 1s ease forwards 2s;
}

@keyframes sh-fi{from{opacity:0}to{opacity:1}}
@keyframes sh-mat{
  from{opacity:0;filter:blur(16px);letter-spacing:.3em}
  to{opacity:1;filter:blur(0);letter-spacing:.05em}
}`
  document.head.appendChild(style)

  // build DOM
  document.body.innerHTML = `
<canvas id="c"></canvas>
<div id="sh-vig"></div>
<a id="sh-nav" href="gallery.html">&larr; pattern language</a>
<div id="sh-title">
  <div id="sh-num">${num}</div>
  <div id="sh-name">${title}</div>
  <div id="sh-epi">${epigraph}</div>
</div>
<div id="sh-ctrl">${controls}</div>`

  // piece navigation
  if (prev || next) {
    const nav = document.createElement('nav')
    nav.id = 'sh-pn'
    nav.innerHTML = (prev ? `<a href="${prev.href}">&larr; ${prev.title}</a>` : '<span></span>')
      + (next ? `<a href="${next.href}">${next.title} &rarr;</a>` : '<span></span>')
    document.body.appendChild(nav)
  }

  // title sequence
  const overlay = document.getElementById('sh-title')
  const ctrl = document.getElementById('sh-ctrl')
  setTimeout(() => overlay.classList.add('fade-out'), 4000)
  setTimeout(() => overlay.remove(), 5500)
  setTimeout(() => ctrl.classList.add('dimmed'), 8000)

  const canvas = document.getElementById('c')
  const ctx = canvas.getContext('2d')
  let W = canvas.width = window.innerWidth
  let H = canvas.height = window.innerHeight

  const piece = setup(canvas, ctx, W, H)

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth
    H = canvas.height = window.innerHeight
    if (piece && piece.resize) piece.resize(W, H)
  })

  ctx.fillStyle = '#06060c'
  ctx.fillRect(0, 0, W, H)

  if (piece && piece.tick) {
    ;(function loop() {
      piece.tick(W, H)
      requestAnimationFrame(loop)
    })()
  }

  return { canvas, ctx, getSize: () => [W, H] }
}
