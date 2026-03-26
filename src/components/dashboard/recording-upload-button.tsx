"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, FileText, CheckCircle, AlertCircle, Loader2, Edit3, Lock } from "lucide-react";

type Tab = "upload" | "text";
type UploadStage = "idle" | "uploading" | "transcribing" | "analyzing" | "preview" | "saving" | "done" | "error";

type AnalysisResult = {
  guardianName: string | null;
  phone: string | null;
  relationship: string | null;
  careRecipientName: string | null;
  careRecipientAge: string | null;
  currentSituation: string;
  urgency: "높음" | "보통" | "낮음";
  coreNeeds: string;
  recommendedNextContactDate: string | null;
  recommendedAction: string;
  summary: string;
};

type UploadResult = {
  leadId: string;
};

type AiQuota = {
  plan: string;
  allowed: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
};

const STAGE_MESSAGES: Record<"uploading" | "transcribing" | "analyzing" | "saving", string> = {
  uploading: "파일을 올리고 있어요...",
  transcribing: "음성을 텍스트로 변환하고 있어요...",
  analyzing: "AI가 상담 내용을 분석하고 있어요...",
  saving: "케이스를 등록하고 있어요...",
};

const STAGE_PROGRESS: Record<"uploading" | "transcribing" | "analyzing" | "saving", number> = {
  uploading: 20,
  transcribing: 45,
  analyzing: 70,
  saving: 90,
};

const ACCEPTED_FORMATS = ".mp3,.m4a,.wav,.webm";

export function RecordingUploadButton() {
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [stage, setStage] = useState<UploadStage>("idle");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [aiQuota, setAiQuota] = useState<AiQuota | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // AI 사용량 체크
  useEffect(() => {
    fetch("/api/v1/ai-usage")
      .then((r) => r.json())
      .then(setAiQuota)
      .catch(() => {});
  }, []);

  const resetState = () => {
    setStage("idle");
    setErrorMessage("");
    setResult(null);
    setAnalysis(null);
    setEditingField(null);
    setTranscript("");
    setRecordingUrl(null);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    resetState();
  };

  // --- AI 사용량 체크 ---
  const checkAiQuota = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/ai-usage");
      const data = await res.json();
      setAiQuota(data);
      return data.allowed;
    } catch {
      return true; // 오류 시 허용 (관대한 처리)
    }
  };

  // --- 분석만 수행 (미리보기용) ---
  const runAnalyzeOnly = async (transcriptText: string, recUrl?: string) => {
    // AI 사용량 체크
    const allowed = await checkAiQuota();
    if (!allowed) {
      setErrorMessage(
        aiQuota?.plan === "free"
          ? "AI 분석은 스탠다드 요금제부터 사용할 수 있어요."
          : "이번 달 AI 분석 횟수를 모두 사용했어요. 프리미엄으로 업그레이드하면 무제한으로 사용할 수 있어요."
      );
      setStage("error");
      return;
    }

    setStage("analyzing");
    setTranscript(transcriptText);
    if (recUrl) setRecordingUrl(recUrl);

    const res = await fetch("/api/ai/analyze-and-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript: transcriptText,
        recordingUrl: recUrl ?? null,
        mode: "analyze-only",
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "분석에 실패했어요.");
    }

    const { analysis: result } = await res.json();
    setAnalysis(result);
    setStage("preview");
  };

  // --- 미리보기에서 확정 → 케이스 생성 ---
  const confirmAndCreate = async () => {
    if (!analysis) return;
    setStage("saving");

    try {
      const res = await fetch("/api/ai/analyze-and-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          recordingUrl,
          editedAnalysis: analysis,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "케이스 등록에 실패했어요.");
      }

      const { leadId } = await res.json();
      // AI 사용량 증가
      fetch("/api/v1/ai-usage", { method: "POST" }).catch(() => {});
      setResult({ leadId });
      setStage("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "케이스 등록 중 오류가 발생했어요.");
      setStage("error");
    }
  };

  // --- 녹음 업로드 ---
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    try {
      setStage("uploading");
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/ai/upload-recording", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || "파일 업로드에 실패했어요.");
      }

      const { recordingUrl: recUrl } = await uploadRes.json();

      setStage("transcribing");
      const transcribeRes = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingUrl: recUrl }),
      });

      if (!transcribeRes.ok) {
        const data = await transcribeRes.json();
        throw new Error(data.error || "음성 변환에 실패했어요. 직접 입력 탭에서 내용을 붙여넣어 보세요.");
      }

      const { transcript: transcriptText } = await transcribeRes.json();
      await runAnalyzeOnly(transcriptText, recUrl);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "음성을 잘 못 알아들었어요. 녹음 상태를 확인해주세요"
      );
      setStage("error");
    }
  };

  // --- 직접 입력 ---
  const handleTextSubmit = async () => {
    const trimmed = textInput.trim();
    if (!trimmed) return;

    try {
      await runAnalyzeOnly(trimmed);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "상담 내용 분석 중 오류가 발생했어요."
      );
      setStage("error");
    }
  };

  const handleGoToCase = () => {
    if (result?.leadId) {
      router.push(`/leads/${result.leadId}`);
    }
  };

  const updateAnalysisField = (field: keyof AnalysisResult, value: string) => {
    if (!analysis) return;
    setAnalysis({ ...analysis, [field]: value || null });
  };

  // --- 진행 중 화면 ---
  if (stage === "uploading" || stage === "transcribing" || stage === "analyzing" || stage === "saving") {
    const progress = STAGE_PROGRESS[stage];
    const message = STAGE_MESSAGES[stage];

    return (
      <div className="rounded-xl border border-[#E7E0D5] bg-white p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-[#D97706]" />
          <p className="text-[15px] font-semibold text-[#292524]">{message}</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F5F0E8]">
          <div
            className="h-full rounded-full bg-[#D97706] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-[13px] text-[#A8A29E]">잠시만 기다려주세요</p>
      </div>
    );
  }

  // --- 미리보기 화면 ---
  if (stage === "preview" && analysis) {
    const fields: { key: keyof AnalysisResult; label: string; editable: boolean }[] = [
      { key: "guardianName", label: "보호자명", editable: true },
      { key: "phone", label: "연락처", editable: true },
      { key: "careRecipientName", label: "케어 대상", editable: true },
      { key: "careRecipientAge", label: "연령대", editable: true },
      { key: "summary", label: "상담 요약", editable: true },
      { key: "urgency", label: "긴급도", editable: false },
      { key: "recommendedAction", label: "다음 행동", editable: false },
    ];

    return (
      <div className="rounded-xl border border-[#D97706]/30 bg-[#FFFBEB] p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Edit3 size={18} className="text-[#D97706]" />
          <p className="text-[15px] font-bold text-[#292524]">AI 분석 결과를 확인해주세요</p>
        </div>
        <p className="mt-1 text-[13px] text-[#78716C]">
          내용이 맞으면 바로 등록하고, 틀린 부분은 눌러서 수정할 수 있어요.
        </p>

        <div className="mt-4 space-y-2">
          {fields.map(({ key, label, editable }) => {
            const value = analysis[key] ?? "";
            const isEditing = editingField === key;

            return (
              <div key={key} className="rounded-lg border border-[#E7E0D5] bg-white px-3.5 py-2.5">
                <p className="text-[12px] font-medium text-[#A8A29E]">{label}</p>
                {isEditing && editable ? (
                  <input
                    type="text"
                    defaultValue={String(value)}
                    autoFocus
                    onBlur={(e) => {
                      updateAnalysisField(key, e.target.value);
                      setEditingField(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateAnalysisField(key, e.currentTarget.value);
                        setEditingField(null);
                      }
                    }}
                    className="mt-0.5 w-full border-b border-[#D97706] bg-transparent text-[14px] font-medium text-[#292524] outline-none"
                  />
                ) : (
                  <p
                    className={`mt-0.5 text-[14px] font-medium text-[#292524] ${editable ? "cursor-pointer hover:text-[#D97706]" : ""}`}
                    onClick={() => editable && setEditingField(key)}
                  >
                    {String(value) || "-"}
                    {key === "urgency" && (
                      <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[12px] font-bold ${
                        value === "높음" ? "bg-[#FEE2E2] text-[#DC2626]"
                        : value === "보통" ? "bg-[#FEF3C7] text-[#D97706]"
                        : "bg-[#F5F0E8] text-[#78716C]"
                      }`}>
                        {String(value)}
                      </span>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={confirmAndCreate}
            className="flex-1 rounded-xl bg-[#D97706] px-4 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309]"
          >
            이대로 등록하기
          </button>
          <button
            type="button"
            onClick={resetState}
            className="rounded-xl border border-[#E7E0D5] bg-white px-4 py-3 text-[14px] font-medium text-[#78716C] transition-colors hover:bg-[#FEFCF8]"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  // --- 완료 화면 ---
  if (stage === "done") {
    return (
      <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-[#16A34A]" />
          <p className="text-[15px] font-bold text-[#16A34A]">새 케이스가 등록됐어요!</p>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleGoToCase}
            className="flex-1 rounded-xl bg-[#D97706] px-4 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309]"
          >
            케이스 상세 보기
          </button>
          <button
            type="button"
            onClick={resetState}
            className="rounded-xl border border-[#E7E0D5] bg-white px-4 py-3 text-[14px] font-medium text-[#78716C] transition-colors hover:bg-[#FEFCF8]"
          >
            하나 더 올리기
          </button>
        </div>
      </div>
    );
  }

  // --- 에러 화면 ---
  if (stage === "error") {
    return (
      <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-[#DC2626]" />
          <p className="text-[15px] font-bold text-[#991B1B]">
            처리 중 문제가 생겼어요
          </p>
        </div>
        <p className="mt-2 text-[13px] text-[#DC2626]">{errorMessage}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={resetState}
            className="rounded-xl border border-[#FCA5A5] bg-white px-4 py-3 text-[14px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={() => { resetState(); setActiveTab("text"); }}
            className="rounded-xl border border-[#E7E0D5] bg-white px-4 py-3 text-[14px] font-medium text-[#78716C] transition-colors hover:bg-[#FEFCF8]"
          >
            직접 입력으로 전환
          </button>
        </div>
      </div>
    );
  }

  // --- 무료 플랜 차단 화면 ---
  if (aiQuota && aiQuota.plan === "free") {
    return (
      <div className="rounded-xl border border-[#E7E0D5] bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-[#A8A29E]" />
          <p className="text-[15px] font-bold text-[#292524]">AI 상담 분석</p>
        </div>
        <p className="mt-2 text-[14px] leading-[1.6] text-[#78716C]">
          통화 녹음을 올리면 AI가 자동으로 보호자 정보를 정리해줘요.
          <br />
          스탠다드 요금제부터 사용할 수 있어요.
        </p>
        <Link
          href="/pricing"
          className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#D97706] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309]"
        >
          요금제 보기
        </Link>
      </div>
    );
  }

  // --- 기본 화면 (탭) ---
  return (
    <div className="rounded-xl border border-[#E7E0D5] bg-white p-4 sm:p-5">
      {/* AI 잔여 횟수 표시 */}
      {aiQuota && aiQuota.limit !== null && (
        <div className={`mb-3 rounded-lg px-3 py-2 text-[13px] font-medium ${
          aiQuota.remaining === 0
            ? "border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]"
            : (aiQuota.remaining ?? 0) <= 2
              ? "border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
              : "border border-[#E7E0D5] bg-[#FEFCF8] text-[#78716C]"
        }`}>
          {aiQuota.remaining === 0
            ? "이번 달 AI 분석을 다 사용했어요. 프리미엄으로 업그레이드하면 무제한!"
            : `AI 분석 잔여: ${aiQuota.remaining}/${aiQuota.limit}회`}
        </div>
      )}

      {/* 탭 */}
      <div className="mb-4 flex rounded-lg bg-[#F5F0E8] p-1">
        <button
          type="button"
          onClick={() => handleTabChange("upload")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[13px] font-semibold transition-colors ${
            activeTab === "upload"
              ? "bg-white text-[#D97706] shadow-sm"
              : "text-[#78716C] hover:text-[#292524]"
          }`}
        >
          <Mic size={15} />
          녹음 업로드
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("text")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[13px] font-semibold transition-colors ${
            activeTab === "text"
              ? "bg-white text-[#D97706] shadow-sm"
              : "text-[#78716C] hover:text-[#292524]"
          }`}
        >
          <FileText size={15} />
          직접 입력
        </button>
      </div>

      {/* 녹음 업로드 탭 */}
      {activeTab === "upload" && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FORMATS}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleFileSelect}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D97706] px-6 py-4 text-[16px] font-bold text-white shadow-sm transition-colors hover:bg-[#B45309] active:bg-[#92400E]"
          >
            <Mic size={20} />
            통화 녹음 올리기
          </button>
          <p className="mt-2 text-center text-[13px] text-[#A8A29E]">
            MP3, M4A, WAV, WebM 파일을 올릴 수 있어요
          </p>
        </>
      )}

      {/* 직접 입력 탭 */}
      {activeTab === "text" && (
        <>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={"상담 내용을 여기에 붙여넣으세요.\n\n예) 보호자: 안녕하세요, 저희 아버지가 요즘 걸음이 너무 불편하셔서..."}
            className="w-full resize-none rounded-xl border border-[#E7E0D5] bg-[#FEFCF8] p-3 text-[14px] text-[#292524] placeholder-[#A8A29E] focus:border-[#D97706] focus:outline-none"
            rows={5}
          />
          <button
            type="button"
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D97706] px-6 py-3.5 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-[#B45309] active:bg-[#92400E] disabled:cursor-not-allowed disabled:bg-[#D4C5A9]"
          >
            AI로 상담 분석하기
          </button>
          <p className="mt-2 text-center text-[13px] text-[#A8A29E]">
            전화 끝나고 메모한 내용이나 통화 녹음 텍스트를 붙여넣으세요
          </p>
        </>
      )}
    </div>
  );
}
