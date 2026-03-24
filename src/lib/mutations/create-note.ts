import "server-only";

import {
  parseNoteType,
  type LeadNoteErrors,
  type LeadNotePayload,
  validateLeadNotePayload,
} from "@/lib/forms/note";
import { mapNoteRowToLeadNote } from "@/lib/mappers/lead-mappers";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { LeadNote } from "@/types/domain";

type CreateLeadNoteResult =
  | {
      status: "success";
      note: LeadNote;
    }
  | {
      status: "validation_error";
      fieldErrors: LeadNoteErrors;
      message: string;
    }
  | {
      status: "not_found";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function createLeadNote(
  values: LeadNotePayload,
): Promise<CreateLeadNoteResult> {
  const fieldErrors = validateLeadNotePayload(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "validation_error",
      fieldErrors,
      message: "메모 입력값을 다시 확인해 주세요.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "데이터 연결이 아직 완료되지 않아 메모를 저장할 수 없어요.",
    };
  }

  const parsedNoteType = parseNoteType(values.noteType);

  if (!parsedNoteType) {
    return {
      status: "validation_error",
      fieldErrors: {
        noteType: "메모 유형을 다시 확인해 주세요.",
      },
      message: "메모 유형을 다시 확인해 주세요.",
    };
  }

  try {
    const supabase = createSupabasePlainClient();
    const { data: leadRow, error: leadError } = await supabase
      .from("leads")
      .select("id")
      .eq("id", values.leadId)
      .maybeSingle();

    if (leadError) {
      return {
        status: "error",
        message: "메모를 저장하기 전에 케이스 정보를 확인하지 못했어요.",
      };
    }

    if (!leadRow) {
      return {
        status: "not_found",
        message: "해당 케이스를 찾을 수 없어 메모를 저장하지 못했어요.",
      };
    }

    const { data: noteRow, error: noteError } = await supabase
      .from("notes")
      .insert({
        lead_id: values.leadId,
        note_type: parsedNoteType === "파트너 메모" ? "partner" : "operator",
        content: values.content.trim(),
      })
      .select("*")
      .single();

    if (noteError || !noteRow) {
      return {
        status: "error",
        message:
          "메모를 저장하지 못했어요. 연결 상태를 확인해 주세요.",
      };
    }

    return {
      status: "success",
      note: mapNoteRowToLeadNote(noteRow),
    };
  } catch {
    return {
      status: "error",
      message:
        "메모 저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}
