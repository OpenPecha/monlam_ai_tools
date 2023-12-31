import React from "react";
import { models } from "~/helper/models";
import uselitteraTranlation from "./hooks/useLitteraTranslation";

function ToolWraper({ title, children }) {
  let model = models.find((model) => model.name === title) ?? null;
  let { translation, locale } = uselitteraTranlation();
  let isEnglish = locale === "en_US";
  return (
    <>
      <div className="mx-auto w-11/12 md:w-4/5">
        <h1
          className={`text-lg ${
            isEnglish
              ? "font-poppins md:text-[1.6rem]"
              : "font-monlam md:text-[2.7rem]"
          } flex gap-4 justify-center items-center mb-2 text-center text-slate-700 dark:text-gray-200 `}
        >
          <div className="dark:mix-blend-multiply ">{model?.icon}</div>
          {translation[title]}
        </h1>
        {children}
      </div>
    </>
  );
}

export default ToolWraper;
