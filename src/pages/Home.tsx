import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import {
  FileSpreadsheet,
  Search,
  BarChart3,
  ListOrdered,
  Lock,
  ShieldCheck,
  Settings2,
  ChevronRight,
  Download,
  CheckCircle2,
  Mail
} from 'lucide-react';

export function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-16 pb-24 lg:pt-28 lg:pb-32">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-200/50 blur-[100px] mix-blend-multiply"></div>
          <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-200/50 blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-indigo-600 mb-6 text-sm font-semibold tracking-wide border border-indigo-100 shadow-sm">
                <ShieldCheck className="w-4 h-4" /> Secure Exam Analytics
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.15]">
                Exam Insight Portal <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                  Secure & Accurate
                </span>
                <br /> Result Analysis
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A web-based platform for uploading Excel result sheets, filtering results by school and subject, calculating grade statistics, generating pass-rate rankings, and exporting professional reports.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full text-base h-12 px-8 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white">
                    Login to Portal <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full text-base h-12 px-8 bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
                    View Features
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Mockup */}
            <div className="flex-1 w-full max-w-md lg:max-w-none relative hidden md:block">
              <div className="relative rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden p-6 gap-4 flex flex-col transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 pointer-events-none"></div>
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <div className="h-6 w-32 bg-slate-100 rounded-md ml-4"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Schools Detected</span>
                    <span className="text-2xl font-bold text-slate-800">142</span>
                  </div>
                  <div className="bg-indigo-500 p-4 rounded-xl border border-indigo-600 shadow-sm flex flex-col gap-2 text-white">
                    <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Overall Pass Rate</span>
                    <span className="text-2xl font-bold">78.4%</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2 col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">Top Performing Subject</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Rank #1</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[85%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Powerful Analytics Features</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Everything needed to transform raw exam data into accurate, export-ready result insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Excel Result Upload', icon: FileSpreadsheet, desc: 'Process massive raw Excel sheets directly with our structured parsing engine.', color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'School-wise Filtering', icon: Search, desc: 'Instantly isolate and analyze performance metrics for any specific school.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { title: 'Subject-wise Analysis', icon: BarChart3, desc: 'Detailed grade distributions and pass/fail statistics per subject.', color: 'text-violet-600', bg: 'bg-violet-50' },
              { title: 'Pass Percentage Calculation', icon: BarChart3, desc: 'Automated, precise calculation of pass rates based on standardized formulas.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Highest to Lowest Ranking', icon: ListOrdered, desc: 'Generate ranked lists of schools based on their passing percentages.', color: 'text-amber-600', bg: 'bg-amber-50' },
              { title: 'Excel/CSV Export', icon: Download, desc: 'Export formatted reports ready for presentation or archival.', color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map((feature, i) => (
              <div key={i} className="group bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              A simple process from raw Excel sheets to finalized performance reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {[
              { step: 1, title: 'Authorized Access', desc: 'Admin creates authorized users who log into the secure system.' },
              { step: 2, title: 'Upload Data', desc: 'User uploads the raw Excel result sheet directly to the platform.' },
              { step: 3, title: 'Filter & Select', desc: 'User selects specific schools and subjects for targeted analysis.' },
              { step: 4, title: 'System Calculation', desc: 'The system instantly calculates accurate grades and pass-rate statistics.' },
              { step: 5, title: 'Review Insights', desc: 'User views dynamic charts, summaries, and school rankings.' },
              { step: 6, title: 'Export Reports', desc: 'User exports finalized, professional reports for distribution.' },
            ].map((s) => (
              <div key={s.step} className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col relative z-10 hover:border-indigo-300 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Accuracy Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        {/* Background decorative lighting */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 mb-6 border border-indigo-400/20">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-white">Security & Accuracy Guarantees</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Access to this platform is strictly restricted to authorized personnel. Data is processed securely, and results are calculated using robust, standardized algorithms to ensure complete reliability.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authenticated transfers
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                  <Settings2 className="w-4 h-4 text-blue-400" /> Role-based control
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-slate-700/50 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none"></div>
              <h3 className="text-xl font-bold mb-8 text-white flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                Platform Features
              </h3>
              <ul className="space-y-5">
                {[
                  'Password-protected secure login',
                  'Strict role-based access control',
                  'Server-side processing for complex datasets',
                  'Structured Excel parsing engine',
                  'Formula-based accurate calculations',
                  'Multi-format report export support'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-200">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Need an Account Section */}
      <section id="request-access" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 md:p-16 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-indigo-600 mb-6 shadow-sm border border-slate-100">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Need an account?</h2>
              <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
                Access to Exam Insight Portal is restricted. If you need an account, please contact the administrator using one of the methods below.
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-3xl mx-auto">
                <a
                  href="https://wa.me/94763369755"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:flex-1 inline-flex items-center justify-center px-6 py-4 rounded-xl bg-[#25D366] hover:bg-[#1fbd59] text-white font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp: 076 336 9755
                </a>

                <a
                  href="mailto:amalvidu20@gmail.com?subject=Account%20Request%20for%20Exam%20Insight%20Portal"
                  className="w-full md:flex-1 inline-flex items-center justify-center px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 gap-2"
                >
                  <Mail className="w-[22px] h-[22px]" />
                  amalvidu20@gmail.com
                </a>

                <a
                  href="https://www.linkedin.com/in/amal-viduranga-3a681b27b?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:flex-1 inline-flex items-center justify-center px-6 py-4 rounded-xl bg-[#0a66c2] hover:bg-[#08529e] text-white font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  Amal Viduranga
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
