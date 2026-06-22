const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");

if (header && toggle) {
  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const slides = [...carousel.querySelectorAll(".testimonial-slide")];
  const dots = [...carousel.querySelectorAll(".carousel-dots button")];
  let currentSlide = 0;
  let carouselTimer;

  const showSlide = (index) => {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  };

  const startCarousel = () => {
    carouselTimer = window.setInterval(() => showSlide(currentSlide + 1), 5200);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      window.clearInterval(carouselTimer);
      showSlide(index);
      startCarousel();
    });
  });

  startCarousel();
}

const zipChecker = document.querySelector("[data-zip-checker]");

if (zipChecker) {
  const form = zipChecker.querySelector(".zip-form");
  const input = form.querySelector("input");
  const result = zipChecker.querySelector(".zip-result");
  const origin = { lat: 37.6735, lng: -122.0868 };
  const radiusMiles = 45;
  const knownZips = {
    "94002": { lat: 37.5169, lng: -122.2938 },
    "94010": { lat: 37.5779, lng: -122.3481 },
    "94014": { lat: 37.6896, lng: -122.4477 },
    "94015": { lat: 37.6812, lng: -122.4805 },
    "94025": { lat: 37.4538, lng: -122.1822 },
    "94027": { lat: 37.4519, lng: -122.2004 },
    "94030": { lat: 37.5992, lng: -122.4027 },
    "94044": { lat: 37.6138, lng: -122.4869 },
    "94061": { lat: 37.4621, lng: -122.2257 },
    "94062": { lat: 37.4135, lng: -122.2953 },
    "94063": { lat: 37.4914, lng: -122.211 },
    "94065": { lat: 37.5331, lng: -122.2486 },
    "94066": { lat: 37.6247, lng: -122.4303 },
    "94070": { lat: 37.4975, lng: -122.2668 },
    "94401": { lat: 37.5732, lng: -122.3198 },
    "94402": { lat: 37.5203, lng: -122.3392 },
    "94403": { lat: 37.5386, lng: -122.3058 },
    "94404": { lat: 37.5558, lng: -122.2687 },
    "94541": origin,
    "94542": { lat: 37.6588, lng: -122.0452 },
    "94544": { lat: 37.633, lng: -122.0497 },
    "94545": { lat: 37.6276, lng: -122.1244 },
    "94546": { lat: 37.7118, lng: -122.0776 },
    "94552": { lat: 37.7036, lng: -122.0167 },
    "94568": { lat: 37.7208, lng: -121.9071 },
    "94601": { lat: 37.7725, lng: -122.2187 },
    "94612": { lat: 37.8087, lng: -122.2698 },
    "94704": { lat: 37.8665, lng: -122.2586 },
    "95014": { lat: 37.318, lng: -122.0449 },
    "95112": { lat: 37.3447, lng: -121.8839 },
    "95202": { lat: 37.9587, lng: -121.2908 }
  };

  const toRadians = (value) => (value * Math.PI) / 180;

  const distanceMiles = (start, end) => {
    const earthRadiusMiles = 3958.8;
    const latDistance = toRadians(end.lat - start.lat);
    const lngDistance = toRadians(end.lng - start.lng);
    const a = Math.sin(latDistance / 2) ** 2 +
      Math.cos(toRadians(start.lat)) * Math.cos(toRadians(end.lat)) *
      Math.sin(lngDistance / 2) ** 2;
    return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
  };

  const getZipLocation = async (zip) => {
    if (knownZips[zip]) {
      return knownZips[zip];
    }

    const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!response.ok) {
      throw new Error("ZIP code not found");
    }

    const data = await response.json();
    const place = data.places && data.places[0];
    if (!place) {
      throw new Error("ZIP code not found");
    }

    return {
      lat: Number(place.latitude),
      lng: Number(place.longitude)
    };
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const zip = input.value.trim();

    if (!/^\d{5}$/.test(zip)) {
      result.className = "zip-result error";
      result.textContent = "Please enter a valid 5-digit ZIP code.";
      return;
    }

    result.className = "zip-result";
    result.textContent = "Checking service area...";

    try {
      const location = await getZipLocation(zip);
      const miles = distanceMiles(origin, location);

      if (miles <= radiusMiles) {
        result.className = "zip-result success";
        result.textContent = `${zip} is within our service area.`;
      } else {
        result.className = "zip-result error";
        result.textContent = `${zip} is outside our standard service area. Please contact us and we can confirm availability.`;
      }
    } catch (error) {
      result.className = "zip-result error";
      result.textContent = "We could not verify that ZIP code. Please contact us and we can confirm availability.";
    }
  });
}
