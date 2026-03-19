import { useFonts, Agbalumo_400Regular } from '@expo-google-fonts/agbalumo';
import { Itim_400Regular } from '@expo-google-fonts/itim';

export function useAppFonts() {
  const [fontsLoaded] = useFonts({
    Agbalumo_400Regular,
    Itim_400Regular,
  });
  return fontsLoaded;
}