/* Homepage hero gallery: cycles through all user-supplied hero images. */
(function () {
  'use strict';

  const IMAGES = [
    { src: 'images/hero-user.png', alt: 'Homeokit Homoeopathy — trusted natural care' },
    { src: 'images/hero-2.png', alt: 'Homeokit Homoeopathy gallery image 2' },
    { src: 'images/hero-3.png', alt: 'Homeokit Homoeopathy gallery image 3' },
    { src: 'images/hero-4.png', alt: 'Homeokit Homoeopathy gallery image 4' },
    { src: 'images/hero-5.png', alt: 'Homeokit Homoeopathy gallery image 5' },
    { src: 'images/hero-6.png', alt: 'Homeokit Homoeopathy gallery image 6' },
    { src: 'images/hero-7.png', alt: 'Homeokit Homoeopathy gallery image 7' }
  ];

  const gallery = document.getElementById('hero-gallery');
  const image = document.getElementById('hero-main-image');
  const thumbs = document.getElementById('hero-thumbs');
  const counter = document.getElementById('hero-counter');
  const prev = document.querySelector('.hero-prev');
  const next = document.querySelector('.hero-next');

  if (!gallery || !image || !thumbs || !counter || !prev || !next) return;

  let index = 0;
  let intervalId = null;
  let fadeTimer = null;

  function render() {
    const current = IMAGES[index];
    counter.textContent = (index + 1) + ' / ' + IMAGES.length;
    Array.prototype.forEach.call(thumbs.children, function (button, i) {
      button.classList.toggle('active', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
    clearTimeout(fadeTimer);
    image.classList.add('is-changing');
    fadeTimer = setTimeout(function () {
      image.src = current.src;
      image.alt = current.alt;
      image.classList.remove('is-changing');
    }, 130);
  }

  function goTo(position) {
    index = (position + IMAGES.length) % IMAGES.length;
    render();
    startAuto();
  }

  function startAuto() {
    clearInterval(intervalId);
    intervalId = setInterval(function () { goTo(index + 1); }, 5000);
  }

  function stopAuto() {
    clearInterval(intervalId);
    intervalId = null;
  }

  IMAGES.forEach(function (item, i) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Show hero image ' + (i + 1));
    const thumb = document.createElement('img');
    thumb.src = item.src;
    thumb.alt = '';
    thumb.loading = 'lazy';
    button.appendChild(thumb);
    button.addEventListener('click', function () { goTo(i); });
    thumbs.appendChild(button);
  });

  prev.addEventListener('click', function () { goTo(index - 1); });
  next.addEventListener('click', function () { goTo(index + 1); });
  gallery.addEventListener('mouseenter', stopAuto);
  gallery.addEventListener('mouseleave', startAuto);
  gallery.addEventListener('focusin', stopAuto);
  gallery.addEventListener('focusout', startAuto);

  render();
  startAuto();
})();
