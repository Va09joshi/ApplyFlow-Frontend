import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      {/* Background Gradients (Stars/Glowing Orbs) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[50%] rounded-full bg-primary/10 blur-[120px] opacity-70 mix-blend-screen" />
        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] opacity-70 mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover opacity-10 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 pt-32 pb-40 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-all mb-8 bg-muted/50 hover:bg-muted px-5 py-2.5 rounded-full backdrop-blur-md border border-border/40 hover:shadow-md">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-sm">Terms of Service</h1>
          <p className="text-primary font-bold tracking-widest uppercase text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        {/* Bottom Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 translate-y-px">
          <svg className="relative block w-full h-[60px] md:h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" className="text-card" d="M0,192L48,208C96,224,192,256,288,256C384,256,480,224,576,202.7C672,181,768,171,864,181.3C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="relative z-10 bg-card flex-grow pb-32">
        <div className="container mx-auto px-4 max-w-4xl -mt-16">
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-muted-foreground p-8 md:p-14 rounded-[2.5rem] bg-background/80 border border-border/50 shadow-2xl backdrop-blur-2xl">
            <section>
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">1. Acceptance of Terms</h2>
              <p>By accessing and using ApplyFlow AI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">2. Description of Service</h2>
              <p>ApplyFlow AI provides users with access to an automated, AI-driven job application and resume tailoring suite. You understand and agree that the Service may include certain communications from ApplyFlow AI, such as service announcements and administrative messages, and that these communications are considered part of ApplyFlow AI membership.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">3. User Conduct</h2>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 mt-4 space-y-3 text-muted-foreground">
                <li><strong className="text-foreground">Unlawful use:</strong> Upload, post, email, transmit or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, or otherwise objectionable.</li>
                <li><strong className="text-foreground">Impersonation:</strong> Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                <li><strong className="text-foreground">Forgery:</strong> Forge headers or otherwise manipulate identifiers in order to disguise the origin of any content transmitted through the Service.</li>
                <li><strong className="text-foreground">Bypassing security:</strong> Attempt to override or circumvent any security components or usage rules embedded into the Service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">4. Intellectual Property</h2>
              <p>All content included on this site, such as text, graphics, logos, button icons, images, and software, is the property of ApplyFlow AI or its content suppliers and protected by international copyright laws. The compilation of all content on this site is the exclusive property of ApplyFlow AI.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">5. Disclaimer of Warranties</h2>
              <p>Your use of the service is at your sole risk. The service is provided on an "as is" and "as available" basis. ApplyFlow AI expressly disclaims all warranties of any kind, whether express or implied, including, but not limited to the implied warranties of merchantability, fitness for a particular purpose and non-infringement.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
