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
      {/* Form Type Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveForm("general")}
          className={`pb-3 px-1 text-sm font-medium transition-all border-b-2 -mb-px ${
            activeForm === "general"
              ? "border-[#135C87] text-[#135C87]"
              : "border-transparent text-gray-600 hover:text-[#135C87] hover:border-gray-300"
          }`}
        >
          פנייה כללית
        </button>
        <button
          onClick={() => setActiveForm("valuation")}
          className={`pb-3 px-1 text-sm font-medium transition-all border-b-2 -mb-px ${
            activeForm === "valuation"
              ? "border-[#135C87] text-[#135C87]"
              : "border-transparent text-gray-600 hover:text-[#135C87] hover:border-gray-300"
          }`}
        >
          הערכת שווי
        </button>
        <button
          onClick={() => setActiveForm("cooperation")}
          className={`pb-3 px-1 text-sm font-medium transition-all border-b-2 -mb-px ${
            activeForm === "cooperation"
              ? "border-[#135C87] text-[#135C87]"
              : "border-transparent text-gray-600 hover:text-[#135C87] hover:border-gray-300"
          }`}
        >
          שיתוף פעולה
        </button>
      </div>

      {/* Form Content */}
      <div className="bg-white p-8 shadow-sm">
        {activeForm === "general" && <GeneralContactForm />}
        {activeForm === "valuation" && <ValuationRequestForm />}
        {activeForm === "cooperation" && <CooperationForm />}
      </div>
    </div>
  );
}
