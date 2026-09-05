"use client";

const STATUSES = ["draft", "pending_manager", "confirmed", "cancelled"] as const;

export function ShipmentStatusForm({
  id,
  status,
  trackNumber,
  action,
}: {
  id: string;
  status: string;
  trackNumber: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        className="rounded border border-black/12 px-2 py-1 text-xs"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        name="track_number"
        defaultValue={trackNumber}
        placeholder="Трек-номер"
        className="rounded border border-black/12 px-2 py-1 text-xs"
      />
      <button type="submit" className="text-xs font-semibold text-primary">
        Сохранить
      </button>
    </form>
  );
}
