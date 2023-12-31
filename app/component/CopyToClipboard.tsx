import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaRegCopy } from "react-icons/fa6";

let timer: any;

type CopyToClipboardProps = {
  textToCopy: string;
  disabled: boolean;
  onClick?: () => void;
};

const CopyToClipboard = ({
  textToCopy,
  disabled,
  onClick,
}: CopyToClipboardProps) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsCopied(false);
    return () => {
      if (timer) clearTimeout(timer); //cleanup timer on unmount
    };
  }, [textToCopy]);

  const handleCopy = () => {
    if (onClick) {
      onClick();
    } else {
      navigator.clipboard.writeText(textToCopy);
    }

    setIsCopied(true);
    timer = setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Button
      color="white"
      id="copyBtn"
      onClick={handleCopy}
      disabled={disabled}
      title="copy"
    >
      {isCopied ? (
        <span className="text-gray-500">པར་བཤུ་བྱས་ཟིན།</span>
      ) : (
        <FaRegCopy color="gray" size="20px" />
      )}
    </Button>
  );
};

export default CopyToClipboard;
