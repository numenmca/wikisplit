import type { TimerData } from "./timerTypes";

export class NotPausedError extends Error {}

export class TimeController {
  private timerData = $state<TimerData>({
    times: {
      startTime: 0,
      lrtAdjustedStartTime: 0,
      endTime: null,
    },

    splits: [],
  });

  private running = $state(false);
  private ended = $state(false);

  private lrtPauseStart = $state<number | null>(null);
  private lrtPauseLastTime = $state(0);

  constructor() {
    const now = performance.now();

    this.timerData = {
      times: {
        startTime: now,
        lrtAdjustedStartTime: now,
        endTime: now,
      },

      splits: [],
    };
  }

  public splits = $derived(this.timerData.splits);

  public getRTA() {
    if (this.timerData.times.endTime) {
      return this.timerData.times.endTime - this.timerData.times.startTime;
    }

    return performance.now() - this.timerData.times.startTime;
  }

  public getLRT() {
    if (this.timerData.times.endTime) {
      return (
        this.timerData.times.endTime - this.timerData.times.lrtAdjustedStartTime
      );
    }

    if (this.lrtPauseStart == null) {
      return performance.now() - this.timerData.times.lrtAdjustedStartTime;
    } else {
      return this.lrtPauseStart - this.timerData.times.lrtAdjustedStartTime;
    }
  }

  public isRunning() {
    return this.lrtPauseStart == null && this.running;
  }

  public isEnded() {
    return this.ended;
  }

  public pauseLRT() {
    if (this.lrtPauseStart != null) return;
    if (!this.running) return;

    this.lrtPauseLastTime = this.timerData.times.lrtAdjustedStartTime;
    this.lrtPauseStart = performance.now();
  }

  public resumeLRT() {
    if (this.lrtPauseStart == null) return;
    if (!this.running) return;

    const now = performance.now();

    this.timerData.times.lrtAdjustedStartTime =
      this.lrtPauseLastTime + (now - this.lrtPauseStart);

    this.lrtPauseStart = null;
    this.lrtPauseLastTime = 0;
  }

  public start() {
    const now = performance.now();

    this.timerData = {
      times: {
        startTime: now,
        lrtAdjustedStartTime: now,
        endTime: null,
      },

      splits: [],
    };

    this.running = true;
    this.ended = false;
    this.lrtPauseLastTime = 0;
    this.lrtPauseStart = null;
  }

  public end() {
    if (this.ended) return;

    this.timerData.times.endTime = performance.now();
    this.ended = true;
    this.running = false;

    const newestSplit = this.timerData.splits.findIndex(
      (split) => split.active,
    );

    if (newestSplit == -1) {
      // This is the first split
    } else {
      this.timerData.splits[newestSplit].active = false;
      this.timerData.splits[newestSplit].lrtMillis = this.getLRT();
    }
  }

  public split(name: string) {
    // check if split before this existed
    const newestSplit = this.timerData.splits.findIndex(
      (split) => split.active,
    );

    this.timerData.splits.push({
      name,
      active: true,
      lrtMillis: null,
    });

    if (newestSplit == -1) {
      // This is the first split
    } else {
      this.timerData.splits[newestSplit].active = false;
      this.timerData.splits[newestSplit].lrtMillis = this.getLRT();
    }
  }

  public reset() {
    const now = performance.now();

    this.timerData = {
      times: {
        startTime: now,
        lrtAdjustedStartTime: now,
        endTime: now,
      },

      splits: [],
    };

    this.running = false;
    this.ended = false;
    this.lrtPauseLastTime = 0;
    this.lrtPauseStart = null;
  }
}
