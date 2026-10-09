// Progressive enhancement: entries remain readable if JavaScript is unavailable.
const form = document.querySelector('[data-filter-form]');
if (form) {
  const search = form.elements.namedItem('q');
  const category = form.elements.namedItem('category');
  const entries = [...document.querySelectorAll('[data-entry]')];
  const status = document.querySelector('[data-result-count]');
  const empty = document.querySelector('[data-empty]');
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  const validCategories = [...category.options].map(option => option.value);
  category.value = validCategories.includes(params.get('category')) ? params.get('category') : 'all';
  function render(updateAddress = true) {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const entry of entries) {
      const matchesQuery = entry.textContent.toLocaleLowerCase().includes(query);
      const matchesCategory = category.value === 'all' || entry.dataset.category === category.value;
      entry.hidden = !(matchesQuery && matchesCategory);
      if (!entry.hidden) count++;
    }
    status.textContent = `${count} of ${entries.length} ${form.dataset.label} shown`;
    empty.hidden = count !== 0;
    if (updateAddress) {
      const url = new URL(location.href);
      if (search.value.trim()) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
      if (category.value !== 'all') url.searchParams.set('category', category.value); else url.searchParams.delete('category');
      // Some file:// browsers disallow History changes; filtering still works there.
      try { history.replaceState(null, '', url); } catch {}
    }
  }
  form.hidden = false;
  form.addEventListener('submit', event => event.preventDefault());
  search.addEventListener('input', () => render());
  category.addEventListener('change', () => render());
  form.querySelector('[data-clear]').addEventListener('click', () => { search.value = ''; category.value = 'all'; render(); search.focus(); });
  render(false);
}
