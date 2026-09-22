import { getErrorMessage } from '../utils/api-error';
import { carService } from '../services/car.service';
import { CarCard } from '../ui/components/CarCard';
import { Pagination } from '../ui/components/Pagination';

export function MyCarsPage(): HTMLElement {

  const wrapper = document.createElement('div');

  wrapper.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">
        My Cars
      </h1>
    </div>

    <input 
      id="search"
      placeholder="Search my cars..."
      class="border p-2 mb-4 w-full rounded"
    />

    <div 
      id="cars"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div class="col-span-full text-center py-10">
        Loading...
      </div>
    </div>
  `;

  const carsContainer =
    wrapper.querySelector('#cars') as HTMLElement;

  const searchInput =
    wrapper.querySelector('#search') as HTMLInputElement;

  // PAGE STATE:
  let requestVersion = 0;
  let currentSearch = '';

  // RENDER
  function render(cars: any[]) {

    carsContainer.innerHTML = '';

    if (cars.length === 0) {
      carsContainer.innerHTML = `
        <div class="col-span-full text-center text-gray-500 py-10">
          No cars found
        </div>
      `;

      return;
    }

    cars.forEach(car => {
      carsContainer.appendChild(CarCard(car));
    });
  }

  // LOAD
  async function loadCars(page = 1) {
    const version = ++requestVersion;
    try {

    carsContainer.innerHTML = `
      <div class="col-span-full text-center py-10">
        Loading...
      </div>
    `;

    const res = await carService.myCars(
      page,
      currentSearch
    );

    if (version !== requestVersion) return;
    render(res.data);

    // REMOVE OLD PAGINATION
    wrapper.querySelector('#pagination')?.remove();

    // CREATE NEW PAGINATION
    const paginationWrapper =
      document.createElement('div');

    paginationWrapper.id = 'pagination';

    paginationWrapper.className = 'mt-6';

    paginationWrapper.appendChild(
      Pagination({
        currentPage: res.meta.current_page,
        lastPage: res.meta.last_page,

        onPageChange: (newPage) => {
          loadCars(newPage);
        }
      })
    );

    wrapper.appendChild(paginationWrapper);
    } catch (error) {
      if (version !== requestVersion) return;
      wrapper.querySelector('#pagination')?.remove();
      carsContainer.textContent = getErrorMessage(error);
    }
  }

  // SEARCH
  searchInput.addEventListener('input', () => {

    currentSearch = searchInput.value.trim();

    loadCars(1);
  });

  // INITIAL LOAD
  loadCars();

  return wrapper;
}