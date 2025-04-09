document.querySelectorAll('.marcar').forEach((item) => {
    let holdTimer;
  
    item.addEventListener('mousedown', () => {
      holdTimer = setTimeout(() => {
        item.classList.add('feito');
      }, 800); // segura por 800ms
    });
  
    item.addEventListener('mouseup', () => clearTimeout(holdTimer));
    item.addEventListener('mouseleave', () => clearTimeout(holdTimer));
  });
  