"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Building2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function OrgSetupPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({ name: orgName.trim() })
        .select("id")
        .single();

      if (orgError || !org) {
        setError("기관 등록 중 문제가 발생했어요. 다시 시도해주세요.");
        return;
      }

      const { error: userError } = await supabase
        .from("users")
        .insert({ id: user.id, organization_id: org.id });

      if (userError) {
        setError("사용자 등록 중 문제가 발생했어요. 다시 시도해주세요.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("문제가 발생했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FEFCF8] px-4">
      <div className="w-full max-w-[440px] rounded-xl border border-[#E7E0D5] bg-white p-8">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D97706] text-white">
            <Heart size={24} />
          </div>
          <h1 className="mt-4 text-[22px] font-bold text-[#292524]">
            센터 이름을 알려주세요
          </h1>
          <p className="mt-2 text-center text-[15px] leading-[1.6] text-[#78716C]">
            운영하시는 주간보호센터 이름을 입력하면 바로 시작할 수 있어요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="orgName"
              className="mb-1.5 block text-[14px] font-medium text-[#292524]"
            >
              센터 이름
            </label>
            <div className="relative">
              <Building2
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]"
              />
              <input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                placeholder="예: 행복주간보호센터"
                className="w-full rounded-xl border border-[#E7E0D5] bg-[#FEFCF8] py-3 pl-11 pr-4 text-[15px] text-[#292524] outline-none transition-colors focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-2.5 text-[14px] text-[#DC2626]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !orgName.trim()}
            className="mt-2 w-full rounded-xl bg-[#D97706] py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#B45309] disabled:opacity-50"
          >
            {loading ? "저장 중..." : "시작하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
