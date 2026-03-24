import type { LeadStatus, PlanTier } from "@/types/domain";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      consultations: {
        Row: {
          channel: string | null;
          consulted_at: string;
          created_at: string;
          details: string | null;
          id: string;
          lead_id: string;
          summary: string;
        };
        Insert: {
          channel?: string | null;
          consulted_at: string;
          created_at?: string;
          details?: string | null;
          id?: string;
          lead_id: string;
          summary: string;
        };
        Update: {
          channel?: string | null;
          consulted_at?: string;
          created_at?: string;
          details?: string | null;
          id?: string;
          lead_id?: string;
          summary?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consultations_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          accompaniment_scope: string | null;
          care_recipient_age_group: string | null;
          care_recipient_name: string | null;
          consultation_memo: string | null;
          created_at: string;
          current_situation_summary: string;
          department_info: string | null;
          examination_required: boolean | null;
          guardian_name: string;
          guardian_relationship: string | null;
          hospital_name: string | null;
          id: string;
          is_high_risk: boolean;
          key_issues: string | null;
          mobility_level: string | null;
          next_contact_date: string | null;
          payment_assistance_required: boolean | null;
          phone: string;
          source: string;
          status: LeadStatus;
          transport_method: string | null;
          updated_at: string;
        };
        Insert: {
          accompaniment_scope?: string | null;
          care_recipient_age_group?: string | null;
          care_recipient_name?: string | null;
          consultation_memo?: string | null;
          created_at?: string;
          current_situation_summary: string;
          department_info?: string | null;
          examination_required?: boolean | null;
          guardian_name: string;
          guardian_relationship?: string | null;
          hospital_name?: string | null;
          id?: string;
          is_high_risk?: boolean;
          key_issues?: string | null;
          mobility_level?: string | null;
          next_contact_date?: string | null;
          payment_assistance_required?: boolean | null;
          phone: string;
          source: string;
          status?: LeadStatus;
          transport_method?: string | null;
          updated_at?: string;
        };
        Update: {
          accompaniment_scope?: string | null;
          care_recipient_age_group?: string | null;
          care_recipient_name?: string | null;
          consultation_memo?: string | null;
          created_at?: string;
          current_situation_summary?: string;
          department_info?: string | null;
          examination_required?: boolean | null;
          guardian_name?: string;
          guardian_relationship?: string | null;
          hospital_name?: string | null;
          id?: string;
          is_high_risk?: boolean;
          key_issues?: string | null;
          mobility_level?: string | null;
          next_contact_date?: string | null;
          payment_assistance_required?: boolean | null;
          phone?: string;
          source?: string;
          status?: LeadStatus;
          transport_method?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          lead_id: string;
          note_type: "operator" | "partner";
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          lead_id: string;
          note_type?: "operator" | "partner";
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          lead_id?: string;
          note_type?: "operator" | "partner";
        };
        Relationships: [
          {
            foreignKeyName: "notes_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          plan: PlanTier;
          max_leads: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan?: PlanTier;
          max_leads?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plan?: PlanTier;
          max_leads?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          current_situation: string;
          hospital_schedule: string;
          id: string;
          lead_id: string;
          needed_help: string;
          next_action: string;
          this_week_tasks: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_situation?: string;
          hospital_schedule?: string;
          id?: string;
          lead_id: string;
          needed_help?: string;
          next_action?: string;
          this_week_tasks?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_situation?: string;
          hospital_schedule?: string;
          id?: string;
          lead_id?: string;
          needed_help?: string;
          next_action?: string;
          this_week_tasks?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      lead_status: LeadStatus;
      plan_tier: PlanTier;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
