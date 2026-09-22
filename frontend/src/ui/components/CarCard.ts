import { escapeHtml } from '../../utils/helpers';
import { router } from '../../main';

export function CarCard(car: any): HTMLElement {

  const card = document.createElement('div');

  card.className = `
    bg-white rounded-xl overflow-hidden shadow
    hover:shadow-lg transition cursor-pointer
    border border-gray-100  dark:bg-gray-800 dark:text-gray-100
  `;

  const image = car.image || 'https://placehold.co/600x400?text=No+Image';

  card.innerHTML = `
    
    <!-- IMAGE -->
    <div class="h-52 bg-gray-100 overflow-hidden ">
      <img
        src="${escapeHtml(image)}"
        alt="${escapeHtml(car.title)}"
        class="w-full h-full object-cover hover:scale-105 transition duration-300"
      />
    </div>

    <!-- CONTENT -->
    <div class="p-4">

      <!-- TITLE -->
      <div class="flex items-start justify-between gap-2">
        <h2 class="font-semibold text-lg leading-tight">
          ${escapeHtml(car.title)}
        </h2>

        <div class="text-blue-600 font-bold whitespace-nowrap">
          €${Number(car.price).toLocaleString()}
        </div>
      </div>

      <!-- META -->
      <div class="flex flex-wrap gap-2 mt-3 text-sm">

        <span class="bg-gray-100 px-2 py-1 rounded  dark:bg-gray-800 dark:text-gray-100">
          ${escapeHtml(car.year)}
        </span>

        <span class="bg-gray-100 px-2 py-1 rounded  dark:bg-gray-800 dark:text-gray-100">
          ${Number(car.mileage).toLocaleString()} km
        </span>

        <span class="bg-gray-100 px-2 py-1 rounded  dark:bg-gray-800 dark:text-gray-100">
          ${escapeHtml(car.fuel_type?.name ?? 'Fuel')}
        </span>

      </div>

      <!-- LOCATION -->
      <div class="mt-4 text-sm text-gray-500 dark:text-gray-100">
        📍 ${escapeHtml(car.location)}
      </div>

      <!-- SELLER -->
      <div class="mt-3 pt-3 border-t text-sm text-gray-600 dark:text-gray-100">
        Seller:
        <span class="font-medium">
          ${escapeHtml(car.user?.name ?? 'Unknown')}
        </span>
      </div>
    </div>
  `;

  // CLICKABLE CARD
  card.addEventListener('click', () => {
    router.navigate(`/cars/${car.id}`);
  });

  return card;
}


/*
import { router } from "../../main";
import { carService } from "../../services/car.service";
import { authStore } from "../../store/auth.store";
import type { Car } from "../../types/car.types";
import { Toast } from "../../utils/toast";
import { hideLoading, showLoading } from "../layouts/Overlay";
import { confirmModal } from "./ConfirmModal";


export function CarCard(car: Car): HTMLElement {
  const div = document.createElement('div');

  div.className = `
    bg-white rounded-xl shadow p-4
    hover:shadow-md transition
    flex flex-col gap-2
  `;

  div.innerHTML = `
    <div class="font-semibold text-lg">${car.title}</div>

    <div class="text-gray-600">
      ${car.year}
    </div>

    <div class="text-blue-600 font-bold">
      €${car.price}
    </div>
  `;
  
  if (car.user_id === authStore.userId) {
  
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'text-sm text-blue-500';

    editBtn.addEventListener('click', () => {
      router.navigate(`/cars/${car.id}/edit`);
    });

    div.appendChild(editBtn)

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'text-red-500 text-sm';

    deleteBtn.onclick = async () => {

      const confirmed = await confirmModal('Are you sure you want to delete this car?');

      if (!confirmed) return;

      showLoading();

      try {
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Deleting...';

        await carService.delete(car.id);

        Toast.success('Car deleted');

        div.remove();

      } catch (e: any) {
        const status = e?.response?.status;

        if (status === 403) {
          Toast.error('Not allowed');
        } else {
          Toast.error('Delete failed');
        }

      } finally {
        hideLoading();
        deleteBtn.disabled = false;
        deleteBtn.textContent = 'Delete';
      }
    };

    div.appendChild(deleteBtn);
  }

  return div;
}
  */