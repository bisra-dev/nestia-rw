import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

interface CarpenterOrderNotificationProps {
  orderId: string;
  portalUrl: string;
  carpenterName?: string;
}

export default function CarpenterOrderNotification({
  orderId,
  portalUrl,
  carpenterName,
}: CarpenterOrderNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Order {orderId} has reached the frame stage</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                bg: "#0b0e14",
                card: "#161b26",
                border: "#2a3142",
                gold: "#e0b975",
                goldMuted: "#c9a56a",
                muted: "#a8b0c3",
              },
            },
          },
        }}
      >
        <Body className="bg-bg font-sans py-8">
          <Container className="mx-auto max-w-120 mt-12">
            <Section className="bg-card border border-solid border-border rounded-xl p-6">
              <Heading className="m-0 mb-3 text-[18px] font-bold leading-6.5 uppercase tracking-wide text-gold">
                ACTION REQUIRED: ORDER [{orderId}] HAS REACHED THE FRAME
                STAGE.
              </Heading>

              <Text className="m-0 mb-5 text-[14px] leading-5.5 text-muted">
                {carpenterName ? `Hi ${carpenterName}, ` : ""}
                this order is ready for framing — please review the specs
                and request the materials you need to keep it moving.
              </Text>

              <Hr className="border-border mb-5 mt-6" />

              <Button
                href={portalUrl}
                className="block w-full rounded-lg bg-white py-3.5 text-center text-[13px] font-bold tracking-wide text-bg no-underline"
              >
                REQUEST MATERIALS
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}