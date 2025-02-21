import { RundownData } from "@/models/rundown.model";
import { DateTime, Duration } from "luxon";

export function computeRundownTimeUsecase(rundown: RundownData[]) {
  const timeInformation: {
    startTime: DateTime<true> | undefined;
    endTime: DateTime<true> | undefined;
    actualDuration: Duration<true>;

    startTimeString: string;
    endTimeString: string;
    actualDurationString: string;
  }[] = [];

  for (const i in rundown) {
    const slotIdx = parseInt(i);
    const currentSlot = rundown[slotIdx];

    let actualDuration: Duration<true> = Duration.fromMillis(0); // default to 0

    {
      const event = Duration.fromISO(currentSlot.eventDuration);
      const buffer = Duration.fromISO(currentSlot.bufferDuration);
      if (event.isValid && buffer.isValid) {
        actualDuration = event.plus(buffer);
      } else {
        if (!event.isValid) {
          console.error(`Invalid event duration at order ${currentSlot.order}: ${currentSlot.eventDuration} - ${event.invalidExplanation}`);
        }
        if (!buffer.isValid) {
          console.error(`Invalid buffer duration at order ${currentSlot.order}: ${currentSlot.bufferDuration} - ${buffer.invalidExplanation}`);
        }
      }
    }

    let startTime: DateTime<true> | undefined;

    if (currentSlot.startTime) {
      const time = DateTime.fromISO(currentSlot.startTime);
      if (time.isValid) {
        startTime = time;
      } else {
        console.error(`Invalid start time at order ${currentSlot.order}: ${currentSlot.startTime} - ${time.invalidExplanation}`);
        startTime = undefined;
      }
    } else if (timeInformation.length > 0 && timeInformation[timeInformation.length - 1].endTime) {
      startTime = timeInformation[timeInformation.length - 1].endTime;
    } else {
      startTime = undefined;
    }

    const endTime = startTime !== undefined && actualDuration !== undefined ? startTime.plus(actualDuration) : undefined;

    timeInformation.push({
      startTime,
      endTime,
      actualDuration,
      startTimeString: startTime?.toFormat("D TT") ?? "unbounded",
      endTimeString: endTime?.toFormat("D TT") ?? "unbounded",
      actualDurationString: actualDuration.toFormat("hh:mm:ss"),
    });
  }

  return timeInformation;
}
