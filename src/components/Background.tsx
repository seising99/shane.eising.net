// components/Background.js

const Background = () => {

    const images = ['src/assets/background_still.png', 'src/assets/background.gif'];
    
    const swapImages = () => {
        const body = document.body;
        const currentImage = body.style.backgroundImage;
        const nextImage = `url(${images[1]})`;
    
        body.style.backgroundImage = nextImage;
    
        setTimeout(() => {
          body.style.backgroundImage = `url(${images[0]})`;
        }, 2000);
      };

  return (
    <div
      style={{
       display: "inline-block",
       textAlign: "center"
      }}
    >
      <button style={{color: "purple", fontStyle: "bold"}} onClick={swapImages}>CLICK ME</button>
    </div>
  );
};

export default Background;