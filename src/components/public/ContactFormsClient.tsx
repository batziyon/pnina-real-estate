"use client";

/**
 * Contact Forms Client Component
 * 
 * Multi-form contact interface with tabs for different inquiry types
 */

import { useState } from "react";
import { GeneralContactForm } from "./GeneralContactForm";
import { ValuationRequestForm } from "./ValuationRequestForm";
import { CooperationForm } from "./CooperationForm";

type FormType = "general" | "valuation" | "cooperation";

export function ContactFormsClient() {
  const [activeForm, setActiveForm] = useState<FormType>("general");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 sm:gap-3">
        <button
          onClick={() => setActiveForm("general")}
          className={`-mb-px border-b-2 px-1 pb-3 text-[0.9rem] font-medium transition-all sm:text-[1rem] ${
            activeForm === "general"
              ? "border-[#135C87] text-[#135C87]"
              : "border-transparent text-gray-600 hover:text-[#135C87] hover:border-gray-300"
          }`}
        >
          פנייה כללית
        </button>
        <button
          onClick={() => setActiveForm("valuation")}
          className={`-mb-px border-b-2 px-1 pb-3 text-[0.9rem] font-medium transition-all sm:text-[1rem] ${
            activeForm === "valuation"
              ? "border-[#135C87] text-[#135C87]"
              : "border-transparent text-gray-600 hover:text-[#135C87] hover:border-gray-300"
          }`}
        >
          הערכת שווי
        </button>
        <button
          onClick={() => setActiveForm("cooperation")}
          className={`-mb-px border-b-2 px-1 pb-3 text-[0.9rem] font-medium transition-all sm:text-[1rem] ${
            activeForm === "cooperation"
              ? "border-[#135C87] text-[#135C87]"
              : "border-transparent text-gray-600 hover:text-[#135C87] hover:border-gray-300"
          }`}
        >
          שיתוף פעולה
        </button>
      </div>

      <div className="bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        {activeForm === "general" && <GeneralContactForm />}
        {activeForm === "valuation" && <ValuationRequestForm />}
        {activeForm === "cooperation" && <CooperationForm />}
      </div>
    </div>
  );
}
