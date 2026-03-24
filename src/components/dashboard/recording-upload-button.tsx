"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Tab = "upload" | "text";
type UploadStage = "idle" | "uploading" | "transcribing" | "analyzing" | "done" | "error";

type UploadResult = {
  leadId: string;
};

const STAGE_MESSAGES: Record<Exclude<UploadStage, "idle" | "done" | "error">, string> = {
  uploading: "파일을 올리고 있어요...",
  transcribing: "음성을 텍스트로 변환하고 있어요...",
  analyzing: "상담 내용을 정리하고 있어요...",
};

const STAGE_PROGRESS: Record<Exclude<UploadStage, "idle" | "done" | "error">, number> = {
  uploading: 25,
  transcribing: 55,
  analyzing: 80,
};

const ACCEPTED_FORMATS = ".mp3,.m4a,.wav,.webm";

export function RecordingUploadButton() {
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [stage, setStage] = useState<UploadStage>("idle");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const resetState = () => {
    setStage("idle");
    setErrorMessage("");
    setResult(null);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    resetState();
  };

  // --- 분석 요청 (공통) ---
  const runAnalysis = async (transcript: string, recordingUrl?: string) => {
    setStage("analyzing");
    const analyzeRes = await fetch("/api/ai/analyze-and-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, recordingUrl: recordingUrl ?? null }),
    });

    if (!analyzeRes.ok) {
      const data = await analyzeRes.json();
      throw new Error(data.error || "분석에 실패했어요.");
    }

    const { leadId } = await analyzeRes.json();
    setResult({ leadId });
    setStage("done");
  };

  // --- 녹음 업로드 탭 ---
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    try {
      // Step 1: Upload to Supabase Storage
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

      const { recordingUrl } = await uploadRes.json();

      // Step 2: Transcribe
      setStage("transcribing");
      const transcribeRes = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingUrl }),
      });

      if (!transcribeRes.ok) {
        const data = await transcribeRes.json();
        throw new Error(data.error || "음성 변환에 실패했어요.");
      }

      const { transcript } = await transcribeRes.json();

      // Step 3: Analyze
      await runAnalysis(transcript, recordingUrl);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "음성을 잘 못 알아들었어요. 녹음 상태를 확인해주세요"
      );
      setStage("error");
    }
  };

  // --- 직접 입력 탭 ---
  const handleTextSubmit = async () => {
    const trimmed = textInput.trim();
    if (!trimmed) return;

    try {
      await runAnalysis(trimmed);
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

  // --- 진행 중 화면 (두 탭 공통) ---
  if (stage === "uploading" || stage === "transcribing" || stage === "analyzing") {
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
            음성을 잘 못 알아들었어요
          </p>
        </div>
        <p className="mt-2 text-[13px] text-[#DC2626]">{errorMessage}</p>
        <button
          type="button"
          onClick={resetState}
          className="mt-3 rounded-xl border border-[#FCA5A5] bg-white px-4 py-3 text-[14px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // --- 기본 화면 (탭) ---
  return (
    <div className="rounded-xl border border-[#E7E0D5] bg-white p-4 sm:p-5">
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
            placeholder="상담 내용을 여기에 붙여넣으세요.&#10;&#10;예) 보호자: 안녕하세요, 저희 아버지가 요즘 걸음이 너무 불편하셔서..."
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
