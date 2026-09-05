import { Html, Head, Body, Container, Text, Button, Tailwind, Section, Link, Row, Column } from 'react-email';

interface WelcomeEmailProps {
  id: string;
  Url: string;
}

export const Email = ({ id, Url }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#f3f4f6] font-sans m-0 p-6">
          <Container className="max-w-130 mx-auto bg-white rounded-[10px] overflow-hidden shadow-md">
            <Section className="bg-[#082D34] px-6 pt-8">
              <Text className="text-[25px] font-bold text-white m-0 mb-1.5 leading-tight">
                Order confirmed
              </Text>
              <Text className="text-[15px] text-[#6b7280] m-0 mb-5 leading-snug">
                Your Order has been received
              </Text>
            </Section>
            <Section className="p-6">
              <Text className="text-[16px] text-black m-0 mb-4 leading-snug">
                Hello Israel
              </Text>
              <Text className="text-base text-slate-600 leading-relaxed mb-6">
                 Thank you for choosing us to style your home! Your order is officially confirmed. 
              </Text>
              <Section className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-3.5 mb-6">
                <Row className="flex">
                  <Column>
                    <Section className="bg-[#10b981] w-10 h-10 rounded-full text-white">
                      <Text
                        className="text-white text-[18px] font-bold m-0 text-center"
                        style={{ lineHeight: "40px" }}
                      >
                        ✓
                      </Text>
                    </Section>
                  </Column>
                  <Column className="pl-3">
                    <Section>
                      <Row>
                        <Column>
                          <Text className="text-[15px] text-[#6b7280] m-0 mb-1 leading-snug">
                          Order ID 
                          </Text>
                          <Text className="text-[17px] font-bold text-[#111827] m-0 leading-snug">
                            #{id}
                          </Text>
                        </Column>
                      </Row>
                    </Section>
                  </Column>
                </Row>
              </Section>
              <Button
                href={Url}
                className="text-[15px] font-semibold bg-[#10b981] text-white rounded-xl py-3.25 px-5.5 inline-block text-center no-underline mb-5.5 cursor-pointer"
              >
                View Your Order
              </Button>

              <Text className="text-[13px] text-[#6b7280] m-0 leading-relaxed">
                Need help? Contact us at{' '}
                <Link
                  href={`mailto:${Url}`}
                  className="text-[#2563eb] underline"
                >
                  SupportEmail
                </Link>
                .
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Email;