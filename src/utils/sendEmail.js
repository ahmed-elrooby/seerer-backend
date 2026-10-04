import { Resend } from "resend";

const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "Seerer <ahmdalrwby24@gmail.com>",
    to: [to],
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default sendEmail;