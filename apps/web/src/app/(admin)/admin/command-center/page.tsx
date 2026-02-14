import { redirect } from 'next/navigation';

export default function CommandCenterRedirect() {
  redirect('/admin/ai/providers');
}
