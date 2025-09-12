import { MailtrapClient } from 'mailtrap';
import { TemplateVariables } from 'mailtrap/dist/types/mailtrap';

export async function sendEmailWithAttachment(
  email: string,
  template: string,
  variables: TemplateVariables,
): Promise<boolean> {
  const client = new MailtrapClient({
    token: '6a6d5607698f82a58adec173f42ed047',
  });

  const data = await client.send({
    from: { email: 'info@kruijt-edit.com', name: 'Footie Update' },
    to: [{ email: email }],
    template_uuid: template,
    template_variables: variables,
  });

  return !!data?.success;
}
