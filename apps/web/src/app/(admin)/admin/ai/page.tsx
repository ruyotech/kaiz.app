import { redirect } from 'next/navigation';

export default function AIManagementRedirect() {
  redirect('/admin/ai/providers');
}
