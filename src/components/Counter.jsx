import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => Math.max(0, c - 1));
  const reset = () => setCount(0);

  return (
    <div className="counter" aria-label="Counter component">
      <div className="counter__display" aria-live="assertive" aria-atomic="true">
        Count: {count}
      </div>

      <div className="counter__controls">
        <button type="button" onClick={increment} aria-label="Increment">+</button>
        <button
          type="button"
          onClick={decrement}
          disabled={count === 0}
          aria-label="Decrement"
          aria-disabled={count === 0}
        >
          -
        </button>
        <button type="button" onClick={reset} aria-label="Reset">Reset</button>
      </div>
    </div>
  );
};

export default Counter;
