import React, { useState, useEffect, useRef } from 'react';

interface YearCounterProps {
  startYear: number;
  earthOrbitTime: number;
  isPaused: boolean;
  lastPausedTime: number;
}

const YearCounter: React.FC<YearCounterProps> = ({ startYear, earthOrbitTime, isPaused, lastPausedTime }) => {
  const [date, setDate] = useState(new Date(startYear, 0, 1));
  const lastDateRef = useRef(date);

  useEffect(() => {
    if (!isPaused) {
      const now = Date.now();
      const elapsedTime = now - lastPausedTime;
      const daysElapsed = Math.floor((elapsedTime / 1000) * (365 / earthOrbitTime));
      
      const newDate = new Date(lastDateRef.current);
      newDate.setDate(newDate.getDate() + daysElapsed);
      setDate(newDate);
      
      const interval = setInterval(() => {
        setDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(newDate.getDate() + 1);
          
          if (newDate.getDate() === 1 && newDate.getMonth() === 0) {
            newDate.setFullYear(newDate.getFullYear() + 1);
          }
          
          return newDate;
        });
      }, earthOrbitTime * 1000 / 365);

      return () => clearInterval(interval);
    } else {
      lastDateRef.current = date;
    }
  }, [earthOrbitTime, isPaused, lastPausedTime, date]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    const suffix = getDaySuffix(day);
    return { year, month, day, suffix };
  };

  const getDaySuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const { year, month, day, suffix } = formatDate(date);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      color: 'white',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      userSelect: 'none',
      zIndex: 1000,
    }}>
      <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{year}</div>
      <div style={{ fontSize: '18px' }}>{`${month} ${day}${suffix}`}</div>
    </div>
  );
};

YearCounter.displayName = 'YearCounter';

export default YearCounter;