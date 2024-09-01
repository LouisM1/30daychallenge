import React from 'react';

interface PlanetInfoProps {
  planet: {
    name: string;
    gravity: number;
    yearLength: string;
    funFact: string;
  } | undefined;
  position: 'left' | 'right';
}

const PlanetInfo: React.FC<PlanetInfoProps> = ({ planet, position }) => {
  if (!planet) return null;

  return (
    <div style={{
      position: 'fixed',
      [position]: '20px',
      top: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '300px',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      zIndex: 1000,
    }}>
      <h2 style={{ 
        marginTop: 0, 
        marginBottom: '15px', 
        fontSize: '28px', 
        fontWeight: 'bold' 
      }}>
        {planet.name}
      </h2>
      <p><strong>Gravity:</strong> {planet.gravity} m/s²</p>
      <p><strong>Year length:</strong> {planet.yearLength}</p>
      <p><strong>Fun fact:</strong> {planet.funFact}</p>
    </div>
  );
};

PlanetInfo.displayName = 'PlanetInfo';

export default PlanetInfo;