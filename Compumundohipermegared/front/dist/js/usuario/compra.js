document.addEventListener('DOMContentLoaded', async function () {
  const allowed = await requireRole(['usuario']);
  if (!allowed) return;

  const logoutBtn = document.getElementById('logout-btn');
  const navBurger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  const form = document.getElementById('checkoutForm');
  const errorEl = document.getElementById('checkoutError');
  const successEl = document.getElementById('checkoutSuccess');
  const successText = document.getElementById('checkoutSuccessText');
  const submitBtn = document.getElementById('checkoutSubmit');

  const PLANS = {
    basico: {
      id: 'basico',
      nameKey: 'dash.planBasic',
      descKey: 'dash.planBasicText',
      price: '$ 1.200',
      label: 'Básico',
    },
    premium: {
      id: 'premium',
      nameKey: 'dash.planPremium',
      descKey: 'dash.planPremiumText',
      price: '$ 2.500',
      label: 'Premium',
    },
    anual: {
      id: 'anual',
      nameKey: 'dash.planYear',
      descKey: 'dash.planYearText',
      price: '$ 22.000',
      label: 'Anual',
    },
  };

  function selectedPlan() {
    const params = new URLSearchParams(window.location.search);
    const key = (params.get('plan') || 'premium').toLowerCase();
    return PLANS[key] || PLANS.premium;
  }

  function renderPlanSummary() {
    const plan = selectedPlan();
    const nameEl = document.getElementById('checkoutPlanName');
    const priceEl = document.getElementById('checkoutPlanPrice');
    const descEl = document.getElementById('checkoutPlanDesc');
    if (nameEl) nameEl.textContent = t(plan.nameKey);
    if (priceEl) priceEl.textContent = plan.price;
    if (descEl) descEl.textContent = t(plan.descKey);
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.hidden = !message;
    errorEl.textContent = message || '';
  }

  function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function formatCard(value) {
    return onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  function formatExpiry(value) {
    const digits = onlyDigits(value).slice(0, 4);
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }

  if (navBurger && navLinks) {
    function setNavOpen(open) {
      navLinks.classList.toggle('open', open);
      navBurger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    navBurger.addEventListener('click', function () {
      setNavOpen(!navLinks.classList.contains('open'));
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setNavOpen(false); });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function (event) {
      event.preventDefault();
      try { await API.request('/logout', 'POST'); } catch (err) {}
      clearToken();
      window.location.href = '/';
    });
  }

  const cardNumber = document.getElementById('cardNumber');
  const cardExpiry = document.getElementById('cardExpiry');
  const cardCvv = document.getElementById('cardCvv');

  if (cardNumber) {
    cardNumber.addEventListener('input', function () {
      cardNumber.value = formatCard(cardNumber.value);
    });
  }
  if (cardExpiry) {
    cardExpiry.addEventListener('input', function () {
      cardExpiry.value = formatExpiry(cardExpiry.value);
    });
  }
  if (cardCvv) {
    cardCvv.addEventListener('input', function () {
      cardCvv.value = onlyDigits(cardCvv.value).slice(0, 4);
    });
  }

  async function loadMe() {
    const payload = await API.request('/me');
    if (payload.status !== 'success') return;
    const user = (payload.data && payload.data.user) || {};
    setRole(user.role || 'usuario');
    const billName = document.getElementById('billName');
    const billEmail = document.getElementById('billEmail');
    if (billName && !billName.value) billName.value = user.name || '';
    if (billEmail && !billEmail.value) billEmail.value = user.email || '';
    if (typeof mountFitpowerSettings === 'function') {
      mountFitpowerSettings({ role: 'usuario', user: user });
    }
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      showError('');

      const name = document.getElementById('billName').value.trim();
      const email = document.getElementById('billEmail').value.trim();
      const phone = document.getElementById('billPhone').value.trim();
      const doc = document.getElementById('billDoc').value.trim();
      const cName = document.getElementById('cardName').value.trim();
      const cNumber = onlyDigits(document.getElementById('cardNumber').value);
      const expiry = document.getElementById('cardExpiry').value.trim();
      const cvv = onlyDigits(document.getElementById('cardCvv').value);

      if (!name || !email || !phone || !doc || !cName || !cNumber || !expiry || !cvv) {
        showError(t('dash.checkoutEmpty'));
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError(t('dash.checkoutEmailInvalid'));
        return;
      }
      if (cNumber.length < 13 || cNumber.length > 16) {
        showError(t('dash.checkoutCardInvalid'));
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        showError(t('dash.checkoutExpiryInvalid'));
        return;
      }
      if (cvv.length < 3) {
        showError(t('dash.checkoutCvvInvalid'));
        return;
      }

      const plan = selectedPlan();
      submitBtn.disabled = true;
      submitBtn.textContent = t('dash.checkoutProcessing');

      window.setTimeout(function () {
        try {
          localStorage.setItem('fitpower_fake_purchase', JSON.stringify({
            planId: plan.id,
            planName: t(plan.nameKey),
            price: plan.price,
            buyer: name,
            email: email,
            at: new Date().toISOString(),
          }));
        } catch (err) {}

        form.hidden = true;
        document.querySelector('.checkout-layout').hidden = true;
        if (successEl) {
          successEl.hidden = false;
          if (successText) {
            successText.textContent = t('dash.checkoutSuccessText')
              .replace('{plan}', t(plan.nameKey))
              .replace('{price}', plan.price)
              .replace('{email}', email);
          }
        }
        submitBtn.disabled = false;
        submitBtn.textContent = t('dash.checkoutPay');
      }, 700);
    });
  }

  document.addEventListener('fitpower:langchange', function () {
    renderPlanSummary();
    if (submitBtn && !submitBtn.disabled) {
      submitBtn.textContent = t('dash.checkoutPay');
    }
  });

  renderPlanSummary();
  try {
    await loadMe();
  } catch (err) {
    if (typeof mountFitpowerSettings === 'function') {
      mountFitpowerSettings({ role: 'usuario', user: {} });
    }
  }
});
