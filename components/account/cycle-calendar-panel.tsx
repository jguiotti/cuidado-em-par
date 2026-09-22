"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  logCyclePeriodStartAction,
  markPossiblePregnancyAction,
  updateCycleCalendarSettingsAction,
  type CycleAccountSnapshot,
} from "@/app/actions/profile-health";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Surface } from "@/components/ui/surface";
import { TextField } from "@/components/ui/text-field";
import {
  buildMonthGrid,
  type CycleDayKind,
} from "@/lib/cycle/calendar";
import { todayInSaoPaulo } from "@/lib/habits/day";
import { accountCopy } from "@/lib/i18n/account-pt-br";

interface CycleCalendarPanelProps {
  snapshot: CycleAccountSnapshot | null;
  cycleMode: string | null;
  hasCycleModule: boolean;
}

function kindClass(kind: CycleDayKind, isToday: boolean): string {
  const base =
    "flex aspect-square items-center justify-center rounded-full text-xs font-semibold";
  const ring = isToday
    ? " shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-mint-deep)_55%,transparent)]"
    : "";
  switch (kind) {
    case "period":
      return `${base}${ring} bg-blush text-ink`;
    case "fertile":
      return `${base}${ring} bg-mint text-mint-deep`;
    case "ovulation":
      return `${base}${ring} bg-mint-deep text-white`;
    case "predicted-period":
      return `${base}${ring} bg-blush/40 text-ink-soft`;
    case "late":
      return `${base}${ring} bg-surface-raised text-ink font-bold`;
    default:
      return `${base}${ring} text-ink-soft`;
  }
}

function monthLabel(year: number, monthIndex0: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex0, 1)));
}

export function CycleCalendarPanel({
  snapshot,
  cycleMode,
  hasCycleModule,
}: CycleCalendarPanelProps) {
  const router = useRouter();
  const today = todayInSaoPaulo();
  const [viewYear, setViewYear] = useState(() => Number(today.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => Number(today.slice(5, 7)) - 1);
  const [lastPeriodStart, setLastPeriodStart] = useState(
    snapshot?.lastPeriodStart ?? "",
  );
  const [cycleLength, setCycleLength] = useState(
    String(snapshot?.averageCycleLengthDays ?? 28),
  );
  const [periodLength, setPeriodLength] = useState(
    String(snapshot?.averagePeriodLengthDays ?? 5),
  );
  const [remindPeriod, setRemindPeriod] = useState(
    snapshot?.remindPeriodApproaching ?? true,
  );
  const [remindFertile, setRemindFertile] = useState(
    snapshot?.remindFertileWindow ?? true,
  );
  const [remindLate, setRemindLate] = useState(
    snapshot?.remindLateOrPossiblePregnancy ?? true,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const profileInput = useMemo(
    () => ({
      lastPeriodStart: lastPeriodStart || null,
      averageCycleLengthDays: Number(cycleLength) || 28,
      averagePeriodLengthDays: Number(periodLength) || 5,
      today,
    }),
    [lastPeriodStart, cycleLength, periodLength, today],
  );

  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, profileInput),
    [viewYear, viewMonth, profileInput],
  );

  const firstWeekday = useMemo(() => {
    const d = new Date(Date.UTC(viewYear, viewMonth, 1, 12));
    return d.getUTCDay();
  }, [viewYear, viewMonth]);

  function shiftMonth(delta: number) {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1, 12));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  }

  function handleSaveSettings(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateCycleCalendarSettingsAction({
        lastPeriodStart: lastPeriodStart || null,
        averageCycleLengthDays: Number(cycleLength),
        averagePeriodLengthDays: Number(periodLength),
        remindPeriodApproaching: remindPeriod,
        remindFertileWindow: remindFertile,
        remindLateOrPossiblePregnancy: remindLate,
      });
      if (!result.ok) {
        setError(accountCopy.genericError);
        return;
      }
      setMessage(accountCopy.saved);
      router.refresh();
    });
  }

  function handleLogToday() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await logCyclePeriodStartAction({ periodStart: today });
      if (!result.ok) {
        setError(accountCopy.genericError);
        return;
      }
      setLastPeriodStart(today);
      setMessage(accountCopy.saved);
      router.refresh();
    });
  }

  function handlePossiblePregnancy() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await markPossiblePregnancyAction();
      if (!result.ok) {
        setError(accountCopy.genericError);
        return;
      }
      setMessage(accountCopy.saved);
      router.refresh();
    });
  }

  if (cycleMode === "pregnancy" || cycleMode === "postpartum") {
    return (
      <Surface className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">
          {accountCopy.cycle.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.cycle.pregnancyMode}
        </p>
      </Surface>
    );
  }

  if (!hasCycleModule || !snapshot) {
    return (
      <Surface className="space-y-2">
        <h2 className="text-xl font-semibold text-ink">
          {accountCopy.cycle.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.cycle.inactive}
        </p>
      </Surface>
    );
  }

  return (
    <Surface className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-ink">
          {accountCopy.cycle.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          {accountCopy.cycle.support}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 px-3"
            onClick={() => shiftMonth(-1)}
            aria-label={accountCopy.cycle.monthPrev}
          >
            ‹
          </Button>
          <p className="text-base font-semibold capitalize text-ink">
            {monthLabel(viewYear, viewMonth)}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 px-3"
            onClick={() => shiftMonth(1)}
            aria-label={accountCopy.cycle.monthNext}
          >
            ›
          </Button>
        </div>

        <div
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label={accountCopy.cycle.title}
        >
          {accountCopy.cycle.weekdays.map((label, index) => (
            <span
              key={`${label}-${index}`}
              role="columnheader"
              className="py-1 text-center text-xs font-semibold text-ink-soft"
            >
              {label}
            </span>
          ))}
          {Array.from({ length: firstWeekday }).map((_, index) => (
            <span key={`pad-${index}`} role="gridcell" aria-hidden />
          ))}
          {cells.map((cell) => {
            const dayNum = Number(cell.isoDate.slice(8, 10));
            const isToday = cell.isoDate === today;
            const kindLabel = accountCopy.cycle.dayKindLabel[cell.kind];
            return (
              <span
                key={cell.isoDate}
                role="gridcell"
                className={kindClass(cell.kind, isToday)}
                aria-label={accountCopy.cycle.dayAria(
                  dayNum,
                  kindLabel,
                  isToday,
                )}
              >
                {dayNum}
              </span>
            );
          })}
        </div>

        <ul className="flex flex-wrap gap-3 text-xs text-ink-soft">
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blush" aria-hidden />
            {accountCopy.cycle.legendPeriod}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-mint" aria-hidden />
            {accountCopy.cycle.legendFertile}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-mint-deep" aria-hidden />
            {accountCopy.cycle.legendOvulation}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blush/40" aria-hidden />
            {accountCopy.cycle.legendPredicted}
          </li>
        </ul>
      </div>

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
        <TextField
          label={accountCopy.cycle.lastPeriod}
          name="lastPeriodStart"
          type="date"
          value={lastPeriodStart}
          onChange={(event) => setLastPeriodStart(event.target.value)}
          disabled={isPending}
        />
        <TextField
          label={accountCopy.cycle.cycleLength}
          name="cycleLength"
          type="number"
          min={21}
          max={45}
          value={cycleLength}
          onChange={(event) => setCycleLength(event.target.value)}
          disabled={isPending}
          required
        />
        <TextField
          label={accountCopy.cycle.periodLength}
          name="periodLength"
          type="number"
          min={2}
          max={10}
          value={periodLength}
          onChange={(event) => setPeriodLength(event.target.value)}
          disabled={isPending}
          required
        />

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-ink">
            {accountCopy.cycle.remindersTitle}
          </legend>
          <p className="text-sm leading-relaxed text-ink-soft">
            {accountCopy.cycle.remindersPrivacyHint}
          </p>
          <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink">
            <input
              type="checkbox"
              className="focus-ring mt-0.5 size-5 shrink-0 accent-[var(--color-mint-deep)]"
              checked={remindPeriod}
              onChange={(event) => setRemindPeriod(event.target.checked)}
              disabled={isPending}
            />
            <span>{accountCopy.cycle.remindPeriod}</span>
          </label>
          <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink">
            <input
              type="checkbox"
              className="focus-ring mt-0.5 size-5 shrink-0 accent-[var(--color-mint-deep)]"
              checked={remindFertile}
              onChange={(event) => setRemindFertile(event.target.checked)}
              disabled={isPending}
            />
            <span>{accountCopy.cycle.remindFertile}</span>
          </label>
          <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink">
            <input
              type="checkbox"
              className="focus-ring mt-0.5 size-5 shrink-0 accent-[var(--color-mint-deep)]"
              checked={remindLate}
              onChange={(event) => setRemindLate(event.target.checked)}
              disabled={isPending}
            />
            <span>{accountCopy.cycle.remindLate}</span>
          </label>
        </fieldset>

        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
        {message && !error ? (
          <p className="text-sm text-ink-soft" role="status">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="w-full">
          {accountCopy.cycle.saveSettings}
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={handleLogToday}
          className="w-full"
        >
          {accountCopy.cycle.logPeriod}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={handlePossiblePregnancy}
          className="w-full"
        >
          {accountCopy.cycle.possiblePregnancy}
        </Button>
        <p className="text-xs leading-relaxed text-ink-soft">
          {accountCopy.cycle.possiblePregnancyHint}
        </p>
      </div>

      <p className="text-xs leading-relaxed text-ink-soft">
        {accountCopy.cycle.disclaimer}
      </p>
    </Surface>
  );
}
