import { useRef } from "react";

export const useLazy = (delayInMs: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();

  return (callback: () => void) => {
    if (timeoutRef.current != undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    timeoutRef.current = setTimeout(() => {
      callback();
      timeoutRef.current == undefined;
    }, delayInMs);
  };
};
