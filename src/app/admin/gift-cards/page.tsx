import { Suspense } from "react";
import { requireAdmin } from "@/lib/adminGuard";
import {
  getGiftCardOverview,
  getGiftCardsPaged,
  getGiftCardTransactionsPaged,
  getGiftCardSettings,
} from "@/services/giftCards";
import { AdminGiftCardsClient } from "@/components/admin/AdminGiftCardsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function GiftCardsAdminData() {
  const [overview, pagedCards, pagedTx, settings] = await Promise.all([
    getGiftCardOverview(),
    getGiftCardsPaged({ limit: 50 }),
    getGiftCardTransactionsPaged({ limit: 50 }),
    getGiftCardSettings(),
  ]);

  return (
    <AdminGiftCardsClient
      initialOverview={overview}
      initialCards={pagedCards.cards}
      initialTransactions={pagedTx.transactions}
      initialSettings={settings}
      totalCards={pagedCards.total}
      totalTransactions={pagedTx.total}
    />
  );
}

export default async function AdminGiftCardsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    return (
      <div className="p-10 text-center text-sm font-semibold text-slate-500">
        You do not have administrative permission to view the Gift Cards Hub.
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="p-8 max-w-7xl mx-auto w-full animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
            ))}
          </div>
          <div className="h-96 bg-slate-100 rounded-3xl" />
        </div>
      }
    >
      <GiftCardsAdminData />
    </Suspense>
  );
}
