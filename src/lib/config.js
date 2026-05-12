// Central launch configuration — change the date here and it applies everywhere
// NOTE: Set to the actual launch time
export const LAUNCH_DATE = '2026-05-12T11:11:00+05:30'

// Dynamically checks if the current time is past the launch date.
// Returns true after 11:11 AM, false before.
export const hasLaunched = () => new Date() >= new Date(LAUNCH_DATE)
