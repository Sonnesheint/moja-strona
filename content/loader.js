document.addEventListener('DOMContentLoaded', async function () {

  // ── Case study page ────────────────────────────────────────────
  var caseFile = document.body.getAttribute('data-case-file');
  if (caseFile) {
    try {
      var data = await loadContent(caseFile);
      document.querySelectorAll('[data-content]').forEach(function (el) {
        var key = el.getAttribute('data-content');
        if (data[key] === undefined) return;
        if (key === 'META_TOOLS') {
          el.classList.add('tags-row');
          el.innerHTML = data[key].split(',')
            .map(function (t) { return '<span class="tag">' + t.trim() + '</span>'; })
            .join('');
          return;
        }
        el.innerHTML = data[key];
      });
    } catch (e) {
      console.warn('[loader] case study:', e.message);
    }
    return;
  }

// ── Index page: bio ────────────────────────────────────────────
  try {
    var bio = await loadContent('bio.txt');

    // === TUTAJ DODAJEMY LOGA ===
    console.log('Dane pobrane z bio.txt:', bio);
    
    // To szuka wszystkich elementów data-content wewnątrz sekcji #bio
    document.querySelectorAll('#bio [data-content]').forEach(function (el) {
      var key = el.getAttribute('data-content');
      if (bio[key] !== undefined) {
        // Używamy innerHTML zamiast textContent, żeby obsłużyć ewentualne <strong> lub <br>
        el.innerHTML = bio[key];
      }
    });

    var bioTagsEl = document.querySelector('[data-content="BIO_TAGS"]');
    if (bioTagsEl && bio.BIO_TAGS) {
      bioTagsEl.innerHTML = bio.BIO_TAGS.split(',')
        .map(function (t) { return '<div class="bio-tag">' + t.trim() + '</div>'; })
        .join('');
    }
  } catch (e) {
    console.warn('[loader] bio.txt:', e.message);
  }

  // ── Index page: accordions ─────────────────────────────────────
  var items = document.querySelectorAll('[data-content-file]');
  await Promise.all(Array.from(items).map(async function (item) {
    var filename = item.getAttribute('data-content-file');
    try {
      var d = await loadContent(filename);

      item.querySelectorAll('[data-content]').forEach(function (el) {
        var key = el.getAttribute('data-content');

        if (key === 'DESC') {
          var paras = [d.DESC_1, d.DESC_2].filter(Boolean);
          el.innerHTML = paras.map(function (p) { return '<p>' + p + '</p>'; }).join('');
          return;
        }

        if (key === 'ASIDE') {
          var html = '';
          if (d.SKILLS) {
            html += '<div class="accordion-aside-label">What I did</div>';
            html += '<div class="aside-tags">';
            html += d.SKILLS.split(',')
              .map(function (s) { return '<span class="aside-tag">' + s.trim() + '</span>'; })
              .join('');
            html += '</div>';
          }
          if (d.INDUSTRY) {
            html += '<div class="accordion-aside-label">Industry</div>';
            html += '<div class="accordion-aside-text">' + d.INDUSTRY + '</div>';
          }
          if (d.ASIDE_3_VALUE) {
            var label3 = d.ASIDE_3_LABEL || 'Context';
            html += '<div class="accordion-aside-label">' + label3 + '</div>';
            html += '<div class="accordion-aside-text">' + d.ASIDE_3_VALUE + '</div>';
          }
          el.innerHTML = html;
          return;
        }

        if (d[key] !== undefined) el.innerHTML = d[key];
      });
    } catch (e) {
      console.warn('[loader] ' + filename + ':', e.message);
    }
  }));

});
