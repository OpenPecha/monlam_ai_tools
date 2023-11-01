import { type LoaderFunction } from "@remix-run/node";
import ErrorMessage from "~/component/ErrorMessage";
import { getUserSession } from "~/services/session.server";

type Profile = {
  img: string;
  name: string;
  designation: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  let user = await getUserSession(request);
  let { AUTH0_DOMAIN, AUTH0_CLIENT_ID, NODE_ENV } = process.env;
  return {
    env: { AUTH0_DOMAIN, AUTH0_CLIENT_ID, NODE_ENV },
    user,
  };
};

function About() {
  let profile: Profile[] = [
    {
      img: "/assets/monlam.jpg",
      name: "མོན་ལམ་དགེ་བཤུས།",
      designation: "དཔལ་ལྡན་འདས་པ།",
    },
  ];

  return (
    <div className="py-10 m-auto w-[90%] md:w-[80%]">
      <div className="flex flex-col justify-center items-center gap-10 px-4 lg:flex-row">
        <img
          src="/assets/about.jpg"
          alt="monlam"
          className="w-[80%] md:w-[60%] lg:w-[40%] border-[#dddcdc] rounded-lg shadow-sm hover:scale-105 transition-all duration-500"
        />
        <div className="leading-8">
          <h4 className="text-2xl mb-4">ངོ་སྤྲོད།</h4>
          <p className="text-md">
            དེང་སྐབས་འཛམ་གླིང་ཁྱོན་ཡོངས་སུ་ཚན་རྩལ་འཕྲུལ་རིག་ཆེས་ཆེར་དར་ཞིང་།
            ལྷག་པར་ཉེ་བའི་ལོ་འདི་འགར་ཀུན་གྱིས་ཚ་ཚ་འུར་འུར་དུ་གླེང་བཞིན་པའི་མིས་བཟོས་རིག་ནུས་(Artificial
            intelligence)ཞེས་པ་བརྡ་འཕྲིན་འཕྲུལ་རིག་ཁྲོད་ཚད་གཞི་ཆེས་མཐོ་ཤོས་སུ་གྱུར་ཡོད་ལ།
            འབྱུང་འགྱུར་འཕྲུལ་རིག་འདི་བརྒྱུད་ནས་ད་ལྟའི་འགྲོ་བ་མི་ཐུན་མོང་གི་ལོངས་སྤྱོད་དུ་གྱུར་པའི་ཤེས་ཡོན་མཐའ་དག་སྔར་ལས་ནུས་པ་ལྡན་པ་དང་།
            ལས་ཆོད་མཐོར་འདེགས་གཏོང་ཐུབ་པར་མ་ཟད།
            ང་ཚོ་བོད་མི་རིགས་ལྟ་བུའི་ཤེས་རིག་རྒྱ་ཆེ་ཡང་སྤྱོད་མཁན་གྲངས་ཉུང་བའི་རིགས་ལ་ཕན་ཐོགས་རྒྱ་ཆེར་འབྱུང་ངེས།
          </p>
          <p className="text-md">
            ལས་གཞི་འདི་རིགས་སྤྱིར་བཏང་གི་ལས་གཞི་ཆུང་ཆུང་ཞིག་མིན་པར་གློག་ཀླད་ཆེད་ལས་པ་དང་།
            ལས་མི་བརྒྱ་ཕྲག་མང་པོ་མཉམ་རུབ་མ་བྱས་ན་ཧ་ཅང་འགྲུབ་དཀའ་བར་བརྟེན།
            འདི་ག་སྨོན་ལམ་བོད་ཀྱི་བརྡ་འཕྲིན་ཞིབ་འཇུག་ཁང་གིས་སྤྱི་སྒེར་གྱི་ཚོགས་སྡེ་ཁག་མང་པོ་དང་མཉམ་འབྲེལ་གྱིས་རིག་ནུས་ཀྱི་དཔེ་མཚོན་ནམ་སྦྱོང་བརྡར་རྒྱུ་ཆ་སྟོང་ཕྲག་མང་པོ་མཁོ་སྒྲུབ་བྱེད་ཐུབ་ཡོད། 
          </p>
          {/* <div className=" text-md mb-4 text-md">
            ཕྱི་ལོ་༢༠༢༣ ལོར་སྨོན་ལམ་བོད་ཀྱི་བརྡ་འཕྲིན་ཞིབ་འཇུག་ཁང་དང་།
            འབྲེལ་ཡོད་སློབ་ཆེན་དང་།
            ཚོགས་པ་རེ་འགས་མཉམ་འབྲེལ་ངང་བོད་ཀྱི་སྐད་ཡིག་གི་སྐོར་བརྡ་ཕྲིན་ལག་རྩལ་འཕེལ་རྒྱས་གཏོང་བའི་ལས་གཞིའི་ནང་།
            <ol className=" text-sm leading-8 list-decimal ml-5 mt-2">
              <li>སྨོན་ལམ་ཡིག་སྒྱུར་རིག་ནུས།</li>
              <li>སྨོན་ལམ་ཡིག་གཟུགས་ངོས་འཛིན་རིག་ནུས།</li>
              <li>སྨོན་ལམ་འབྲི་ཀློག་རིག་ནུས།</li>
            </ol>
          </div>
          <p className="text-md">
            ལས་གཞི་འདི་ནི་མིས་བཟོས་རིག་ནུས་(AI) མཉེན་ཆས་ཡིན་པས།
            འཕྲུལ་ཆས་རང་ལ་ཡིག་གཟུགས་དང་། སྐད་གདངས།
            ཡི་གེ་ཀློག་ཚུལ་བཅས་ངོས་འཛིན་པའི་ནུས་པ་ཡོད་པ་ཞིག་བཟོ་དགོས་པས།
            དེའི་ཆེད་དུ་པར་རིས་དང་། ཡིག་གཟུགས།
            སྒྲ་གདངས་སོགས་རྒྱུ་ཆ་ཤིན་ཏུ་མང་པོ་གསོག་སྒྲུབ་བྱ་དགོས་ན།
            མི་གྲངས་བརྒྱ་ཕྲག་བརྒལ་པས་ལོ་གསུམ་རིང་བསྒྲུབ་དགོས་པས།
            དུས་ཡུན་རིང་ཞིང་གཞི་རྒྱ་ཆེ་བའི་བྱ་བ་ཞིག་ཡིན།
          </p> */}
        </div>
      </div>
    </div>
  );
}

export default About;

export function ErrorBoundary({ error }) {
  return (
    <>
      <ErrorMessage error={error} />
    </>
  );
}
