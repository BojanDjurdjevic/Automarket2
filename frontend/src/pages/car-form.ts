import { carService } from '../services/car.service';
import { metaService } from '../services/meta.service';
import { router } from '../main';
import type { CarPayload, Feature } from '../types/car.types';
import { api } from '../api/axios';
import { Toast } from '../utils/toast';
import { hideLoading, showLoading } from '../ui/layouts/Overlay';
import { confirmModal } from '../ui/components/ConfirmModal';
import { clearFieldErrors, showFieldError } from '../utils/form-errors';
import { getErrorMessage, getValidationErrors } from '../utils/api-error';

export function CarFormPage(params?: Record<string, string>): HTMLElement {
  const wrapper = document.createElement('div');

  const isEdit = !!params?.id;

  wrapper.innerHTML = `
    <h1 class="text-2xl font-semibold mb-4">
      ${isEdit ? 'Edit Car' : 'Create Car'}
    </h1>

    <div id="form" class="bg-white p-6 rounded shadow max-w-lg">
      Loading form...
    </div>
  `;

  // select helper func
  function createSelect(
    id: string,
    options: { id: number; name: string }[]
  ): HTMLSelectElement {

    const select = document.createElement('select');
    select.id = id;
    select.className = 'border p-2 w-full mb-3';
    
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = opt.name;
      select.appendChild(o);
    });

    return select;
  }

  // input helper - for now here, later in utils...
  
  function createInput(id: string, placeholder: string, type = 'text') {
    const input = document.createElement('input');
    input.id = id;
    input.placeholder = placeholder;
    input.type = type;
    input.className = 'border p-2 w-full mb-3';
    return input;
  } 

  function createField(
    labelText: string,
    input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  ): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-4';

    const label = document.createElement('label');
    label.textContent = labelText;
    label.className = 'block text-sm font-medium mb-1 text-gray-700';

    wrapper.appendChild(label);
    wrapper.appendChild(input);

    return wrapper;
  }

  const form = wrapper.querySelector('#form')!;

  metaService.getAll().then(async meta => {

    console.log('META:', meta);

    form.innerHTML = '';

    // SELECTS
    const make = createSelect('make_id', meta.makes);
    const model = createSelect('model_id', []);
    make.addEventListener('change', async () => {
      const makeId = make.value;

      const res = await api.get(`/api/makes/${makeId}/models`);

      const models = res.data;

      model.innerHTML = '';

      models.forEach((m: any) => {
        const opt = document.createElement('option');
        opt.value = String(m.id);
        opt.textContent = m.name;
        model.appendChild(opt);
      });
    });

    
    const fuel = createSelect('fuel_type_id', meta.fuel_types);
    const body = createSelect('body_type_id', meta.body_types);
    const transmission = createSelect('transmission_id', meta.transmissions);
 
    // INPUTS 
    
    const title = createInput('title', 'Title');
    const year = createInput('year', 'Year', 'number');
    const price = createInput('price', 'Price', 'number');
    const mileage = createInput('mileage', 'Mileage', 'number');
    const location = createInput('location', 'Location'); 

    // Form inputs PART II:
    const engineSize = createInput('engine_size', 'Engine size (e.g. 2.0)');
    const horsepower = createInput('horsepower', 'Horsepower', 'number');
    const color = createInput('color', 'Color');
    const description = document.createElement('textarea');
    description.id = 'description';
    description.placeholder = 'Description';
    description.className = 'border p-2 w-full mb-3';

    // IMAGE UPLOAD

    const imageInput = document.createElement('input');

    const imagePreview = document.createElement('div');

    const existingImages = document.createElement('div');

    let selectedFiles: File[] = [];
    
    imageInput.type = 'file';
    imageInput.multiple = true;
    imageInput.accept = 'image/*';

    imageInput.className = 'border p-2 w-full mb-3 bg-white';
    imagePreview.className = 'grid grid-cols-2 md:grid-cols-3 gap-3 mt-3';
    existingImages.className = 'grid grid-cols-2 md:grid-cols-3 gap-3 mb-4';

    function renderPreview() {
      imagePreview.innerHTML = '';

      selectedFiles.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'relative rounded overflow-hidden border bg-gray-100';

          const img = document.createElement('img');
          img.src = e.target?.result as string;
          img.className = 'w-full h-32 object-cover';

          // RM btn
          const removeBtn = document.createElement('button');
          removeBtn.textContent = '×';
          removeBtn.className =
            'absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full';

          removeBtn.onclick = () => {
            selectedFiles.splice(index, 1);
            renderPreview();
          };

          wrapper.appendChild(img);
          wrapper.appendChild(removeBtn);

          imagePreview.appendChild(wrapper);
        };

        reader.readAsDataURL(file);
      });
    }

    imageInput.addEventListener('change', () => {

      imagePreview.innerHTML = '';

      if (!imageInput.files) return;

      selectedFiles = Array.from(imageInput.files);
      /*
      Array.from(imageInput.files).forEach(file => {

        const reader = new FileReader();

        reader.onload = (e) => {

          const wrapper = document.createElement('div');

          wrapper.className =
            'relative rounded overflow-hidden border bg-gray-100';

          const img = document.createElement('img');

          img.src = e.target?.result as string;

          img.className =
            'w-full h-32 object-cover';

          wrapper.appendChild(img);

          imagePreview.appendChild(wrapper);
        };

        reader.readAsDataURL(file);
      }); */

      renderPreview();
    });

    const btn = document.createElement('button');
    btn.textContent = isEdit ? 'Update' : 'Create';
    btn.className = 'bg-blue-500 text-white w-full py-2 rounded';

    // Part III (features - check):

    const featuresWrapper = document.createElement('div');
    featuresWrapper.className = 'mb-4';

    const featuresTitle = document.createElement('p');
    featuresTitle.textContent = 'Features';
    featuresTitle.className = 'text-sm font-medium mb-2 text-gray-700';

    featuresWrapper.appendChild(featuresTitle);

    const selectedFeatures: number[] = [];

    meta.features.forEach((f: Feature )  => {
      const label = document.createElement('label');
      label.className = 'flex items-center gap-2 text-sm mb-1';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = String(f.id);

      checkbox.addEventListener('change', () => {
        const id = Number(checkbox.value);

        if (checkbox.checked) {
          selectedFeatures.push(id);
        } else {
          const index = selectedFeatures.indexOf(id);
          if (index > -1) selectedFeatures.splice(index, 1);
        }
      });

      label.appendChild(checkbox);
      label.append(f.name);

      featuresWrapper.appendChild(label);
    });

    // EDIT
    if (isEdit) {
      const car = await carService.getOne(Number(params!.id));

      make.value = String(car.make.id);

      const res = await api.get(`/api/makes/${car.make.id}/models`);
      const models = res.data;

      model.innerHTML = '';

      models.forEach((m: any) => {
        const opt = document.createElement('option');
        opt.value = String(m.id);
        opt.textContent = m.name;
        model.appendChild(opt);
      });

      model.value = String(car.model.id);
      fuel.value = String(car.fuel_type.id);
      body.value = String(car.body_type.id);
      transmission.value = String(car.transmission.id);

      title.value = car.title;
      year.value = String(car.year);
      price.value = String(car.price);
      mileage.value = String(car.mileage);
      location.value = car.location;

      // Form inputs in edit Part II:

      engineSize.value = String(car.engine_size) ?? '';
      horsepower.value = car.horsepower ? String(car.horsepower) : '';
      color.value = String(car.color) ?? '';
      description.value = String(car.description) ?? '';

      // Part III - features:

      selectedFeatures.push(...car.features.map((f: Feature) => f.id));

      featuresWrapper.querySelectorAll('input[type="checkbox"]').forEach((el: any) => {
        if (selectedFeatures.includes(Number(el.value))) {
          el.checked = true;
        }
      });

      // EXISTING IMAGES

      if (car.images?.length) {

        car.images.forEach((img: any) => {

          const wrapper = document.createElement('div');

          wrapper.className =
            'relative rounded overflow-hidden border bg-gray-100';

          const image = document.createElement('img');

          image.src = img.url;

          image.className =
            'w-full h-32 object-cover';

          wrapper.appendChild(image);

          //is-primary badge:

          if (img.is_primary) {

            const badge = document.createElement('div');

            badge.textContent = 'PRIMARY';

            badge.className =
              'absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded';

            wrapper.appendChild(badge);
          }

          //Delete ONE Image:

          const deleteBtn = document.createElement('button');

          deleteBtn.textContent = '×';

          deleteBtn.className =
            'absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full hover:bg-red-500';

          deleteBtn.addEventListener('click', async () => {

            const confirmed = await confirmModal(
              'Delete this image?'
            );

            if (!confirmed) return;

            try {

              await carService.deleteImage(car.id, img.id);

              wrapper.remove();

              Toast.success('Image deleted');

            } catch(e: any) {
              //Toast.error('Delete failed');

              clearFieldErrors(wrapper);

              if (e?.response?.status === 422) {
                const errors = getValidationErrors(e);

                Object.entries(errors).forEach(([field, messages]) => {
                    const input = wrapper.querySelector(`#${field}`);

                    if (input) {
                      showFieldError(
                        input as HTMLElement,
                        messages[0]
                      );
                    }
                  }
                );

                return;
              }

              Toast.error(getErrorMessage(e));
            }
          });

          wrapper.appendChild(deleteBtn);

          if (!img.is_primary) {

            const primaryBtn = document.createElement('button');

            primaryBtn.textContent = 'Set Primary';

            primaryBtn.className = 'absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-black';

            primaryBtn.addEventListener(
              'click',
              async () => {

                try {

                  await carService.setPrimaryImage(car.id, img.id);

                  Toast.success(
                    'Primary image updated'
                  );

                  router.navigate(
                    `/cars/${car.id}/edit`
                  );

                } catch(e: any) {
                  //Toast.error('Failed to update image');
                  clearFieldErrors(wrapper);

                  if (e?.response?.status === 422) {

                    const errors = getValidationErrors(e);

                    Object.entries(errors).forEach(([field, messages]) => {
                        const input = wrapper.querySelector( `#${field}`);

                        if (input) {
                          showFieldError(
                            input as HTMLElement,
                            messages[0]
                          );
                        }
                      }
                    );

                    return;
                  }

                  Toast.error( getErrorMessage(e));
                }
              }
            );

            wrapper.appendChild(primaryBtn);
          }

          existingImages.appendChild(wrapper);
        });
      }
    }

    // SUBMIT
    btn.addEventListener('click', async () => {

      const formData = new FormData();

      // basic info

      formData.append('make_id', make.value);
      formData.append('model_id', model.value);

      formData.append('fuel_type_id', fuel.value);
      formData.append('body_type_id', body.value);
      formData.append('transmission_id', transmission.value);

      formData.append('title', title.value);
      formData.append('year', year.value);

      formData.append('price', price.value);
      formData.append('mileage', mileage.value);

      formData.append('location', location.value);

      // OPTIONAL

      if (engineSize.value) {
        formData.append('engine_size', engineSize.value);
      }

      if (horsepower.value) {
        formData.append('horsepower', horsepower.value);
      }

      if (color.value) {
        formData.append('color', color.value);
      }

      if (description.value) {
        formData.append('description', description.value);
      }

      // FEATURES

      selectedFeatures.forEach(featureId => {
        formData.append('features[]', String(featureId));
      });

      // IMAGES
      selectedFiles.forEach(file => {
        formData.append('images[]', file);
      });
      /*
      if (imageInput.files) {
        Array.from(imageInput.files).forEach(file => {
          formData.append('images[]', file);
        });
      } */

      showLoading();

      try {

        if (isEdit) {

          await carService.update(
            Number(params!.id),
            formData
          );

          Toast.success('Car updated successfully');

        } else {

          await carService.create(formData);

          Toast.success('Car created successfully');
        }

        router.navigate('/cars');

      } catch (e: any) {
        /*
        console.error(e);

        const status = e?.response?.status;

        if (status === 403) {
          Toast.error('You are not allowed');
          return;
        }

        if (status === 422) {
          Toast.error('Validation failed');
          return;
        }

        Toast.error('Something went wrong'); */

        clearFieldErrors(wrapper);

        if (e?.response?.status === 422) {

          const errors = getValidationErrors(e);

          Object.entries(errors).forEach(([field, messages]) => {
              const input = wrapper.querySelector( `#${field}`);

              if (input) {
                showFieldError(
                  input as HTMLElement,
                  messages[0]
                );
              }
            }
          );

          return;
        }

        Toast.error(getErrorMessage(e));
      } finally {
        hideLoading();
      }
  });

    form.append(
      createField('Make', make),
      createField('Model', model),
      createField('Fuel', fuel),
      createField('Body', body),
      createField('Transmission', transmission),
      createField('Title', title),
      createField('Year', year),
      createField('Price', price),
      createField('Mileage', mileage),
      createField('Location', location),
      //part II
      createField('Engine size', engineSize),
      createField('Horsepower', horsepower),
      createField('Color', color),
      createField('Car description', description),
      //Images:
      //createField('Car Images', imageInput),
      (() => {
        const field = createField(
          'Car Images',
          imageInput
        );

        if (isEdit) {

          const title = document.createElement('p');

          title.textContent = 'Existing Images';

          title.className =
            'text-sm font-medium text-gray-700 mb-2 mt-2';

          field.appendChild(title);

          field.appendChild(existingImages);
        }

        const newTitle = document.createElement('p');

        newTitle.textContent = 'New Uploads';

        newTitle.className =
          'text-sm font-medium text-gray-700 mb-2 mt-4';

        field.appendChild(newTitle);

        field.appendChild(imagePreview);

        return field;
      })(),
      featuresWrapper,
      btn
    );
  });

  return wrapper;
}