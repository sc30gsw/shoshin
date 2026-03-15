import { TaggedError } from "better-result";

export class DatabaseError extends TaggedError("DatabaseError")<{
  operation: string;
  cause?: unknown;
}>() {}

export class NotificationScheduleError extends TaggedError("NotificationScheduleError")<{
  cause?: unknown;
}>() {}

export class JsonParseError extends TaggedError("JsonParseError")<{
  input: string;
}>() {}
