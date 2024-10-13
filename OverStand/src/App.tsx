import React from 'react';
import ScrollableCanvas from './ScrollableCanvas';

const App: React.FC = () => {
  const images = [
    '1.jpg',
    '1.jpg',
    '1.jpg',
    // Add more image URLs as needed
  ];

  return (
    <div className="App">
      {/* <iframe src = "Gentleman.pdf" width="100%" height="600px"/> */}
      <ScrollableCanvas images={images} width={800} height={600} />
    </div>
  );
};

export default App;
