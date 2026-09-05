import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Section,
  Tailwind,
  Text,
} from 'react-email';

interface OrderStatusUpdateProps {
  orderId: string;
  status: string;
  associatedEmail: string;
}

export function StatusEmail({ orderId, status, associatedEmail }: OrderStatusUpdateProps) {
  return (
    <Html lang="en">
      <Tailwind>
        <Head />
        <Body className="bg-white font-sans m-0 p-6">
          <Container className="max-w-130 mx-auto mt-12 bg-white rounded-[10px] overflow-hidden shadow-md">
            <Section className="bg-[#082D34] border-b border-[#e5e7eb] p-5">
              <Text className="text-[20px] font-bold text-white m-0">
                Nestia Furniture
              </Text>
              <Text className="text-[13px] text-white m-0 mt-2 opacity-90">
                Order: #{orderId}
              </Text>
            </Section>
            <Section className="p-6">
              <Text className="text-[22px] font-bold text-[#111827] m-0 mb-1.5 leading-tight">
                Order Status Update
              </Text>
              <Text className="text-[15px] text-[#6b7280] m-0 mb-5 leading-snug">
                We’ve updated the status of your order <br/>
                Here is your real-time workshop status update.
              </Text>
              <Section className="mb-6">
                <Section className="text-white rounded-lg p-3 text-center bg-[#10b981]">
                  <Text className="text-[12px] m-0 opacity-90 font-semibold uppercase">
                    current status
                  </Text>
                  <Text className="text-[20px] font-bold m-0 mt-1">
                    {status}
                  </Text>
                </Section>
              </Section>
              <Text className="text-[15px] text-[#374151] m-0 mb-1 leading-relaxed">
                We’ll continue to update you as your order progresses.
              </Text>
              <Text className="text-[13px] text-[#6b7280] m-0 leading-relaxed">
                Need help? Contact us at 
                <Link
                  href="https://mail.com"
                  className="text-[#2563eb] underline pl-2"
                >
                  SupportEmail.com
                </Link>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default StatusEmail;