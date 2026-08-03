let applyParallax = section => {
  
    section.addEventListener('mousemove', e => {

      let { width, height } = section.getBoundingClientRect();
      let offX = e.pageX - (width * 0.5);
      let offY = e.pageY - (height * 0.5);
  
      for (let layer of document.querySelectorAll('.img')) {
        const speed = layer.getAttribute('data-speed')
        const x = (offX * speed) / 100;
        const y = ((offY * speed) / 100);

        layer.style.transform = `translateX(${x}px) translateY(${y}px)`
      }
    });  
};

applyParallax(document.getElementById('parallax'));