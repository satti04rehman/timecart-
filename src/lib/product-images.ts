import type { StaticImageData } from "next/image";

import armaniExchangeChronograph from "@/images/products/armani-exchange-chronograph.jpg";
import casioA168ClassicDigital from "@/images/products/casio-a168-classic-digital.jpg";
import casioClassicIlluminatorCa53w from "@/images/products/casio-classic-illuminator-ca53w.jpg";
import casioEdificeEcb900 from "@/images/products/casio-edifice-ecb-900.jpg";
import casioF91wClassic from "@/images/products/casio-f91w-classic.jpg";
import casioGShockGa2100 from "@/images/products/casio-g-shock-ga-2100.jpg";
import citizenEccoDriveLadies from "@/images/products/citizen-ecco-drive-ladies.jpg";
import citizenEccoDrivePromaster from "@/images/products/citizen-ecco-drive-promaster.jpg";
import fossilCarolineMini from "@/images/products/fossil-caroline-mini.jpg";
import fossilJr1437Chronograph from "@/images/products/fossil-jr1437-chronograph.jpg";
import garminForerunner165 from "@/images/products/garmin-forerunner-165.jpg";
import garminVivoactive5 from "@/images/products/garmin-vivoactive-5.jpg";
import hushPuppiesRefined from "@/images/products/hush-puppies-refined.jpg";
import orientBambinoV2 from "@/images/products/orient-bambino-v2.jpg";
import orientKamasuDiver from "@/images/products/orient-kamasu-diver.jpg";
import seiko5SportsAutomatic from "@/images/products/seiko-5-sports-automatic.jpg";
import seikoPresageCocktail from "@/images/products/seiko-presage-cocktail.jpg";
import seikoSnk809Automatic from "@/images/products/seiko-snk809-automatic.jpg";
import seikoSportsLadiesQuartz from "@/images/products/seiko-sports-ladies-quartz.jpg";
import timexExpeditionField from "@/images/products/timex-expedition-field.jpg";
import timexWeekender38 from "@/images/products/timex-weekender-38.jpg";
import titanEdgeLadies from "@/images/products/titan-edge-ladies.jpg";
import titanRegaliaAutomatic from "@/images/products/titan-regalia-automatic.jpg";

const PRODUCT_IMAGES: Record<string, StaticImageData> = {
  "armani-exchange-chronograph": armaniExchangeChronograph,
  "casio-a168-classic-digital": casioA168ClassicDigital,
  "casio-classic-illuminator-ca53w": casioClassicIlluminatorCa53w,
  "casio-edifice-ecb-900": casioEdificeEcb900,
  "casio-f91w-classic": casioF91wClassic,
  "casio-g-shock-ga-2100": casioGShockGa2100,
  "citizen-ecco-drive-ladies": citizenEccoDriveLadies,
  "citizen-ecco-drive-promaster": citizenEccoDrivePromaster,
  "fossil-caroline-mini": fossilCarolineMini,
  "fossil-jr1437-chronograph": fossilJr1437Chronograph,
  "garmin-forerunner-165": garminForerunner165,
  "garmin-vivoactive-5": garminVivoactive5,
  "hush-puppies-refined": hushPuppiesRefined,
  "orient-bambino-v2": orientBambinoV2,
  "orient-kamasu-diver": orientKamasuDiver,
  "seiko-5-sports-automatic": seiko5SportsAutomatic,
  "seiko-presage-cocktail": seikoPresageCocktail,
  "seiko-snk809-automatic": seikoSnk809Automatic,
  "seiko-sports-ladies-quartz": seikoSportsLadiesQuartz,
  "timex-expedition-field": timexExpeditionField,
  "timex-weekender-38": timexWeekender38,
  "titan-edge-ladies": titanEdgeLadies,
  "titan-regalia-automatic": titanRegaliaAutomatic,
};

const LOCAL_PRODUCT_RE = /\/images\/products\/([a-z0-9-]+)\.jpg$/;

export function resolveProductImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "";
  const match = imageUrl.match(LOCAL_PRODUCT_RE);
  if (!match) return imageUrl;
  return PRODUCT_IMAGES[match[1]]?.src ?? imageUrl;
}