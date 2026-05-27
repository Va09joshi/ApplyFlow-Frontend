import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-sm">Privacy Policy</h1>
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
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">1. Introduction</h2>
              <p>Welcome to ApplyFlow AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">2. Data We Collect</h2>
              <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
              <ul className="list-disc pl-6 mt-4 space-y-3 text-muted-foreground">
                <li><strong className="text-foreground">Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong className="text-foreground">Contact Data:</strong> includes email address and telephone numbers.</li>
                <li><strong className="text-foreground">Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                <li><strong className="text-foreground">Profile Data:</strong> includes your resume content, job preferences, and application history generated through our AI services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">3. How We Use Your Data</h2>
              <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
              <ul className="list-disc pl-6 mt-4 space-y-3 text-muted-foreground">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., generating tailored job applications).</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal obligation.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">4. Data Security</h2>
              <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold mb-4 text-foreground">5. Contact Us</h2>
              <p>If you have any questions about this privacy policy or our privacy practices, please contact us at <a href="mailto:privacy@applyflow.ai" className="text-primary font-bold hover:underline">privacy@applyflow.ai</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
