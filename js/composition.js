/* Kalkulator Komposisi Fungsi Linear: fog..hogof, rantai 2 & 3 fungsi */
(function () {
  var FORMS = {
    fog: ["f", "g"],
    gof: ["g", "f"],
    foh: ["f", "h"],
    hof: ["h", "f"],
    goh: ["g", "h"],
    hog: ["h", "g"],
    fogoh: ["f", "g", "h"],
    gofoh: ["g", "f", "h"],
    hofog: ["h", "f", "g"],
    hogof: ["h", "g", "f"],
  };
  var LABEL = {
    fog: "(f∘g)(x)=f(g(x))",
    gof: "(g∘f)(x)=g(f(x))",
    foh: "(f∘h)(x)=f(h(x))",
    hof: "(h∘f)(x)=h(f(x))",
    goh: "(g∘h)(x)=g(h(x))",
    hog: "(h∘g)(x)=h(g(x))",
    fogoh: "(f∘g∘h)(x)=f(g(h(x)))",
    gofoh: "(g∘f∘h)(x)=g(f(h(x)))",
    hofog: "(h∘f∘g)(x)=h(f(g(x)))",
    hogof: "(h∘g∘f)(x)=h(g(f(x)))",
  };

  function fmtLin(a, b) {
    // px+q
    var s = "";
    if (a === 0) s = "" + b;
    else {
      if (a === 1) s = "x";
      else if (a === -1) s = "-x";
      else s = a + "x";
      if (b > 0) s += "+" + b;
      else if (b < 0) s += "" + b;
    }
    return s;
  }
  function fmtFn(name, f) {
    return name + "(x) = " + fmtLin(f.a, f.b);
  }

  function compose(funcs, order) {
    // order: ['f','g','h'] dievaluasi kanan-ke-kiri
    var steps = [];
    var cur = {
      a: funcs[order[order.length - 1]].a,
      b: funcs[order[order.length - 1]].b,
    };
    var innerName = order[order.length - 1];
    var innerExpr = fmtLin(cur.a, cur.b);
    steps.push(
      "Mulai dari fungsi paling dalam: " + innerName + "(x) = " + innerExpr,
    );
    for (var i = order.length - 2; i >= 0; i--) {
      var outer = funcs[order[i]];
      var on = order[i];
      var na = outer.a * cur.a;
      var nb = outer.a * cur.b + outer.b;
      // tampilkan substitusi: f(g(x)) = (4x+5)+3
      var curStr = "(" + fmtLin(cur.a, cur.b) + ")";
      var sub;
      if (outer.a === 1) sub = outer.b === 0 ? curStr : curStr + "+" + outer.b;
      else if (outer.a === -1)
        sub = outer.b === 0 ? "-" + curStr : "-" + curStr + "+" + outer.b;
      else
        sub =
          outer.a +
          "*" +
          curStr +
          (outer.b !== 0 ? (outer.b > 0 ? "+" + outer.b : "" + outer.b) : "");
      steps.push(
        on + "(" + innerName + "(x)) = " + sub + " = " + fmtLin(na, nb),
      );
      cur = { a: na, b: nb };
      innerName = on + "∘" + innerName;
    }
    return { a: cur.a, b: cur.b, steps: steps };
  }

  function bind(rootId) {
    var root = document.getElementById(rootId);
    if (!root) return;
    var els = {
      a: root.querySelector("[data-comp-a]"),
      b: root.querySelector("[data-comp-b]"),
      c: root.querySelector("[data-comp-c]"),
      d: root.querySelector("[data-comp-d]"),
      e: root.querySelector("[data-comp-e]"),
      ff: root.querySelector("[data-comp-f]"),
      form: root.querySelector("[data-comp-form]"),
      x: root.querySelector("[data-comp-x]"),
      btn: root.querySelector("[data-comp-go]"),
      out: root.querySelector("[data-comp-out]"),
      preset: root.querySelector("[data-comp-preset]"),
    };
    function validate() {
      var vals = [els.a, els.b, els.c, els.d, els.e, els.ff];
      var ok = true;
      vals.forEach(function (el) {
        var v = el.value.trim();
        if (v === "" || isNaN(Number(v))) {
          el.style.borderColor = "#ee7d9d";
          ok = false;
        } else el.style.borderColor = "";
      });
      if (!els.form.value) ok = false;
      els.btn.disabled = !ok;
      updatePreview();
      return ok;
    }
    /* Pratinjau live: f(x), g(x), h(x) — teks polos minimalis */
    var preview = document.createElement("p");
    preview.className = "muted tight";
    preview.setAttribute("data-comp-preview", "");
    els.form.closest(".row").before(preview);
    function updatePreview() {
      var n = function (el) {
        var v = Number(el.value);
        return isNaN(v) ? "—" : String(v);
      };
      preview.textContent =
        "f(x) = " +
        n(els.a) +
        "x + (" +
        n(els.b) +
        ") • g(x) = " +
        n(els.c) +
        "x + (" +
        n(els.d) +
        ") • h(x) = " +
        n(els.e) +
        "x + (" +
        n(els.ff) +
        ")";
    }
    [els.a, els.b, els.c, els.d, els.e, els.ff].forEach(function (el) {
      el.addEventListener("input", validate);
    });
    els.form.addEventListener("change", validate);
    if (els.preset)
      els.preset.addEventListener("click", function () {
        els.a.value = 1;
        els.b.value = 3;
        els.c.value = 4;
        els.d.value = 5;
        els.e.value = 3;
        els.ff.value = -9;
        validate();
        compute();
      });
    els.btn.addEventListener("click", compute);
    function compute() {
      if (!validate()) {
        els.out.innerHTML =
          '<div class="alert error">Lengkapi koefisien numerik dan pilih bentuk komposisi.</div>';
        return;
      }
      var funcs = {
        f: { a: Number(els.a.value), b: Number(els.b.value) },
        g: { a: Number(els.c.value), b: Number(els.d.value) },
        h: { a: Number(els.e.value), b: Number(els.ff.value) },
      };
      var key = els.form.value;
      var order = FORMS[key];
      var r = compose(funcs, order);
      var html =
        '<div class="alert ok"><b>' +
        key +
        "(x) = " +
        fmtLin(r.a, r.b) +
        "</b><br><small>" +
        LABEL[key] +
        "</small></div>";
      html +=
        '<div class="mono steps">' +
        r.steps
          .map(function (s, i) {
            return i + 1 + ". " + s;
          })
          .join("\n") +
        "</div>";
      html +=
        "<p>Diketahui: " +
        fmtFn("f", funcs.f) +
        ", " +
        fmtFn("g", funcs.g) +
        ", " +
        fmtFn("h", funcs.h) +
        "</p>";
      var xv = els.x.value.trim();
      if (xv !== "") {
        var xn = Number(xv);
        if (isNaN(xn))
          html += '<div class="alert error">Nilai x tidak numerik.</div>';
        else {
          var y = r.a * xn + r.b;
          html +=
            '<div class="alert warn">' +
            key +
            "(" +
            xn +
            ") = " +
            r.a +
            "×" +
            xn +
            "+" +
            r.b +
            " = <b>" +
            y +
            "</b></div>";
        }
      }
      html += '<p class="muted">Format hasil sesuai papan tulis.</p>';
      els.out.innerHTML = html;
      /* Tombol: gambar hasil di grafik bawah (satu halaman, tanpa pindah) */
      var expr = fmtLin(r.a, r.b);
      var gb = document.createElement("button");
      gb.type = "button";
      gb.className = "btn secondary btn-sm";
      gb.style.marginTop = "8px";
      gb.textContent = "Gambar hasil di grafik bawah";
      gb.addEventListener("click", function () {
        var gsec = document.getElementById("graph-kb3");
        if (!gsec) {
          return;
        }
        var inp = gsec.querySelector("[data-graph-input]");
        var go = gsec.querySelector("[data-graph-submit]");
        if (inp) inp.value = expr.replace(/\*\*/g, "^");
        if (go) go.click();
        gsec.scrollIntoView({ behavior: "smooth" });
      });
      els.out.appendChild(gb);
    }
    validate();
  }

  window.MTKComp = {
    forms: FORMS,
    labels: LABEL,
    compose: compose,
    fmt: fmtLin,
    bind: bind,
  };
})();
