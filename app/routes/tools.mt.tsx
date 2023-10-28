import type {
  ActionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useSearchParams } from "@remix-run/react";
import { Button, Card, Label, Radio, Spinner, Textarea } from "flowbite-react";
import { useState, useRef, useEffect } from "react";
import {
  FaArrowRightArrowLeft,
  FaRegThumbsDown,
  FaRegThumbsUp,
} from "react-icons/fa6/index.js";
import CopyToClipboard from "~/component/CopyToClipboard";
import { auth } from "~/services/auth.server";
import { fetchGPTData } from "~/services/fetchGPTData.server";
import { motion } from "framer-motion";
import {
  englishReplaces,
  tibetanReplaces,
} from "~/component/utils/replace.server";
import ReactionButtons from "~/component/ReactionButtons";
import { useDebounce } from "@uidotdev/usehooks";
import { meta as meta_data } from "~/root";
const langLabels = {
  bo: "བོད་སྐད།",
  en: "English",
};

const charLimit = 2000;

const boTexts = [
  "བདག་ནི་སྐྱེ་བ་ཐམས་ཅད་དུ།",
  "བསྟན་པ་གསལ་བར་བྱེད་གྱུར་ཅིག",
  "བསྟན་པ་གསལ་བར་མ་ནུས་ནའང་",
];

function parseApiResponse(apiResponse: String) {
  const translationStartIndex = apiResponse.indexOf("data: ") + 7;
  const translationEndIndex = apiResponse.indexOf(
    "<br /><br />",
    translationStartIndex
  );

  if (translationStartIndex !== -1 && translationEndIndex !== -1) {
    const translationOutput = apiResponse.substring(
      translationStartIndex,
      translationEndIndex
    );
    const disclaimerStartIndex = translationEndIndex + 12; // Skip "<br /><br /><small><i>"
    const disclaimerEndIndex = apiResponse.indexOf(
      "</i></small>",
      disclaimerStartIndex
    );

    if (disclaimerStartIndex !== -1 && disclaimerEndIndex !== -1) {
      const disclaimer = apiResponse.substring(
        disclaimerStartIndex,
        disclaimerEndIndex
      );

      return {
        translation: translationOutput.trim(),
        disclaimer: disclaimer.trim(),
      };
    }
  }

  // Handle invalid response format
  return null;
}

async function translate(text: String, sourceLang: String, targetLang: String) {
  const url = "https://dharmamitra.org/api/translation/";
  const data = {
    input_sentence: text,
    level_of_explanation: 0,
    language: `${sourceLang}-${targetLang}`,
    model: "NO",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { error: `HTTP error! Status: ${response.status}` };
    }

    const responseData = await response.text();
    const parsedResponse = parseApiResponse(responseData);
    if (!parsedResponse) {
      return { error: "ཡི་གེ་མང་བ་ཞིག་སྐྱོན་རོགས། [input too short]" };
    }
    const { translation, disclaimer } = parsedResponse;
    return {
      translation,
      disclaimer,
    };
  } catch (error) {
    console.error("Error:", error);
  }
}

export const meta: MetaFunction<typeof loader> = ({ matches }) => {
  const parentMeta = matches.flatMap((match) => match.meta ?? []);
  parentMeta.shift(1);
  return [{ title: "Monlam | ཡིག་སྒྱུར་རིག་ནུས།" }, ...parentMeta];
};
export async function loader({ request }: LoaderFunctionArgs) {
  let userdata = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return { user: userdata };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const form = Object.fromEntries(formData);
  let input = form.sourceText;
  if (form.sourceLang === "en") {
    let prompt = `replace all the abbreviations with full form and preserve newlines, "${input}"  `;
    const data = await fetchGPTData(prompt);
    input = englishReplaces(data!);
  }

  let text_array = input?.split(/\r\n|\r|\n/).filter((item) => item !== "");
  console.log(text_array);
  async function translateText(
    text: string,
    sourceLang: string,
    targetLang: string
  ) {
    return translate(text, sourceLang, targetLang);
  }
  const translationPromises = text_array.map((text: string) => {
    return translateText(text, form.sourceLang, form.targetLang);
  });
  const results = await Promise.all(translationPromises);
  let translation: string[] = [];
  results.flatMap((item) =>
    translation.push(tibetanReplaces(item?.translation))
  );

  return json({
    translation: translation,
  });
}

export default function Index() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("bo");
  const [sourceText, setSourceText] = useState("");
  const [isRotated, setIsRotated] = useState(false);
  const debouncedSearchTerm = useDebounce(sourceText, 1000);
  const fetcher = useFetcher();
  const likefetcher = useFetcher();

  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedSearchTerm.length > 10) {
      handleSubmit();
    }
  }, [debouncedSearchTerm]);
  let data = fetcher.data;

  const isActionSubmission = fetcher.state !== "idle";

  const handleLangSwitch = () => {
    fetcher.submit(
      {},
      {
        action: "/reset_actiondata",
      }
    );
    likefetcher.submit(
      {},
      {
        action: "/reset_actiondata",
      }
    );
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText("");
    setIsRotated(!isRotated);
  };

  let charCount = sourceText?.length;
  let textToCopy = data?.translation?.join("\n");

  let liked = likefetcher.data?.liked;
  let message = likefetcher.data?.message;

  function handleSubmit() {
    fetcher.submit(
      {
        sourceLang,
        targetLang,
        sourceText,
      },
      {
        method: "POST",
      }
    );
  }
  return (
    <div className="mx-auto w-11/12 md:w-4/5">
      <h1 className="mb-10 text-2xl lg:text-3xl text-center text-slate-700 ">
        ཡིག་སྒྱུར་རིག་ནུས།
      </h1>
      <div className="flex justify-between items-center">
        <motion.div
          className={`inline-block w-32 text-lg text-gray-500 ${
            sourceLang == "en" && "font-Inter text-xl"
          } ${sourceLang == "bo" && "text-lg leading-loose"}`}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {langLabels[sourceLang]}
        </motion.div>

        <motion.button
          className="group flex items-center justify-center p-0.5 text-center font-medium relative focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-full focus:ring-2 py-1 px-3"
          onClick={handleLangSwitch}
          initial={{ rotate: 0 }}
          animate={{ rotate: isRotated ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaArrowRightArrowLeft size="20px" />
        </motion.button>

        <motion.div
          className={`inline-block w-32 text-lg text-right text-gray-500
          ${sourceLang != "en" && "font-Inter text-xl"} ${
            sourceLang != "bo" && "text-lg leading-loose"
          }`}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {langLabels[targetLang]}
        </motion.div>
      </div>

      <motion.div className="mt-3 flex flex-col md:flex-row md:h-[55vh] gap-5">
        <Card className="md:w-1/2">
          <div className="w-full flex min-h-[40vh] flex-1 overflow-hidden">
            <Textarea
              name="sourceText"
              placeholder="ཡི་གེ་གཏག་རོགས།..."
              className={`w-full bg-slate-50 min-h-full flex-1 p-2 border-0 focus:outline-none focus:ring-transparent  caret-slate-500 placeholder:text-slate-300 placeholder:font-monlam placeholder:text-lg ${
                sourceLang == "en" && "font-Inter text-xl"
              } ${sourceLang == "bo" && "text-lg leading-loose"}`}
              required
              value={sourceText}
              onInput={(e) => {
                setSourceText((prev) => {
                  let value = e.target?.value;
                  if (value?.length <= charLimit) return value;
                  return prev;
                });
              }}
              autoFocus
            />
          </div>

          <div className="mt-5 flex justify-between items-end">
            {sourceLang && (
              <div className="text-gray-400 text-xs">
                {charCount} / {charLimit}
              </div>
            )}
          </div>
        </Card>

        <Card className="md:w-1/2">
          <div className="w-full h-[50vh] p-2 text-black bg-slate-50 rounded-lg overflow-auto">
            {isActionSubmission ? (
              <div className="h-full flex justify-center items-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <div
                ref={targetRef}
                className={`text-lg ${
                  targetLang === "bo"
                    ? "tracking-wide leading-loose"
                    : "font-Inter"
                }`}
                dangerouslySetInnerHTML={{
                  __html: data?.translation?.join("<br/>"),
                }}
              ></div>
            )}
            {data?.error && `<span class="text-red-400">${data?.error}</span>`}
          </div>
          <div className="flex justify-between">
            <div className={!liked ? "text-red-400" : "text-green-400"}>
              {message}
            </div>
            <div className="flex justify-end">
              <ReactionButtons
                fetcher={likefetcher}
                output={textToCopy}
                sourceText={sourceText}
                model="mt"
              />
              <CopyToClipboard
                textToCopy={textToCopy}
                disabled={data ? false : true}
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
