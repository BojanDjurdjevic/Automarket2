import { carService } from '../services/car.service';
import { router } from '../main';
import { authStore } from '../store/auth.store';
import { Toast } from '../utils/toast.ts';
import { confirmModal } from '../ui/components/ConfirmModal.ts';
import { CarCard } from '../ui/components/CarCard';
import { ImageCarousel } from '../ui/components/ImageCarousel.ts';

export async function CarShowPage(
  params?: Record<string, string>
): Promise<HTMLElement> {

  const wrapper = document.createElement('div');

  wrapper.innerHTML = `
    <div class="text-center py-20">
      Loading...
    </div>
  `;

  try {

    const car = await carService.getOne(
      Number(params?.id)
    );
    /*
    const image =
      car.images?.[0]?.path ||
      'https://placehold.co/1200x700?text=No+Image'; */

    wrapper.innerHTML = `
      <div class="space-y-6">

        <!-- IMAGE -->
        <div id="carousel"></div>

        <!-- HEADER -->
        <div class="bg-white rounded-xl shadow p-6">

          <div class="flex justify-between items-start gap-4">

            <div>
              <h1 class="text-3xl font-bold">
                ${car.title}
              </h1>

              <div class="text-gray-500 mt-2">
                📍 ${car.location}
              </div>
            </div>

            <div class="text-3xl font-bold text-blue-600">
              €${Number(car.price).toLocaleString()}
            </div>
          </div>

          <!-- ACTIONS -->
          <div id="owner-actions"
            class="flex gap-3 mt-6">
          </div>
        </div>

        <!-- DETAILS -->
        <div class="bg-white rounded-xl shadow p-6">

          <h2 class="text-xl font-semibold mb-4">
            Vehicle Details
          </h2>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">

            ${detailItem('Make', car.make?.name)}
            ${detailItem('Model', car.model?.name)}
            ${detailItem('Year', car.year)}
            ${detailItem('Mileage', `${Number(car.mileage).toLocaleString()} km`)}
            ${detailItem('Fuel', car.fuel_type?.name)}
            ${detailItem('Transmission', car.transmission?.name)}
            ${detailItem('Body', car.body_type?.name)}
            ${detailItem('Engine', car.engine_size ?? '-')}
            ${detailItem('Horsepower', car.horsepower ?? '-')}
            ${detailItem('Color', car.color ?? '-')}

          </div>
        </div>

        <!-- DESCRIPTION -->
        <div class="bg-white rounded-xl shadow p-6">

          <h2 class="text-xl font-semibold mb-4">
            Description
          </h2>

          <p class="text-gray-700 whitespace-pre-line">
            ${car.description ?? 'No description'}
          </p>
        </div>

        <!-- FEATURES -->
        <div class="bg-white rounded-xl shadow p-6">

          <h2 class="text-xl font-semibold mb-4">
            Features
          </h2>

          <div class="flex flex-wrap gap-2">

            ${
              car.features?.length
                ? car.features.map((f: any) => `
                    <span class="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      ${f.name}
                    </span>
                  `).join('')
                : '<div class="text-gray-500">No features</div>'
            }

          </div>
        </div>

        <!-- SELLER -->
        <div class="bg-white rounded-xl shadow p-6">

          <h2 class="text-xl font-semibold mb-4">
            Seller
          </h2>

          <div class="space-y-2">

            <div>
              <strong>Name:</strong>
              ${car.user?.name ?? 'Unknown'}
            </div>

            <div>
              <strong>Email:</strong>
              ${car.user?.email ?? '-'}
            </div>

          </div>
        </div>

        <!-- SELLER CARS -->
        <div>

          <h2 class="text-2xl font-semibold mb-4">
            More from this seller
          </h2>

          <div id="seller-cars"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          </div>
        </div>

      </div>
    `;

    const carouselContainer =
      wrapper.querySelector('#carousel')!;

    carouselContainer.appendChild(
      ImageCarousel(car.images || [])
    );

    // OWNER ACTIONS
    const actions =
      wrapper.querySelector('#owner-actions')!;

    if (
      authStore.user &&
      authStore.user.id === car.user?.id
    ) {

      const editBtn = document.createElement('button');

      editBtn.className =
        'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded';

      editBtn.textContent = 'Edit';

      editBtn.addEventListener('click', () => {
        router.navigate(`/cars/${car.id}/edit`);
      });

      const deleteBtn = document.createElement('button');

      deleteBtn.className =
        'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded';

      deleteBtn.textContent = 'Delete';

      deleteBtn.addEventListener('click', async () => {

        const confirmed = await confirmModal(
            'Are you sure you want to delete this car?'
        );

        if (!confirmed) return;

        try {

            await carService.delete(car.id);

            Toast.success('Car deleted');

            router.navigate('/my-cars');

        } catch {

            Toast.error('Delete failed');
        }
    });

      actions.append(
        editBtn,
        deleteBtn
      );
    }

    // SELLER CARS
    const sellerCars =
      wrapper.querySelector('#seller-cars')!;

    const sellerListings =
      await carService.getByUser(car.user.id);

    sellerListings
      .filter((c: any) => c.id !== car.id)
      .slice(0, 6)
      .forEach((c: any) => {
        sellerCars.appendChild(CarCard(c));
      });

  } catch(e) {

    wrapper.innerHTML = `
      <div class="text-center py-20 text-red-500">
        Failed to load car
      </div>
    `;

    console.error(e)
  }

  return wrapper;
}

function detailItem(
  label: string,
  value: any
) {

  return `
    <div class="bg-gray-50 rounded-lg p-3">
      <div class="text-sm text-gray-500">
        ${label}
      </div>

      <div class="font-semibold mt-1">
        ${value ?? '-'}
      </div>
    </div>
  `;
}