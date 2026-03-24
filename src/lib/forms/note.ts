import type { LeadNote, NoteType } from "@/types/domain";

export type LeadNoteInputValue = {
  noteType: NoteType;
  content: string;
};

export type LeadNotePayload = {
  leadId: string;
  noteType: string;
  content: string;
};

export type LeadNoteErrors = {
  leadId?: string;
  noteType?: string;
  content?: string;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const noteTypeOptions: NoteType[] = ["운영 메모", "파트너 메모"];

export const initialLeadNoteValue: LeadNoteInputValue = {
  noteType: "운영 메모",
  content: "",
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parseNoteType(value: string): NoteType | null {
  return noteTypeOptions.includes(value as NoteType) ? (value as NoteType) : null;
}

export function normalizeLeadNotePayload(input: {
  leadId?: unknown;
  noteType?: unknown;
  content?: unknown;
}): LeadNotePayload {
  return {
    leadId: normalizeString(input.leadId),
    noteType: normalizeString(input.noteType),
    content: normalizeString(input.content),
  };
}

export function validateLeadNotePayload(
  values: LeadNotePayload,
): LeadNoteErrors {
  const errors: LeadNoteErrors = {};

  if (!UUID_REGEX.test(values.leadId)) {
    errors.leadId = "유효한 리드 ID가 아닙니다.";
  }

  if (!parseNoteType(values.noteType)) {
    errors.noteType = "메모 유형을 다시 확인해 주세요.";
  }

  if (!values.content.trim()) {
    errors.content = "메모 내용을 입력해 주세요.";
  }

  return errors;
}

export function mapLeadNoteToInputValue(note: LeadNote): LeadNoteInputValue {
  return {
    noteType: note.type,
    content: note.content,
  };
}
