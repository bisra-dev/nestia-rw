import { Resend } from 'resend';
import { Email } from './Email1';

const resend = new Resend('re_123456789');

export async function GET() {
  
await resend.emails.send({
  from: 'you@example.com',
  to: 'user@gmail.com',
  subject: 'hello world',
  react: <Email Url="https://ourdomain.example.com" />,
});

}