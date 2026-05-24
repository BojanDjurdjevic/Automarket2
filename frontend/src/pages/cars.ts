import { carService } from '../services/car.service';
import { CarCard } from '../ui/components/CarCard';
import { router } from '../main';
import { authStore } from '../store/auth.store';
import { Pagination } from '../ui/components/Pagination';

export function CarsPage(): HTMLElement {
  const wrapper = document.createElement('div');

  wrapper.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Cars</h1>

      <button id="create-btn"
        class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded">
        + Add Car
      </button>
    </div>

    <div id="cars-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>Loading...</div>
    </div>
  `;
  // Search - filter:
  const filtersWrapper = document.createElement('div');

  filtersWrapper.className =
    'bg-white p-4 rounded shadow mb-4 grid grid-cols-2 md:grid-cols-4 gap-3  dark:bg-gray-800 dark:text-gray-100';

  filtersWrapper.innerHTML = `
    <input id="search" placeholder="Search..."
      class="border p-2 rounded" />

    <input id="price_min" placeholder="Min price" type="number"
      class="border p-2 rounded" />

    <input id="price_max" placeholder="Max price" type="number"
      class="border p-2 rounded" />

    <input id="year_min" placeholder="Min year" type="number"
      class="border p-2 rounded" />

    <input id="year_max" placeholder="Max year" type="number"
      class="border p-2 rounded" />

    <button id="apply"
      class="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-3 py-2">
      Apply
    </button>
  `;

  // Page State:
  let currentPage = 1;
  let currentQuery = '';

  function buildQuery() {
    const params = new URLSearchParams();

    const search = (filtersWrapper.querySelector('#search') as HTMLInputElement).value;
    const priceMin = (filtersWrapper.querySelector('#price_min') as HTMLInputElement).value;
    const priceMax = (filtersWrapper.querySelector('#price_max') as HTMLInputElement).value;
    const yearMin = (filtersWrapper.querySelector('#year_min') as HTMLInputElement).value;
    const yearMax = (filtersWrapper.querySelector('#year_max') as HTMLInputElement).value;

    if (search?.trim()) params.append('search', search.trim());
    console.log(search)
    if (priceMin) params.append('price_min', priceMin);
    if (priceMax) params.append('price_max', priceMax);
    if (yearMin) params.append('year_min', yearMin);
    if (yearMax) params.append('year_max', yearMax);

    return params.toString();
  }

  function render(cars: any[]) {
    list.innerHTML = '';

    cars.forEach(car => {
      list.appendChild(CarCard(car));
    });
  }

  const applyBtn = filtersWrapper.querySelector('#apply')!;

  applyBtn.addEventListener('click', async () => {

    currentQuery = buildQuery();

    currentPage = 1;

    renderCars(1);
  });

  const list = wrapper.querySelector('#cars-list')!;
  const addCarBtn = wrapper.querySelector('#create-btn') as HTMLButtonElement;

  async function renderCars(page = 1) {

    list.innerHTML = `
      <div class="col-span-full text-center py-10">
        Loading...
      </div>
    `;

    const res = await carService.getAll(
      page,
      currentQuery
    );

    list.innerHTML = '';

    res.data.forEach((car: any) => {
      list.appendChild(CarCard(car));
    });

    const oldPagination =
      wrapper.querySelector('#pagination');

    oldPagination?.remove();

    const paginationWrapper =
      document.createElement('div');

    paginationWrapper.id = 'pagination';

    paginationWrapper.appendChild(
      Pagination({
        currentPage: res.meta.current_page,
        lastPage: res.meta.last_page,

        onPageChange: (newPage) => {
          currentPage = newPage;
          renderCars(newPage);
        }
      })
    );

    wrapper.appendChild(paginationWrapper);
  }

  // create button
  if(!authStore.isAuthenticated) {
    addCarBtn.style.display = 'none'
  } else {
    wrapper.querySelector('#create-btn')!
    .addEventListener('click', () => {
      router.navigate('/cars/create');
    });
  }

  wrapper.insertBefore(filtersWrapper, list);

  renderCars();

  return wrapper;
}