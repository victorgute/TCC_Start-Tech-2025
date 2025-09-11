export function initSwiper() {
  if (typeof Swiper !== 'undefined') {
    new Swiper(".mySwiper", {
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    });
  } else {
    console.error("Biblioteca Swiper não encontrada.");
  }
}