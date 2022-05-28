import { getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";

export const useLoggedIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const { token, steamid } = getPreferenceValues();
    setIsLoggedIn(!!token && !!steamid);
  }, []);
  return isLoggedIn;
};
