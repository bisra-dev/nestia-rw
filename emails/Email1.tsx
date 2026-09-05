import { Resend } from 'resend';
import { Email } from './email';
import { StatusEmail } from './status/email';
import { FinishedOrderEmail } from './finished/Finished';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const {
    to,
    status,
    orderUrl,
    orderId,
    associatedEmail,
    fullName,
    description,
    updatedAt,
  } = await request.json();

  let template: React.ReactElement;
  switch (status) {
    case 'status-update':
      template = (
        <StatusEmail
          orderId={orderId}
          status={status}
          associatedEmail={associatedEmail}
        />
      );
      break;
    case 'finished':
      template = (
        <FinishedOrderEmail
          id={orderId}
          fullName={fullName}
          description={description}
          updatedAt={updatedAt}
        />
      );
      break;
    default:
      template = (
        <Email
          id={orderId}
          fullName={fullName}
          associatedEmail={associatedEmail}
          Url={orderUrl}
        />
      );
  }

  await resend.emails.send({
    from: 'you@yourdomain.com',
    to,
    subject: 'hello world',
    react: template,
  });

  return Response.json({ success: true });
}