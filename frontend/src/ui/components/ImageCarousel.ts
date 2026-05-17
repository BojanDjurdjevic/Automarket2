type ImageItem = {
  id: number;
  url: string;
  is_primary?: boolean;
};

export function ImageCarousel(images: ImageItem[]): HTMLElement {

  const wrapper = document.createElement('div');

  wrapper.className = 'mb-6';

  // SORT - primary
  const sortedImages = [...images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary)
  );

  
  if (!sortedImages.length) {

    wrapper.innerHTML = `
      <img
        src="https://placehold.co/1200x700?text=No+Image"
        class="w-full h-[420px] object-cover rounded-xl border"
      />
    `;

    return wrapper;
  }

  let currentIndex = 0;

  // MAIN IMAGE
  const mainImage = document.createElement('img');

  mainImage.src = sortedImages[currentIndex].url;

  mainImage.className =
    'w-full h-[420px] object-cover rounded-xl border bg-gray-100';

  wrapper.appendChild(mainImage);

  // THUMBNAILS
  const thumbs = document.createElement('div');

  thumbs.className =
    'flex gap-3 mt-3 overflow-x-auto';

  sortedImages.forEach((img, index) => {

    const thumb = document.createElement('img');

    thumb.src = img.url;

    thumb.className = `
      w-24 h-20 object-cover rounded-lg border cursor-pointer
      transition hover:opacity-80
      ${index === currentIndex ? 'ring-2 ring-blue-500' : ''}
    `;

    thumb.addEventListener('click', () => {

      currentIndex = index;

      mainImage.src = img.url;

      // rerender active border
      thumbs.querySelectorAll('img').forEach(el => {
        el.classList.remove('ring-2', 'ring-blue-500');
      });

      thumb.classList.add('ring-2', 'ring-blue-500');
    });

    thumbs.appendChild(thumb);
  });

  wrapper.appendChild(thumbs);

  // Open - close img fullscr

  function openFullscreen(startIndex: number) {

        let active = startIndex;

        const overlay = document.createElement('div');

        overlay.className =
            'fixed inset-0 bg-black/90 z-50 flex items-center justify-center';

        overlay.innerHTML = `
            <button id="close"
            class="absolute top-5 right-5 text-white text-4xl">
            ×
            </button>

            <button id="prev"
            class="absolute left-5 text-white text-5xl px-4">
            ‹
            </button>

            <img
            id="fullscreen-image"
            src="${sortedImages[active].url}"
            class="max-w-[95%] max-h-[90%] object-contain rounded-xl"
            />

            <button id="next"
            class="absolute right-5 text-white text-5xl px-4">
            ›
            </button>
        `;

        const image = overlay.querySelector('#fullscreen-image') as HTMLImageElement;

        function updateImage() {
            image.src = sortedImages[active].url;
        }

        overlay.querySelector('#prev')!.addEventListener('click', () => {
            active = active === 0 ? sortedImages.length - 1 : active - 1;

            updateImage();
        });

        overlay.querySelector('#next')!.addEventListener('click', () => {
            active =
                active === sortedImages.length - 1
                ? 0
                : active + 1;

            updateImage();
        });

        function close() {
            overlay.remove();
            document.removeEventListener('keydown', keyHandler);
        }

        overlay.querySelector('#close')!.addEventListener('click', close);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close();
            }
        });

        function keyHandler(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                close();
            }

            if (e.key === 'ArrowRight') {

                active = active === sortedImages.length - 1 ? 0 : active + 1;

                updateImage();
            }

            if (e.key === 'ArrowLeft') {

                active = active === 0 ? sortedImages.length - 1 : active - 1;

                updateImage();
            }
        }

        document.addEventListener('keydown', keyHandler);

        document.body.appendChild(overlay);
    }

    mainImage.style.cursor = 'zoom-in';

    mainImage.addEventListener('click', () => {
        openFullscreen(currentIndex);
    });

  return wrapper;
}