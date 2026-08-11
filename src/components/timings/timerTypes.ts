export interface TimerData {
  times: {
    startTime: number;
    lrtAdjustedStartTime: number;

    endTime: number | null;
  };

  splits: {
    name: string;

    active: boolean;
    lrtMillis: number | null;
  }[];
}
