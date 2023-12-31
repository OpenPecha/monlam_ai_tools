import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Button, Card, Textarea } from "flowbite-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import CopyToClipboard from "~/component/CopyToClipboard";
import { auth } from "~/services/auth.server";
import ReactionButtons from "~/component/ReactionButtons";
import EachParagraph from "~/component/EachParagraph";
import useDebounce from "~/component/hooks/useDebounceState";
import { motion } from "framer-motion";
import useLocalStorage from "~/component/hooks/useLocaleStorage";
import ErrorMessage from "~/component/ErrorMessage";
import ToolWraper from "~/component/ToolWraper";
import { useDropzone } from "react-dropzone";
import { readDocxFile, readTextFile } from "~/component/utils/readers";
import { FaFile } from "react-icons/fa";
import uselitteraTranlation from "~/component/hooks/useLitteraTranslation";
import { toast } from "react-toastify";

const langLabels = {
  bo: "བོད་སྐད།",
  en: "English",
};

const charLimit = 2000;

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

export default function Index() {
  const [sourceLang, setSourceLang] = useLocalStorage("inputLang", "en");
  const [targetLang, setTargetLang] = useLocalStorage("outputLang", "bo");
  const [sourceText, setSourceText] = useState("");
  const [isRotated, setIsRotated] = useState(false);
  const [selectedTool, setSelectedTool] = useLocalStorage<"text" | "document">(
    "mt_selected_input",
    "text"
  );

  const debouncedSearchTerm = useDebounce(sourceText, 1000);
  const likefetcher = useFetcher();

  const targetRef = useRef<HTMLDivElement>(null);

  const handleLangSwitch = () => {
    likefetcher.submit(
      {},
      {
        action: "/api/reset_actiondata",
      }
    );
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText("");
    setIsRotated(!isRotated);
  };

  let charCount = sourceText?.length;
  let { translation } = uselitteraTranlation();
  let liked = likefetcher.data?.liked;
  let message = likefetcher.data?.message;
  let text_array = debouncedSearchTerm
    ?.split(/\r\n|\r|\n/)
    .filter((item) => item !== "");
  function handleCopy() {
    let nodes = targetRef.current?.childNodes;
    const textContentArray = Array.from(nodes).map((p) => p.textContent);
    let textToCopy = textContentArray.join("\n ");
    navigator.clipboard.writeText(textToCopy);
  }
  return (
    <ToolWraper title="MT">
      <div className="flex justify-between items-center">
        <div
          className={`inline-block w-32 text-lg text-gray-500 dark:text-gray-300 ${
            sourceLang == "en" && "font-poppins text-xl"
          } ${sourceLang == "bo" && "text-lg leading-loose font-monlam"}`}
        >
          {langLabels[sourceLang]}
        </div>

        <motion.button
          className="group flex items-center justify-center p-0.5 text-center font-medium relative focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-full focus:ring-2 py-1 px-3"
          onClick={handleLangSwitch}
          initial={{ rotate: 0 }}
          animate={{ rotate: isRotated ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaArrowRightArrowLeft size="20px" />
        </motion.button>

        <div
          className={`inline-block w-32 text-lg text-right text-gray-500 dark:text-gray-300
          ${sourceLang != "en" && "font-poppins text-xl"} ${
            sourceLang != "bo" && "text-lg leading-loose font-monlam"
          }`}
        >
          {langLabels[targetLang]}
        </div>
      </div>

      <div className="mt-3 flex flex-col md:flex-row md:h-[55vh] gap-5">
        <Card className="md:w-1/2">
          {/* <ListInput
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
          /> */}
          <div className="w-full flex flex-col gap-2 min-h-[20vh] md:min-h-[40vh] flex-1 overflow-hidden">
            {selectedTool === "text" && (
              <TextComponent
                sourceText={sourceText}
                setSourceText={setSourceText}
                sourceLang={sourceLang}
              />
            )}
            {selectedTool === "document" && (
              <DocumentComponent
                sourceText={sourceText}
                setSourceText={setSourceText}
                sourceLang={sourceLang}
              />
            )}
          </div>
          <Button
            color="gray"
            className="text-slate-500 md:hidden"
            onClick={() => setSourceText("")}
          >
            {translation.reset}
          </Button>
          <div className="md:mt-5 flex justify-between items-end">
            {sourceLang && (
              <div className="text-gray-400 text-xs">
                {charCount} / {charLimit}
              </div>
            )}
          </div>
        </Card>

        <Card className="md:w-1/2">
          <div className="w-full min-h-[20vh] md:min-h-[40vh] p-2 dark:text-gray-200 dark:bg-slate-500 rounded-lg overflow-auto">
            <div
              ref={targetRef}
              className={`text-lg ${
                targetLang === "bo"
                  ? "tracking-wide leading-loose"
                  : "font-Inter"
              }`}
            >
              {/* {selectedTool === "text" && (
                <> */}
              {text_array.map((text, index) => {
                if (text === "" || text === "\n") return null;
                return (
                  <EachParagraph
                    key={"returndata_" + index}
                    lang={sourceLang}
                    source={text}
                  />
                );
              })}
              {/* </>
              )} */}
              {/* {selectedTool === "document" && text_array.length !== 0 && (
                <DownloadDocument
                  textArray={text_array}
                  sourceLang={sourceLang}
                />
              )} */}
            </div>
          </div>
          <div className="flex justify-between">
            <div className={!liked ? "text-red-400" : "text-green-400"}>
              {message}
            </div>
            <div className="flex justify-end">
              <ReactionButtons
                fetcher={likefetcher}
                output={"textToCopy"}
                sourceText={sourceText}
                model="mt"
              />
              <CopyToClipboard
                textToCopy={"textToCopy"}
                disabled={false}
                onClick={handleCopy}
              />
            </div>
          </div>
        </Card>
      </div>
      <div className="w-full text-center md:w-fit md:float-right text-xs mt-3 text-slate-400 text-[0.7rem]">
        Monlam-MITRA ཡིག་སྒྱུར་རིག་ནུས་དཔེ་གཞི་ཐོན་རིམ་ <small>v</small>10-16
      </div>
    </ToolWraper>
  );
}

export function ErrorBoundary({ error }) {
  useEffect(() => {
    toast("འདིར་དཀའ་ངལ་འདུག [error with api, try after sometime]", {
      position: toast.POSITION.BOTTOM_RIGHT,
    });
  }, []);

  return (
    <>
      <ErrorMessage error={error} />
    </>
  );
}

function TextComponent({ sourceText, setSourceText, sourceLang }) {
  return (
    <Textarea
      name="sourceText"
      placeholder="ཡི་གེ་གཏག་རོགས།..."
      className={`w-full bg-slate-50 min-h-full flex-1 p-2 border-0 focus:outline-none focus:ring-transparent  caret-slate-500 placeholder:text-slate-300 placeholder:font-monlam placeholder:text-lg ${
        sourceLang == "en" && "font-poppins text-xl"
      } ${sourceLang == "bo" && "text-lg leading-loose font-monlam "}`}
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
  );
}

function DocumentComponent({ sourceText, setSourceText, sourceLang }) {
  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the files
    var file = acceptedFiles[0];
    if (!file) {
      return;
    }

    if (file.name.endsWith(".txt")) {
      readTextFile(file, setSourceText);
    } else if (file.name.endsWith(".docx")) {
      readDocxFile(file, setSourceText);
    } else {
      console.log("Unsupported file type.");
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: {
        "text/html": [".txt", ".docx"],
      },
    });
  function reset() {
    acceptedFiles.splice(0, acceptedFiles.length);
    if (sourceText !== "") setSourceText("");
  }
  useEffect(() => {
    if (sourceText === "") reset();
  }, [sourceText]);

  if (acceptedFiles.length > 0)
    return (
      <div className="bg-gray-200 p-5 rounded-lg shadow-md flex justify-between items-center">
        <div className="flex gap-4">
          <FaFile size="20px" />
          {acceptedFiles.map((item) => item.name)}{" "}
        </div>
        <Button size="sm" className="" pill onClick={reset}>
          X
        </Button>
      </div>
    );

  return (
    <div className="min-h-full flex-1 flex cursor-pointer" {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <>
          <p className="flex-1 flex flex-col justify-center items-center border-blue-400 border-2 rounded text-slate-300 p-3">
            <img
              className="w-1/2 "
              src="//ssl.gstatic.com/translate/drag_and_drop.png"
            />
            Drag 'n' drop some files here, or click to select files
          </p>
        </>
      )}
    </div>
  );
}

function ListInput({ selectedTool, setSelectedTool }) {
  const isTextSelected = selectedTool === "text";
  const isDocumentSelected = selectedTool === "document";

  return (
    <div className="flex gap-2 mt-2">
      <Button
        color={isTextSelected ? "blue" : "gray"}
        size={"xs"}
        onClick={() => setSelectedTool("text")}
      >
        Text
      </Button>
      <Button
        disabled={true}
        color={isDocumentSelected ? "blue" : "gray"}
        size={"xs"}
        onClick={() => setSelectedTool("document")}
      >
        Document
      </Button>
    </div>
  );
}

function DownloadDocument({ textArray, sourceLang }) {
  const downloadTxtFile = () => {
    // Join the array of strings into a single string with new lines
    const fileContent = textArray.join("\n");
    // Create a Blob from the content
    const blob = new Blob([fileContent], { type: "text/plain" });
    // Create a URL for the Blob
    const fileUrl = URL.createObjectURL(blob);
    // Create a temporary anchor element and trigger the download
    const downloadLink = document.createElement("a");
    downloadLink.href = fileUrl;
    downloadLink.download = "download.txt";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Free up the Blob URL memory
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <>
      <button onClick={downloadTxtFile}>Download as TXT</button>
    </>
  );
}
