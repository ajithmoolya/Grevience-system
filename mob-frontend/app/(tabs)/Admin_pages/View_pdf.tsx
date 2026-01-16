import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

export default function ViewProof() {
  const { url } = useLocalSearchParams();

  useEffect(() => {
    WebBrowser.openBrowserAsync(url as string);
  }, []);

  return null;
}
