import { isAdminAuthenticated, isUsingDemoFallbackPassword, getAdminPassword } from "@/lib/auth/admin-session";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { DEMO_MANDIS } from "@/lib/data/mandis";
import { DEMO_VILLAGES } from "@/lib/data/villages";
import { getDemoDistances } from "@/lib/data/distances";
import { getDemoPrices } from "@/lib/data/prices";
import { getDemoCharges } from "@/lib/data/charges";
import { DEMO_TRANSPORT_RATES } from "@/lib/data/transport-rates";
import { DEMO_FEEDBACK } from "@/lib/data/feedback";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <AdminLoginForm demoPassword={isUsingDemoFallbackPassword() ? getAdminPassword() : undefined} />
    );
  }

  return (
    <AdminDashboard
      mandis={DEMO_MANDIS}
      villages={DEMO_VILLAGES}
      distances={getDemoDistances()}
      prices={getDemoPrices()}
      charges={getDemoCharges()}
      transportRates={DEMO_TRANSPORT_RATES}
      feedback={DEMO_FEEDBACK}
    />
  );
}
