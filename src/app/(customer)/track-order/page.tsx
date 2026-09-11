import { Suspense } from "react";
import { TrackOrderPage } from "@/components/track/track-order-page";

export default function TrackOrderRoute() {
  return (
    <Suspense fallback={<PageFallback />}>
      <TrackOrderPage />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="container-tc py-10 lg:py-14">
      <div className="h-4 w-32 animate-pulse rounded bg-soft-gray" />
      <div className="mt-3 h-9 w-64 animate-pulse rounded bg-soft-gray" />
      <div className="mt-4 h-12 w-full max-w-md animate-pulse rounded-xl bg-soft-gray" />
    </div>
  );
}