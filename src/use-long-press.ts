// https://stackoverflow.com/a/54749871

import { useState, useEffect } from 'react';

export default function useLongPress(callback: () => void, ms = 300) {
  const [startLongPress, setStartLongPress] = useState(false);

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined = undefined;

    if (startLongPress) {
      timerId = setTimeout(callback, ms);
    } else {
      timerId && clearTimeout(timerId);
    }

    return () => {
      timerId && clearTimeout(timerId);
    };

  },
  // eslint-disable-next-line
  [ startLongPress ]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
}