import { formatDuration, addMinutes, intervalToDuration } from "date-fns";

export const humanTime = (time: number) => {
  const now = new Date();
  const end = addMinutes(now, time);
  const duration = intervalToDuration({ start: now, end });
  return formatDuration(duration);
};
