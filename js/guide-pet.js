/* No third-party runtime: guide stays available independently of the theme. */
(() => {
  'use strict';
  if (document.getElementById('guide-pet')) return;
  const pet = document.createElement('aside');
  pet.id = 'guide-pet';
  pet.setAttribute('aria-label', '小栈，博客阅读向导');
  pet.innerHTML = `
    <section class="gp-panel" id="gp-panel" aria-label="小栈的引导菜单" hidden>
      <div class="gp-heading"><strong>小栈 <span aria-hidden="true">/ᐠ · · ᐟ\\</span></strong><button class="gp-close" aria-label="收起引导菜单">×</button></div>
      <p class="gp-copy"></p>
      <div class="gp-actions">
        <button class="gp-primary" data-action="search">搜索文章</button>
        <a href="/archives/">文章归档 ↗</a>
        <button data-action="random">随便读一篇</button>
        <button data-action="top">回到顶部 ↑</button>
      </div>
      <div class="gp-foot"><span class="gp-status">陪你读一点，学一点。</span><button class="gp-rest">让小栈休息</button></div>
      <div class="gp-progress" aria-hidden="true"><span></span></div>
    </section>
    <button class="gp-launch" aria-expanded="false" aria-controls="gp-panel" aria-label="打开小栈阅读向导">
      <span class="gp-cat" aria-hidden="true"><i class="gp-ear"></i><i class="gp-ear right"></i><span class="gp-face"><i class="gp-eye"></i><i class="gp-eye right"></i><i class="gp-nose"></i></span><i class="gp-paw"></i><i class="gp-paw right"></i></span>
      <span class="gp-name" aria-hidden="true">&lt; 小栈 /&gt;</span>
    </button>`;
  document.body.appendChild(pet);
  const panel = pet.querySelector('.gp-panel');
  const launch = pet.querySelector('.gp-launch');
  const article = document.querySelector('.post-body');
  const isArticle = /\/\d{8}\/\d+\//.test(location.pathname);
  const copy = pet.querySelector('.gp-copy');
  copy.textContent = isArticle ? '慢慢读，我陪着你。想换个话题，也可以找找其他文章。' : '你好，我是小栈。想找一篇前端笔记？我来帮你带路。';
  const preference = 'blog-guide-resting';
  function save(value) { try { localStorage.setItem(preference, value); } catch (_) { /* Storage can be disabled. */ } }
  function rest(value) {
    pet.classList.toggle('gp-sleep', value);
    pet.querySelector('.gp-name').textContent = value ? '唤醒小栈' : '< 小栈 />';
    launch.setAttribute('aria-label', value ? '唤醒小栈阅读向导' : '打开小栈阅读向导');
  }
  try { rest(localStorage.getItem(preference) === '1'); } catch (_) {}
  function toggle(open, focus) {
    panel.hidden = !open;
    launch.setAttribute('aria-expanded', String(open));
    if (focus) (open ? pet.querySelector('.gp-close') : launch).focus();
    if (open) progress();
  }
  launch.addEventListener('click', () => { rest(false); save('0'); toggle(panel.hidden, true); });
  pet.querySelector('.gp-close').addEventListener('click', () => toggle(false, true));
  pet.querySelector('.gp-rest').addEventListener('click', () => { rest(true); save('1'); toggle(false, true); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) toggle(false, true); });
  document.addEventListener('click', e => { if (!pet.contains(e.target) && !panel.hidden) toggle(false, false); });
  pet.querySelector('[data-action="top"]').addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    toggle(false, true);
  });
  pet.querySelector('[data-action="search"]').addEventListener('click', () => {
    const trigger = document.querySelector('.popup-trigger');
    if (trigger) { toggle(false, false); trigger.click(); }
    else { location.assign('/archives/'); }
  });
  let routes;
  pet.querySelector('[data-action="random"]').addEventListener('click', async e => {
    const button = e.currentTarget;
    button.disabled = true;
    button.textContent = '找一找…';
    try {
      if (!routes) {
        const response = await fetch('/js/guide-posts.json');
        if (!response.ok) throw new Error('Unavailable');
        routes = await response.json();
      }
      const choices = routes.filter(url => typeof url === 'string' && /^\/[^/]/.test(url) && !url.includes('\\') && decodeURI(url) !== decodeURI(location.pathname));
      if (!choices.length) throw new Error('No articles');
      location.assign(choices[Math.floor(Math.random() * choices.length)]);
    } catch (_) { copy.textContent = '暂时没找到文章，试试「文章归档」吧。'; }
    finally { button.disabled = false; button.textContent = '随便读一篇'; }
  });
  function progress() {
    if (!isArticle || !article) return;
    const rect = article.getBoundingClientRect();
    const length = rect.height - innerHeight;
    const percent = length <= 0 ? (rect.top < innerHeight ? 100 : 0) : Math.round(Math.max(0, Math.min(1, -rect.top / length)) * 100);
    pet.querySelector('.gp-status').textContent = percent === 100 ? '读到这里，辛苦啦。' : `阅读进度 ${percent}%`;
    pet.querySelector('.gp-progress span').style.width = `${percent}%`;
  }
  pet.querySelector('.gp-progress').hidden = !isArticle;
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (panel.hidden || scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { progress(); scheduled = false; });
  }, { passive:true });
})();
