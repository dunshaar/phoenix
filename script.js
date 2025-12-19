(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav
  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');

  function closeNav() {
    if (!navToggle || !navMenu) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  function openNav() {
    if (!navToggle || !navMenu) return;
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeNav() : openNav();
    });

    // Close on link click
    $$('.nav__link, .nav__cta', navMenu).forEach((a) => {
      a.addEventListener('click', () => closeNav());
    });

    // Close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (!navMenu.classList.contains('is-open')) return;
      const t = e.target;
      if (t === navToggle || navToggle.contains(t) || navMenu.contains(t)) return;
      closeNav();
    });

    // ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

  // Tabs
  $$('[data-tabs]').forEach((tabs) => {
    const buttons = $$('[data-tab]', tabs);
    const panes = $$('[data-pane]', tabs);

    function activate(id) {
      buttons.forEach((b) => {
        const on = b.getAttribute('data-tab') === id;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panes.forEach((p) => p.classList.toggle('is-active', p.getAttribute('data-pane') === id));
    }

    buttons.forEach((b) => {
      b.addEventListener('click', () => activate(b.getAttribute('data-tab')));
    });
  });

  // Video modal
  const modal = $('#videoModal');
  const frame = $('#videoFrame');
  const videoTag = $('#videoTag');

  function openModal(url) {
  if (!modal) return;

  const isMp4 = typeof url === 'string' && /\.mp4(\?|#|$)/i.test(url);

  if (isMp4) {
    if (!videoTag) return;
    if (frame) { frame.classList.add('is-off'); frame.src = ''; }
    videoTag.classList.add('is-on');
    videoTag.src = url;
    videoTag.currentTime = 0;
    videoTag.play?.().catch(() => {});
  } else {
    if (!frame) return;
    if (videoTag) { videoTag.classList.remove('is-on'); videoTag.pause?.(); videoTag.removeAttribute('src'); videoTag.load?.(); }
    frame.classList.remove('is-off');
    frame.src = url;
  }

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
  function closeModal() {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');

  if (frame) {
    frame.src = '';
    frame.classList.remove('is-off');
  }
  if (videoTag) {
    videoTag.pause?.();
    videoTag.classList.remove('is-on');
    videoTag.removeAttribute('src');
    videoTag.load?.();
  }

  document.body.style.overflow = '';
}

  if (modal) {
    modal.addEventListener('click', (e) => {
      const t = e.target;
      if (t && (t.hasAttribute('data-close') || t.closest('[data-close]'))) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  $$('[data-video]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-video');
      if (url) openModal(url);
    });
  });

  // Toast
  const toast = $('#toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-open'), 4200);
  }

  // Form (Formspree)
  const form = $('#joinForm');
  const errFor = (name) => $(`[data-err="${name}"]`);

  function setErr(name, msg) {
    const el = errFor(name);
    if (el) el.textContent = msg || '';
  }

  function validate() {
    let ok = true;

    const name = $('#name')?.value?.trim() || '';
    const email = $('#email')?.value?.trim() || '';
    const discord = $('#discord')?.value?.trim() || '';
    const message = $('#message')?.value?.trim() || '';

    setErr('name', '');
    setErr('email', '');
    setErr('discord', '');
    setErr('message', '');

    if (name.length < 2) { setErr('name', 'Укажи имя/ник.'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email', 'Укажи корректный email.'); ok = false; }
    if (discord.length < 2) { setErr('discord', 'Укажи Discord (ник + #).'); ok = false; }
    if (message.length < 10) { setErr('message', 'Напиши пару предложений о себе (опыт/роль/онлайн).'); ok = false; }

    return ok;
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) {
        showToast('Проверь поля формы.');
        return;
      }

      const submitBtn = $('button[type="submit"]', form);
      const prevText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем…';
      }

      try {
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.reset();
          showToast('Заявка отправлена. Мы свяжемся с тобой.');
        } else {
          showToast('Не удалось отправить. Попробуй ещё раз.');
        }
      } catch {
        showToast('Сеть/браузер блокирует запрос. Попробуй позже.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = prevText || 'Отправить заявку';
        }
      }
    });
  }
})();