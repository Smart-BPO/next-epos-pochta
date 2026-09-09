"use client";

import { useState } from "react";
import { SettlementSelect } from "@/components/atoms/SettlementSelect";
import { Button } from "@/components/atoms/Button";
import { getWebAppCopy } from "@/data/webapp-copy";
import { getSettlementById } from "@/data/settlements";
import { fetchEstimate } from "@/lib/pricing/client";
import { formatUzs, type QuoteEstimate } from "@/lib/pricing/estimate";
import { useTelegram } from "@/components/webapp/TelegramProvider";
import { useWebAppNav } from "@/components/webapp/WebAppNav";
import { fieldControl, fieldLabel } from "@/styles/ui";

export function CalcTab() {
  const { locale, webApp } = useTelegram();
  const { setTab, setDraft } = useWebAppNav();
  const copy = getWebAppCopy(locale);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null);

  const fromMeta = from ? getSettlementById(from) : null;
  const toMeta = to ? getSettlementById(to) : null;
  const weightN = Number(weight);
  const lengthN = Number(length);
  const widthN = Number(width);
  const heightN = Number(height);

  const daysLabel =
    estimate &&
    (locale === "uz" ? `${estimate.etaDays} kun` : `${estimate.etaDays} дн.`);

  const onCalculate = async () => {
    setSubmitted(true);
    setEstimate(null);
    if (!from || !to || from === to || !fromMeta || !toMeta) {
      webApp?.HapticFeedback?.notificationOccurred("error");
      return;
    }

    setEstimating(true);
    const next = await fetchEstimate({
      fromRegionId: fromMeta.regionId,
      fromCityId: fromMeta.id,
      toRegionId: toMeta.regionId,
      toCityId: toMeta.id,
      weightKg: weightN > 0 ? weightN : null,
      lengthCm: lengthN > 0 ? lengthN : null,
      widthCm: widthN > 0 ? widthN : null,
      heightCm: heightN > 0 ? heightN : null,
      unknownDims: !(weightN > 0),
      pickup: false,
      doorDelivery: false,
      places: 1,
      urgent: false,
      category: "parcel",
    });
    setEstimating(false);

    if (!next) {
      webApp?.HapticFeedback?.notificationOccurred("error");
      return;
    }

    setEstimate(next);
    webApp?.HapticFeedback?.notificationOccurred("success");
  };

  const goShip = () => {
    setDraft({
      from,
      to,
      weight,
      length,
      width,
      height,
    });
    setTab("ship");
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="m-0 font-display text-2xl font-semibold uppercase tracking-[-0.03em] text-black">
          {copy.calcTitle}
        </h1>
        <p className="m-0 mt-1 text-sm text-black/55">{copy.calcLead}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white p-4 shadow-[0_8px_28px_rgb(15_18_24/0.05)]">
        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.fromLabel}</span>
          <SettlementSelect
            instanceId="wa-calc-from"
            locale={locale}
            value={from}
            onChange={setFrom}
            placeholder={copy.fromLabel}
            variant="compact"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.toLabel}</span>
          <SettlementSelect
            instanceId="wa-calc-to"
            locale={locale}
            value={to}
            onChange={setTo}
            placeholder={copy.toLabel}
            variant="compact"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={fieldLabel}>{copy.weightLabel}</span>
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={fieldControl}
            inputMode="decimal"
            placeholder="1.5"
          />
        </label>
        <fieldset className="m-0 grid gap-2 border-0 p-0">
          <legend className={fieldLabel}>{copy.dimsLabel}</legend>
          <div className="grid grid-cols-3 gap-2">
            <input
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className={fieldControl}
              inputMode="numeric"
              placeholder={copy.lengthLabel}
            />
            <input
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className={fieldControl}
              inputMode="numeric"
              placeholder={copy.widthLabel}
            />
            <input
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className={fieldControl}
              inputMode="numeric"
              placeholder={copy.heightLabel}
            />
          </div>
        </fieldset>

        {submitted && (!from || !to || from === to) ? (
          <p className="m-0 text-sm text-primary">{copy.calcNeedRoute}</p>
        ) : null}

        <Button
          type="button"
          variant="primary"
          width="full"
          disabled={estimating}
          onClick={() => void onCalculate()}
        >
          {copy.calcCta}
        </Button>
      </div>

      {submitted && estimate ? (
        <div className="rounded-3xl border border-primary/20 bg-primary-soft/40 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
            {copy.calcResult}
          </p>
          <p className="m-0 mt-1 font-display text-3xl font-bold tracking-[-0.03em] text-ink">
            {formatUzs(estimate.amount, locale)} UZS
          </p>
          <p className="m-0 mt-1 text-sm text-black/55">
            {copy.calcEta}: {daysLabel}
          </p>
          <p className="m-0 mt-3 text-xs leading-snug text-black/50">
            {copy.disclaimer}
          </p>
          <Button
            type="button"
            variant="primary"
            width="full"
            className="mt-4"
            onClick={goShip}
          >
            {copy.calcToShip}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
