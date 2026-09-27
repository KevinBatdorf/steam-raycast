import { getPreferenceValues, LocalStorage } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { useEffect, useState } from "react";

export const useIsLoggedIn = () => {
  const { token, steamid } = getPreferenceValues<Preferences>();
  const [loggedIn, setLoggedIn] = useState(Boolean(token && steamid));
  useEffect(() => {
    // If nothing is set, we don't have to check for an api key error
    if (token && steamid) {
      LocalStorage.getItem("API_KEY_ERROR").then((value) => {
        // Check if the current key/token matches the previously failed one
        // And if it does NOT, then give it a chance to auth again
        setLoggedIn(value !== token.trim() + steamid.trim());
      });
    }
  }, [token, steamid]);
  return loggedIn;
};

export const useShowingDetail = () => {
  const [showingDetail, setShowingDetail] = useCachedState("showing-detail", false);
  return { showingDetail, toggleDetail: () => setShowingDetail((current) => !current) };
};
