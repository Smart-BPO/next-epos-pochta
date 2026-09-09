"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import {
  settlementLabel,
  uzbekistanHubSettlements,
} from "@/data/settlements";
import { estimateQuote, formatUzs } from "@/lib/pricing/estimate";
import type { PricingConfig, PricingRouteOverride } from "@/lib/pricing/types";
import {
  dashBtnPrimary,
  dashBtnSecondary,
  dashCardPad,
  dashInput,
} from "@/styles/dashboard";
import {
  deleteRouteAction,
  importRoutesCsvAction,
  upsertRouteAction,
} from "@/app/dashboard/(app)/pricing/actions";
import { routesToCsv } from "@/lib/pricing/routes";

export function PricingMatrixPanel({
  initialRoutes,
  config,
  formulaVersion,
  canWrite,
}: {
  initialRoutes: PricingRouteOverride[];
  config: PricingConfig;
  formulaVersion: string;
  canWrite: boolean;
}) {
  const t = useDashT();
  const [routes, setRoutes] = useState(initialRoutes);
  const [fromId, setFromId] = useState(
    uzbekistanHubSettlements[0]?.id ?? "",
  );
  const [toId, setToId] = useState(uzbekistanHubSettlements[1]?.id ?? "");
  const [base, setBase] = useState(55000);
  const [perKg, setPerKg] = useState(7000);
  const [etaMin, setEtaMin] = useState<string>("2");
  const [etaMax, setEtaMax] = useState<string>("5");
  const [csv, setCsv] = useState("");
  const [pending, startTransition] = useTransition();

  const preview = useMemo(() => {
    const from = uzbekistanHubSettlements.find((s) => s.id === fromId);
    const to = uzbekistanHubSettlements.find((s) => s.id === toId);
    if (!from || !to) return null;
    return estimateQuote(
      {
        fromRegionId: from.regionId,
        fromCityId: from.id,
        toRegionId: to.regionId,
        toCityId: to.id,
        weightKg: 1,
        lengthCm: 20,
        widthCm: 15,
        heightCm: 10,
        unknownDims: false,
        pickup: false,
        doorDelivery: false,
        places: 1,
        urgent: false,
        category: "parcel",
      },
      config,
      formulaVersion,
      routes,
    );
  }, [config, formulaVersion, fromId, toId, routes]);

  const savePair = () => {
    if (!fromId || !toId || fromId === toId) {
      toast.error("Выберите два разных хаба");
      return;
    }
    startTransition(async () => {
      try {
        const saved = await upsertRouteAction({
          fromSettlementId: fromId,
          toSettlementId: toId,
          baseUzs: base,
          perKgUzs: perKg,
          etaMin: etaMin ? Number(etaMin) : null,
          etaMax: etaMax ? Number(etaMax) : null,
          active: true,
        });
        setRoutes((prev) => {
          const rest = prev.filter(
            (r) =>
              !(
                r.fromSettlementId === saved.fromSettlementId &&
                r.toSettlementId === saved.toSettlementId
              ),
          );
          return [...rest, saved].sort((a, b) =>
            `${a.fromSettlementId}-${a.toSettlementId}`.localeCompare(
              `${b.fromSettlementId}-${b.toSettlementId}`,
            ),
          );
        });
        toast.success(t.common.save);
      } catch {
        toast.error(t.errors.saveFailed);
      }
    });
  };

  const remove = (id: number) => {
    startTransition(async () => {
      try {
        await deleteRouteAction(id);
        setRoutes((prev) => prev.filter((r) => r.id !== id));
        toast.success(t.common.deleted);
      } catch {
        toast.error(t.errors.saveFailed);
      }
    });
  };

  const importCsv = () => {
    startTransition(async () => {
      try {
        const count = await importRoutesCsvAction(csv);
        toast.success(`Импорт: ${count}`);
        window.location.reload();
      } catch {
        toast.error(t.errors.saveFailed);
      }
    });
  };

  const exportCsv = () => {
    const text = routesToCsv(routes);
    void navigator.clipboard.writeText(text);
    toast.success(t.common.copied);
  };

  const hubLabel = (id: string) => {
    const s = uzbekistanHubSettlements.find((h) => h.id === id);
    return s ? settlementLabel(s, "ru") : id;
  };

  return (
    <div className="space-y-5">
      <section className={`${dashCardPad} space-y-3`}>
        <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
          Оверрайд пары хабов
        </h2>
        <p className="m-0 text-sm text-black/50">
          Sparse-матрица поверх зон. Пустая пара = зональный расчёт.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
            From
            <select
              className={`${dashInput} font-normal normal-case`}
              value={fromId}
              disabled={!canWrite}
              onChange={(e) => setFromId(e.target.value)}
            >
              {uzbekistanHubSettlements.map((s) => (
                <option key={s.id} value={s.id}>
                  {settlementLabel(s, "ru")}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
            To
            <select
              className={`${dashInput} font-normal normal-case`}
              value={toId}
              disabled={!canWrite}
              onChange={(e) => setToId(e.target.value)}
            >
              {uzbekistanHubSettlements.map((s) => (
                <option key={s.id} value={s.id}>
                  {settlementLabel(s, "ru")}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
            Base
            <input
              type="number"
              className={`${dashInput} font-normal normal-case`}
              value={base}
              disabled={!canWrite}
              onChange={(e) => setBase(Number(e.target.value))}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
            Per kg
            <input
              type="number"
              className={`${dashInput} font-normal normal-case`}
              value={perKg}
              disabled={!canWrite}
              onChange={(e) => setPerKg(Number(e.target.value))}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
            ETA min
            <input
              type="number"
              className={`${dashInput} font-normal normal-case`}
              value={etaMin}
              disabled={!canWrite}
              onChange={(e) => setEtaMin(e.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
            ETA max
            <input
              type="number"
              className={`${dashInput} font-normal normal-case`}
              value={etaMax}
              disabled={!canWrite}
              onChange={(e) => setEtaMax(e.target.value)}
            />
          </label>
        </div>
        {canWrite ? (
          <button
            type="button"
            className={dashBtnPrimary}
            disabled={pending}
            onClick={savePair}
          >
            Сохранить пару
          </button>
        ) : null}
        {preview ? (
          <p className="m-0 text-sm text-ink">
            Превью 1 кг:{" "}
            <strong>
              {formatUzs(preview.amount, "ru")} {preview.currency}
            </strong>{" "}
            · {preview.etaDays} дн. · {preview.rateSource}
          </p>
        ) : null}
      </section>

      <section className={`${dashCardPad} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
            Активные оверрайды ({routes.length})
          </h2>
          <button type="button" className={dashBtnSecondary} onClick={exportCsv}>
            CSV в буфер
          </button>
        </div>
        {routes.length === 0 ? (
          <p className="m-0 text-sm text-black/45">Пока нет пар — везде зоны.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-black/40">
                  <th className="py-2 pr-2 font-semibold">From</th>
                  <th className="py-2 pr-2 font-semibold">To</th>
                  <th className="py-2 pr-2 font-semibold">Base</th>
                  <th className="py-2 pr-2 font-semibold">/kg</th>
                  <th className="py-2 pr-2 font-semibold">ETA</th>
                  <th className="py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.id ?? `${r.fromSettlementId}-${r.toSettlementId}`} className="border-b border-black/5">
                    <td className="py-2 pr-2">{hubLabel(r.fromSettlementId)}</td>
                    <td className="py-2 pr-2">{hubLabel(r.toSettlementId)}</td>
                    <td className="py-2 pr-2">{r.baseUzs}</td>
                    <td className="py-2 pr-2">{r.perKgUzs}</td>
                    <td className="py-2 pr-2">
                      {r.etaMin ?? "—"}–{r.etaMax ?? "—"}
                    </td>
                    <td className="py-2">
                      {canWrite && r.id ? (
                        <button
                          type="button"
                          className="text-xs font-semibold text-primary"
                          disabled={pending}
                          onClick={() => remove(r.id!)}
                        >
                          Удалить
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canWrite ? (
        <section className={`${dashCardPad} space-y-3`}>
          <h2 className="m-0 text-[0.95rem] font-semibold text-ink">
            Импорт CSV
          </h2>
          <p className="m-0 text-xs text-black/45">
            from,to,base,perKg,etaMin,etaMax — заменяет всю матрицу
          </p>
          <textarea
            className={`${dashInput} min-h-28 font-mono text-xs font-normal normal-case`}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder="tashkent_city,samarkand_city,45000,5000,1,3"
          />
          <button
            type="button"
            className={dashBtnSecondary}
            disabled={pending || !csv.trim()}
            onClick={importCsv}
          >
            Импортировать
          </button>
        </section>
      ) : null}
    </div>
  );
}
