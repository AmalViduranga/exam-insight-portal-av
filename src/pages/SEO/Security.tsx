import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, FileCheck, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, Card } from '../../components/ui';

export function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-16">
      <div className="container mx-auto px-4 max-w-5xl space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            Enterprise Grade Security
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Security & Data Protection Posture
          </h1>
          <p className="text-slate-600 text-lg">
            How Excel Insight Platform protects against spreadsheet malware, formula execution exploits, and guarantees complete tenant isolation.
          </p>
        </div>

        {/* Security Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1 */}
          <Card className="rounded-3xl border-slate-200/80 shadow-xs p-6 bg-white space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Formula & CSV Injection Neutralization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Spreadsheets exported by systems are often vulnerable to Dynamic Data Exchange (DDE) and formula injection attacks. Any cell starting with <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code>, <code>\t</code>, or <code>\r</code> is automatically sanitized by prefixing with a single quote (<code>'</code>), disarming malicious payloads.
            </p>
          </Card>

          {/* Pillar 2 */}
          <Card className="rounded-3xl border-slate-200/80 shadow-xs p-6 bg-white space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Magic Byte File Signature Scanning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              File extensions can easily be spoofed. Our backend validates file headers using cryptographic magic byte signatures (<code>50 4B 03 04</code> for XLSX, <code>D0 CF 11 E0</code> for XLS) and verifies CSV text buffers for forbidden null bytes before processing.
            </p>
          </Card>

          {/* Pillar 3 */}
          <Card className="rounded-3xl border-slate-200/80 shadow-xs p-6 bg-white space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">PostgreSQL Row Level Security (RLS)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every table in Supabase is protected by strict PostgreSQL RLS policies. Users can only query, update, or delete datasets tied to their own authenticated user ID. System administrators have audited, restricted oversight.
            </p>
          </Card>

          {/* Pillar 4 */}
          <Card className="rounded-3xl border-slate-200/80 shadow-xs p-6 bg-white space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Zero Retention for Public Users</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In public free mode, spreadsheet processing occurs strictly in client memory or temporary ephemeral worker memory. Files are never stored on persistent disks or databases, ensuring total confidentiality for ad-hoc users.
            </p>
          </Card>
        </div>

        {/* Security Checklist */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Security Architecture Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>TLS 1.3 Encryption in transit on all endpoints</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>AES-256 Encryption at rest via Supabase Storage</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tiered rate limiting against DDoS and brute force</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Security headers enforced via Helmet middleware</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link to="/analyze">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold h-12 px-8 shadow-md shadow-indigo-200">
              Analyze a Spreadsheet Securely <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
