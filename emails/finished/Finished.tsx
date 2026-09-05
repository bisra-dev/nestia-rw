import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";
import { Tailwind } from "react-email";

interface FinishedOrderEmailProps {
  id: string;
  fullName: string;
  description: string;
  updatedAt: string;
}

export const FinishedOrderEmail = ({
  id,
  fullName , 
  description,
  updatedAt ,
}: FinishedOrderEmailProps) => {
    const lastUpdated = new Date(updatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <Html>
      <Head />
      <Preview>GENERAL MANAGER : #{id} is FINISHED</Preview>
      <Tailwind>
        <Body className="bg-slate-100 font-sans my-auto mx-auto font-normal">
          <Container className="border border-solid border-slate-200 rounded my-10 mx-auto p-5 max-w-150 bg-white">
            <Section className="bg-[#082D34] px-6 py-4">
            <Heading className="text-white text-lg font-bold p-0 mx-0 leading-tight">
              GENERAL MANAGER : <span className="text-[#6b7280]">#{id}</span> FINISHED
            </Heading>
            </Section>
            
            <Text className="text-base text-slate-600 leading-relaxed mb-6">
              Hello, an order has reached the final production phase. Below is the relevant summary.
            </Text>

            {/* Order Table */}
            <Section className="my-6">
              <table className="w-full border-collapse border border-slate-200 rounded-lg overflow-hidden">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 bg-slate-50 font-bold text-slate-800 text-sm w-1/3">
                      Order ID
                    </td>
                    <td className="p-3 text-slate-800 text-sm font-mono">
                      {id}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 bg-slate-50 font-bold text-slate-800 text-sm">
                      Customer
                    </td>
                    <td className="p-3 text-slate-800 text-sm">
                      {fullName}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 bg-slate-50 font-bold text-slate-800 text-sm">
                      Description
                    </td>
                    <td className="p-3 text-slate-800 text-sm">
                      {description}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 bg-slate-50 font-bold text-slate-800 text-sm">
                      Current Status
                    </td>
                    <td className="p-3 text-emerald-600 font-extrabold text-sm tracking-wide">
                      FINISHED
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-800 text-sm">
                      Completion Time
                    </td>
                    <td className="p-3 text-slate-800 text-sm">
                      {lastUpdated}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
            
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default FinishedOrderEmail;