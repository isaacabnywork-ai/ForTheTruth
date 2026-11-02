import { permanentRedirect } from "next/navigation";

export default async function ShopPageCatchall({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlParams.append(key, v));
      } else {
        urlParams.set(key, value);
      }
    }
  }
  const qs = urlParams.toString();
  permanentRedirect(qs ? `/shop?${qs}` : "/shop");
}
