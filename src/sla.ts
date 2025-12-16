import { Conversation } from './types/conversation';
import { AppliedSla, SLAStatus } from './types/sla';

// Business Hours Configuration Types
export interface WorkingHoursConfig {
  [key: string]: { start: string; finish: string } | null;
}

export interface BusinessHoursConfig {
  working_hours_enabled: boolean;
  timezone: string;
  working_hours: WorkingHoursConfig;
  only_during_business_hours?: boolean;
}

export interface SLACalculationOptions {
  businessHours?: BusinessHoursConfig;
}

// Business Hours Utility Functions

/**
 * Parses a time string (e.g., "09:00") and returns minutes from midnight
 */
const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Checks if a given time falls within working hours for a specific day
 */
const isTimeInWorkingHours = (
  date: Date,
  workingHours: WorkingHoursConfig
): boolean => {
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayName = dayNames[date.getDay()];
  const dayConfig = workingHours[dayName];
  
  if (!dayConfig) return false;
  
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = parseTimeToMinutes(dayConfig.start);
  const endMinutes = parseTimeToMinutes(dayConfig.finish);
  
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

/**
 * Finds the next working time from a given date
 */
const getNextWorkingTime = (
  date: Date,
  workingHours: WorkingHoursConfig
): Date => {
  const nextDate = new Date(date);
  
  // Check up to 7 days ahead to find next working time
  for (let i = 0; i < 7; i++) {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayName = dayNames[nextDate.getDay()];
    const dayConfig = workingHours[dayName];
    
    if (dayConfig) {
      const [startHours, startMinutes] = dayConfig.start.split(':').map(Number);
      
      // If it's the same day and we're before start time, return start time
      if (i === 0) {
        const currentMinutes = nextDate.getHours() * 60 + nextDate.getMinutes();
        const startTimeMinutes = startHours * 60 + startMinutes;
        
        if (currentMinutes < startTimeMinutes) {
          nextDate.setHours(startHours, startMinutes, 0, 0);
          return nextDate;
        }
      } else {
        // For future days, return the start time
        nextDate.setHours(startHours, startMinutes, 0, 0);
        return nextDate;
      }
    }
    
    // Move to next day
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(0, 0, 0, 0);
  }
  
  // Fallback: return original date if no working hours found
  return date;
};

/**
 * Adds working seconds to a date, considering business hours
 */
const addWorkingSeconds = (
  startDate: Date,
  secondsToAdd: number,
  workingHours: WorkingHoursConfig
): Date => {
  let currentDate = new Date(startDate);
  let remainingSeconds = secondsToAdd;
  
  while (remainingSeconds > 0) {
    if (isTimeInWorkingHours(currentDate, workingHours)) {
      // We're in working hours, advance by 1 second
      currentDate = new Date(currentDate.getTime() + 1000);
      remainingSeconds--;
    } else {
      // We're outside working hours, jump to next working time
      currentDate = getNextWorkingTime(currentDate, workingHours);
    }
  }
  
  return currentDate;
};

/**
 * Converts a date to a specific timezone (simplified implementation)
 */
const convertToTimezone = (date: Date, timezone: string): Date => {
  // This is a simplified implementation. In a real-world scenario,
  // you'd want to use a proper timezone library like date-fns-tz or moment-timezone
  try {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  } catch {
    // Fallback to original date if timezone conversion fails
    return date;
  }
};

/**
 * Calculates the threshold for an SLA based on the current time and the provided threshold.
 * @param timeOffset - The time offset in seconds.
 * @param threshold - The threshold in seconds or null if not applicable.
 * @param options - Optional calculation options including business hours configuration.
 * @returns The calculated threshold in seconds or null if the threshold is null.
 */
const calculateThreshold = (
  timeOffset: number,
  threshold: number | null,
  options?: SLACalculationOptions
): number | null => {
  if (threshold === null) return null;

  const businessHours = options?.businessHours;
  
  // If business hours are not configured or not enabled, use simple calculation
  if (!businessHours?.working_hours_enabled || !businessHours?.only_during_business_hours) {
    const currentTime = Math.floor(Date.now() / 1000);
    return timeOffset + threshold - currentTime;
  }

  // Business hours calculation
  const startTime = new Date(timeOffset * 1000);
  const startTimeInTimezone = convertToTimezone(startTime, businessHours.timezone);
  
  // Determine effective start time
  const effectiveStartTime = isTimeInWorkingHours(startTimeInTimezone, businessHours.working_hours)
    ? startTimeInTimezone
    : getNextWorkingTime(startTimeInTimezone, businessHours.working_hours);
  
  // Calculate deadline by adding working time
  const deadline = addWorkingSeconds(effectiveStartTime, threshold, businessHours.working_hours);
  const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);
  
  // Return time remaining until deadline
  const currentTime = Math.floor(Date.now() / 1000);
  return deadlineTimestamp - currentTime;
};

/**
 * Finds the most urgent SLA status based on the threshold.
 * @param SLAStatuses - An array of SLAStatus objects.
 * @returns The most urgent SLAStatus object.
 */
const findMostUrgentSLAStatus = (SLAStatuses: SLAStatus[]): SLAStatus => {
  // Sort the SLAs based on the threshold and return the most urgent SLA
  SLAStatuses.sort(
    (sla1, sla2) => Math.abs(sla1.threshold) - Math.abs(sla2.threshold)
  );
  return SLAStatuses[0];
};

/**
 * Formats the SLA time in a human-readable format.
 * @param seconds - The time in seconds.
 * @returns A formatted string representing the time.
 */
const formatSLATime = (seconds: number): string => {
  const units: { [key: string]: number } = {
    y: 31536000, // 60 * 60 * 24 * 365
    mo: 2592000, // 60 * 60 * 24 * 30
    d: 86400, // 60 * 60 * 24
    h: 3600, // 60 * 60
    m: 60,
  };

  if (seconds < 60) {
    return '1m';
  }

  // we will only show two parts, two max granularity's, h-m, y-d, d-h, m, but no seconds
  const parts: string[] = [];

  Object.keys(units).forEach(unit => {
    const value = Math.floor(seconds / units[unit]);
    if (seconds < 60 && parts.length > 0) return;
    if (parts.length === 2) return;
    if (value > 0) {
      parts.push(value + unit);
      seconds -= value * units[unit];
    }
  });
  return parts.join(' ');
};

/**
 * Creates an SLA object based on the type, applied SLA, and chat details.
 * @param type - The type of SLA (FRT, NRT, RT).
 * @param appliedSla - The applied SLA details.
 * @param chat - The chat details.
 * @param options - Optional calculation options including business hours configuration.
 * @returns An object containing the SLA status or null if conditions are not met.
 */
const createSLAObject = (
  type: string,
  appliedSla: AppliedSla,
  chat: Conversation,
  options?: SLACalculationOptions
): { threshold: number | null; type: string; condition: boolean } | null => {
  const {
    sla_first_response_time_threshold: frtThreshold,
    sla_next_response_time_threshold: nrtThreshold,
    sla_resolution_time_threshold: rtThreshold,
    created_at: createdAt,
  } = appliedSla;

  const {
    first_reply_created_at: firstReplyCreatedAt,
    waiting_since: waitingSince,
    status,
  } = chat;

  const SLATypes: {
    [key: string]: { threshold: number | null; condition: boolean };
  } = {
    FRT: {
      threshold: calculateThreshold(createdAt, frtThreshold, options),
      //   Check FRT only if threshold is not null and first reply hasn't been made
      condition:
        frtThreshold !== null &&
        (!firstReplyCreatedAt || firstReplyCreatedAt === 0),
    },
    NRT: {
      threshold: calculateThreshold(waitingSince, nrtThreshold, options),
      // Check NRT only if threshold is not null, first reply has been made and we are waiting since
      condition:
        nrtThreshold !== null && !!firstReplyCreatedAt && !!waitingSince,
    },
    RT: {
      threshold: calculateThreshold(createdAt, rtThreshold, options),
      // Check RT only if the conversation is open and threshold is not null
      condition: status === 'open' && rtThreshold !== null,
    },
  };

  const SLAStatus = SLATypes[type];
  return SLAStatus ? { ...SLAStatus, type } : null;
};

/**
 * Evaluates SLA conditions and returns an array of SLAStatus objects.
 * @param appliedSla - The applied SLA details.
 * @param chat - The chat details.
 * @param options - Optional calculation options including business hours configuration.
 * @returns An array of SLAStatus objects.
 */
const evaluateSLAConditions = (
  appliedSla: AppliedSla,
  chat: Conversation,
  options?: SLACalculationOptions
): {
  threshold: number;
  type: string;
  icon: string;
  isSlaMissed: boolean;
}[] => {
  // Filter out the SLA based on conditions and update the object with the breach status(icon, isSlaMissed)
  const SLATypes = ['FRT', 'NRT', 'RT'];
  return SLATypes.map(type => createSLAObject(type, appliedSla, chat, options))
    .filter(
      (
        SLAStatus
      ): SLAStatus is { threshold: number; type: string; condition: boolean } =>
        !!SLAStatus && SLAStatus.condition
    )
    .map(SLAStatus => ({
      ...SLAStatus,
      icon: SLAStatus.threshold <= 0 ? 'flame' : 'alarm',
      isSlaMissed: SLAStatus.threshold <= 0,
    }));
};

/**
 * Evaluates the SLA status for a given chat and applied SLA.
 * @param {Object} params - The parameters object.
 * @param params.appliedSla - The applied SLA details.
 * @param params.chat - The chat details.
 * @param params.options - Optional calculation options including business hours configuration.
 * @returns An object containing the most urgent SLA status.
 */
export const evaluateSLAStatus = ({
  appliedSla,
  chat,
  options,
}: {
  appliedSla: AppliedSla;
  chat: Conversation;
  options?: SLACalculationOptions;
}): { type: string; threshold: string; icon: string; isSlaMissed: boolean } => {
  if (!appliedSla || !chat)
    return { type: '', threshold: '', icon: '', isSlaMissed: false };

  // Filter out the SLA and create the object for each breach
  const SLAStatuses = evaluateSLAConditions(appliedSla, chat, options) as SLAStatus[];

  // Return the most urgent SLA which is latest to breach or has missed
  const mostUrgent = findMostUrgentSLAStatus(SLAStatuses);
  return mostUrgent
    ? {
        type: mostUrgent?.type,
        threshold: formatSLATime(
          mostUrgent.threshold <= 0
            ? -mostUrgent.threshold
            : mostUrgent.threshold
        ),
        icon: mostUrgent.icon,
        isSlaMissed: mostUrgent.isSlaMissed,
      }
    : { type: '', threshold: '', icon: '', isSlaMissed: false };
};
