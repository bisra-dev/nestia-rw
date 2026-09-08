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

interface ShopManagerApprovalNotificationProps {
  orderId: string;
  requestedBy?: string;
  approvalUrl: string;
}

export default function ShopManagerApprovalNotification({
  orderId,
  requestedBy,
  approvalUrl,
}: ShopManagerApprovalNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>A materials requisition is awaiting your approval</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                bg: "#0b0e14",
                card: "#161b26",
                border: "#2a3142",
                heading: "#c7cede",
                tag: "#8b93a7",
                muted: "#a8b0c3",
                gold: "#e0b975",
              },
            },
          },
        }}
      >
        <Body className="bg-bg font-sans py-8">
          <Container className="mx-auto max-w-120 mt-12">
            <Section className="bg-card border border-solid border-border rounded-xl p-6">
              <Heading className="m-0 mb-3 text-[18px] font-bold leading-6.5 uppercase tracking-wide text-gold">
                PENDING: AWAITING MATERIALS REQUISITION APPROVAL.
              </Heading>

              <Text className="m-0 mb-5 text-[14px] leading-5.5 text-muted">
                {requestedBy ? `${requestedBy} has` : "A carpenter has"}{" "}
                requested materials for order [{orderId}] — take a quick
                look and approve it so the build can continue.
              </Text>

              <Hr className="border-border mb-5 mt-6" />

              <Button
                href={approvalUrl}
                className="block w-full rounded-lg bg-white py-3.5 text-center text-[13px] font-bold tracking-wide text-bg no-underline"
              >
                VIEW &amp; APPROVE REQUISITION
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}