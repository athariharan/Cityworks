import { useState } from "react";

export function useToast(duration = 4000) {
  const [activeToast, setActiveToast] = useState(null);

  const displayToast = (message, toastType = "success") => {
    setActiveToast({ message, toastType });
    setTimeout(() => setActiveToast(null), duration);
  };

  return [activeToast, displayToast];
}
