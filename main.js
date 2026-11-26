/* عيادة ابتسامة — Demo 3. Vanilla JS, RTL-aware. Data: data.js (IBTISAMA_DATA). */
(function () {
  "use strict";
  var D = window.IBTISAMA_DATA || {};
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function param(name) { return new URLSearchParams(window.location.search).get(name); }

  /* ---------- Mobile nav ---------- */
  var header = $("#siteHeader"), navToggle = $("#navToggle");
  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".main-nav a", header).forEach(function (a) {
      a.addEventListener("click", function () { header.classList.remove("nav-open"); });
    });
  }

  /* ---------- Header shadow via sentinel ---------- */
  var sentinel = $("#headerSentinel");
  if (sentinel && header && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      header.classList.toggle("is-scrolled", !es[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Reveal on scroll (900ms, CSS) ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); rio.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { rio.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Counters ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$(".stat__num[data-target]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var pre = el.getAttribute("data-prefix") || "";
    if (reduceMotion || !("IntersectionObserver" in window)) {
      el.textContent = pre + target.toLocaleString("en-US", { maximumFractionDigits: dec, minimumFractionDigits: dec });
      return;
    }
    var done = false;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || done) return;
      done = true; io.disconnect();
      var t0 = null;
      (function tick(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1200, 1);
        var v = target * (1 - Math.pow(1 - p, 3));
        el.textContent = pre + v.toLocaleString("en-US", { maximumFractionDigits: dec, minimumFractionDigits: dec });
        if (p < 1) requestAnimationFrame(tick);
      })(performance.now());
      requestAnimationFrame(function (t) { tick(t); });
    }, { threshold: 0.4 });
    io.observe(el);
  });

  /* ---------- FAQ accordion ---------- */
  $$(".faq-item").forEach(function (item) {
    var btn = $(".faq-q", item);
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- Before / after sliders ---------- */
  $$(".ba").forEach(function (ba) {
    var range = $(".ba__range", ba), after = $(".ba__after", ba);
    if (!range || !after) return;
    var afterImg = $("img", after);
    function fitAfterImg() { if (afterImg) afterImg.style.width = ba.offsetWidth + "px"; }
    fitAfterImg();
    window.addEventListener("resize", fitAfterImg);
    range.addEventListener("input", function () { after.style.width = range.value + "%"; });
  });

  /* ---------- Gallery filter ---------- */
  var filterBtns = $$(".filter-btn"), caseCards = $$(".case-card");
  if (filterBtns.length && caseCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var f = btn.getAttribute("data-filter");
        caseCards.forEach(function (c) {
          c.classList.toggle("is-shown", f === "all" || c.getAttribute("data-cat") === f);
        });
      });
    });
  }

  /* ---------- Detail: layanan ---------- */
  (function () {
    var id = param("service");
    if (!id || !$("#sdTitle")) return;
    var s = (D.services || []).find(function (x) { return x.id === id; });
    if (!s) { var nf = $("#sdNotFound"); if (nf) nf.style.display = "block"; return; }
    $("#sdTitle").textContent = s.title;
    $("#sdMeta").textContent = s.tagline;
    var img = $("#sdImg"); if (img) { img.src = "assets/" + s.img; img.alt = s.title; }
    var desc = $("#sdDesc"); if (desc) desc.textContent = s.desc;
    var inc = $("#sdIncludes");
    if (inc) inc.innerHTML = s.includes.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    var pr = $("#sdPrice"); if (pr) pr.textContent = s.price;
    var st = $("#sdSteps");
    if (st) st.innerHTML = s.steps.map(function (t, i) {
      return "<li><strong>" + (i + 1) + ". " + t[0] + "</strong> — " + t[1] + "</li>";
    }).join("");
    var rel = $("#sdRelated");
    if (rel) rel.innerHTML = (D.services || []).filter(function (x) { return x.id !== id; }).slice(0, 4).map(function (x) {
      return '<a class="chip" href="service-detail.html?service=' + x.id + '">' + x.title + "</a>";
    }).join("");
  })();

  /* ---------- Detail: dokter ---------- */
  (function () {
    var id = param("doctor");
    if (!id || !$("#dpName")) return;
    var d = (D.doctors || []).find(function (x) { return x.id === id; });
    if (!d) { var nf = $("#dpNotFound"); if (nf) nf.style.display = "block"; return; }
    var img = $("#dpImg"); if (img) { img.src = "assets/" + d.img; img.alt = "صورة " + d.name; }
    $("#dpName").textContent = d.name;
    $("#dpRole").textContent = d.role;
    var bio = $("#dpBio"); if (bio) bio.textContent = d.bio;
    var cr = $("#dpCreds");
    if (cr) cr.innerHTML = d.creds.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    var sv = $("#dpServices");
    if (sv) sv.innerHTML = d.services.map(function (sid) {
      var s = (D.services || []).find(function (x) { return x.id === sid; });
      return s ? '<a class="chip" href="service-detail.html?service=' + s.id + '">' + s.title + "</a>" : "";
    }).join("");
  })();

  /* ---------- Detail: artikel ---------- */
  (function () {
    var id = param("article");
    if (!id || !$("#adTitle")) return;
    var a = (D.articles || []).find(function (x) { return x.id === id; });
    if (!a) { var nf = $("#adNotFound"); if (nf) nf.style.display = "block"; return; }
    $("#adTitle").textContent = a.title;
    $("#adMeta").textContent = a.cat + " • " + a.date;
    var img = $("#adImg"); if (img) { img.src = "assets/" + a.img; img.alt = a.title; }
    var body = $("#adBody");
    if (body) body.innerHTML = a.body.map(function (p) { return "<p>" + p + "</p>"; }).join("");
    var rel = $("#adRelated");
    if (rel) rel.innerHTML = (D.articles || []).filter(function (x) { return x.id !== id; }).map(function (x) {
      return '<a class="chip" href="article-detail.html?article=' + x.id + '">' + x.title + "</a>";
    }).join("");
  })();

  /* ---------- Booking + login simulasi (demo, localStorage) ---------- */
  var DEMO_PHONE = "0910000000", DEMO_PASS = "1234";
  function getUser() { try { return JSON.parse(localStorage.getItem("ibtisama_user") || "null"); } catch (e) { return null; } }
  function getAppts() { try { return JSON.parse(localStorage.getItem("ibtisama_appts") || "[]"); } catch (e) { return []; } }
  function renderAppts() {
    var list = $("#apptList"); if (!list) return;
    var appts = getAppts();
    var empty = $("#apptEmpty");
    if (!appts.length) { list.innerHTML = ""; if (empty) empty.style.display = "block"; return; }
    if (empty) empty.style.display = "none";
    list.innerHTML = appts.map(function (a) {
      return '<div class="appt"><strong>' + a.service + " — " + a.doctor + "</strong><span>" + a.date + " • " + a.time + " • " + a.name + '</span><br><span class="appt__status">بانتظار التأكيد</span></div>';
    }).join("");
  }
  function showUser(u) {
    var chip = $("#userChip"), card = $("#loginCard");
    if (chip && u) {
      chip.classList.add("is-shown");
      $("#userName").textContent = u.name;
      if (card) card.style.display = "none";
    } else if (chip) {
      chip.classList.remove("is-shown");
      if (card) card.style.display = "block";
    }
  }
  var loginForm = $("#loginForm");
  if (loginForm) {
    showUser(getUser());
    renderAppts();
    loginForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var phone = $("#loginPhone").value.trim(), pass = $("#loginPass").value;
      var err = $("#loginError");
      if (phone === DEMO_PHONE && pass === DEMO_PASS) {
        var u = { name: "أحمد (حساب تجريبي)", phone: phone };
        localStorage.setItem("ibtisama_user", JSON.stringify(u));
        if (err) err.classList.remove("is-shown");
        showUser(u);
        var bkPhone = $("#bkPhone"); if (bkPhone && !bkPhone.value) bkPhone.value = phone;
        var bkName = $("#bkName"); if (bkName && !bkName.value) bkName.value = "أحمد";
      } else if (err) {
        err.textContent = "بيانات الدخول غير صحيحة. جرّب الحساب التجريبي: 0910000000 / 1234";
        err.classList.add("is-shown");
      }
    });
    var logoutBtn = $("#logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("ibtisama_user");
      showUser(null);
    });
  }
  var bookingForm = $("#bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!bookingForm.checkValidity()) { bookingForm.reportValidity(); return; }
      var appts = getAppts();
      appts.unshift({
        name: $("#bkName").value.trim(),
        phone: $("#bkPhone").value.trim(),
        service: $("#bkService").value,
        doctor: $("#bkDoctor").value,
        date: $("#bkDate").value,
        time: $("#bkTime").value
      });
      localStorage.setItem("ibtisama_appts", JSON.stringify(appts));
      renderAppts();
      bookingForm.style.display = "none";
      var ok = $("#bookingSuccess"); if (ok) ok.classList.add("is-shown");
    });
    var resetBtn = $("#bookingReset");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      bookingForm.reset();
      bookingForm.style.display = "block";
      var ok = $("#bookingSuccess"); if (ok) ok.classList.remove("is-shown");
    });
  }
})();
