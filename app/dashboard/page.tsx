import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import CeoDashboard from '../components/ceo/Dashboard';
import SalesDashboard from '../components/sales/Dashboard';
import OpsDashboard from '../components/ops/Dashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const role = (session.user as any).role;

  if (role === 'ceo') return <CeoDashboard session={session} />;
  if (role === 'sales') return <SalesDashboard session={session} />;
  if (role === 'ops') return <OpsDashboard session={session} />;

  redirect('/login');
}
