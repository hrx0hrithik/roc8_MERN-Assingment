"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { ChangeEvent, FormEvent, useEffect, useState, useCallback, KeyboardEvent, Suspense } from "react";

export default function Verification() {
  const [otp, setOtp] = useState<string>(""); 
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? ""; 
  const verifyOtp = api.user.verifyOtp.useMutation();
  const signupUser = api.user.signup.useMutation();

  useEffect(() => {
    if (!email) {
      router.push("/");
    }
  }, [email, router]);

  async function onFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const result = await verifyOtp.mutateAsync({
        email: email,
        otp,
      });
      if (result.verified) {
        await signupUser.mutateAsync({
          name: result.user?.name ?? "",
          email: email,
          password: result.user?.password ?? "",
          categories: [],
        });
        router.push("/login");
      } else {
        alert("Invalid OTP");
      }
    } catch (error) {
      console.error("Failed to verify OTP", error);
      alert("Failed to verify OTP");
    }
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    const maskedLocal = local?.substring(0, 3) + '***';
    return `${maskedLocal}@${domain}`;
  };

  const handleOtpChange = useCallback((e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, ""); // Allow only digits
    const otpArray = otp.split("");
    otpArray[index] = value;
    setOtp(otpArray.join(""));

    // Move focus to the next input field
    if (value && index < 7) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  }, [otp]);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedValue = e.clipboardData.getData("text").replace(/\D/g, "");
    const otpArray = Array.from({ length: 8 }, (_, i) => pastedValue[i] ?? ""); // Ensure we have an array of 8 elements
    
    setOtp(otpArray.join(""));

    // Focus the last field filled
    const lastInputIndex = Math.min(pastedValue.length - 1, otpArray.length - 1);
    const lastInput = document.getElementById(`otp-input-${lastInputIndex}`);
    lastInput?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <main className="mx-auto mb-6 pt-10">
      <div className="flex h-[453px] w-[576px] flex-col rounded-[20px] border p-10">
        <div className="text-center text-[32px] font-semibold">
          Verify your email
        </div>
        <div className="text-center mt-4">Enter the 8 digit code you have received on {maskEmail(email)}</div>
        <form className="flex flex-col mt-8" onSubmit={onFormSubmit}>
          <div className="flex justify-between mb-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                className="w-12 h-12 text-center text-2xl border rounded-md border-gray-300 focus:border-black focus:outline-none"
                type="text"
                maxLength={1}
                value={otp[index] ?? ""}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                autoFocus={index === 0}
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-black py-3 text-white"
          >
            VERIFY OTP
          </button>
        </form>
      </div>
    </main>
    </Suspense>
  );
}
