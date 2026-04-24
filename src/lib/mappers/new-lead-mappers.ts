import type { NewLeadFormValues, TernaryFieldValue } from "@/lib/forms/new-lead";
import type { Database } from "@/types/supabase";

function trimOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapTernaryFieldToBoolean(value: TernaryFieldValue) {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
}

export function mapNewLeadFormValuesToLeadInsert(
  values: NewLeadFormValues,
  organizationId: string,
): Database["public"]["Tables"]["leads"]["Insert"] {
  return {
    organization_id: organizationId,
    guardian_name: values.guardianName.trim(),
    phone: values.phone.trim(),
    guardian_relationship: trimOrNull(values.guardianRelationship),
    care_recipient_name: trimOrNull(values.careRecipientName),
    care_recipient_age_group: trimOrNull(values.careRecipientAgeGroup),
    current_situation_summary: values.currentSituationSummary.trim(),
    source: values.source.trim(),
    status: values.status,
    next_contact_date: trimOrNull(values.nextContactDate),
    key_issues: trimOrNull(values.keyIssues),
    consultation_memo: trimOrNull(values.consultationMemo),
    hospital_name: trimOrNull(values.hospitalName),
    department_info: trimOrNull(values.departmentInfo),
    examination_required: mapTernaryFieldToBoolean(values.examinationRequired),
    mobility_level: trimOrNull(values.mobilityLevel),
    payment_assistance_required: mapTernaryFieldToBoolean(
      values.paymentAssistanceRequired,
    ),
    transport_method: trimOrNull(values.transportMethod),
    accompaniment_scope: trimOrNull(values.accompanimentScope),
    is_high_risk: values.isHighRisk,
  };
}
