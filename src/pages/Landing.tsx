import React from 'react';
import { useToastContext } from '../contexts/ToastContext';

interface LandingProps {
  onNavigateToLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigateToLogin }) => {
  const toast = useToastContext();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-sans bg-[#F6F9FC] text-[#4A4A4A]">
      {/* TopNavBar */}
      <header className="sticky top-0 z-50 bg-[#F6F9FC]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 py-4">
            <div className="flex items-center gap-4">
              <div className="size-6 text-[#0A2540]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-[#0A2540] text-xl font-bold leading-tight tracking-[-0.015em]">mwrd</h2>
            </div>
            <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
              <button onClick={() => document.getElementById('value-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#0A2540]">For Clients</button>
              <button onClick={() => document.getElementById('value-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#0A2540]">For Suppliers</button>
              <button onClick={() => toast.info('Pricing page coming soon!')} className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#0A2540]">Pricing</button>
              <button onClick={() => document.getElementById('social-proof')?.scrollIntoView({ behavior: 'smooth' })} className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#0A2540]">About</button>
            </nav>
            <div className="flex gap-2">
              <button 
                onClick={onNavigateToLogin}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 text-[#4A4A4A] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 transition-colors"
              >
                <span className="truncate">Login</span>
              </button>
              <button 
                onClick={onNavigateToLogin}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0A2540] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#0A2540]/90 transition-colors"
              >
                <span className="truncate">Request a Demo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        {/* HeroSection */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-8 text-center lg:text-left">
                <div className="flex flex-col gap-4">
                  <h1 className="text-[#0A2540] text-4xl font-black leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                    The Smarter B2B Marketplace, Managed for You
                  </h1>
                  <p className="text-[#6b7280] text-lg font-normal leading-normal md:text-xl">
                    Connecting trusted suppliers with high-value clients under one seamless platform.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={onNavigateToLogin}
                    className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#0A2540] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0A2540]/90 transition-colors"
                  >
                    <span className="truncate">I'm a Client</span>
                  </button>
                  <button 
                    onClick={onNavigateToLogin}
                    className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gray-200 text-[#4A4A4A] text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 transition-colors"
                  >
                    <span className="truncate">I'm a Supplier</span>
                  </button>
                </div>
              </div>
              <div 
                className="w-full bg-center bg-no-repeat aspect-square md:aspect-video lg:aspect-square bg-cover rounded-xl" 
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB-zjAFJBV1Bx_1I3HkSkalvXrI-beVvnJr7J8L_JG2iD_PAZ5sdu5XAodzu-6N56qYmWJohKy7Klh11QTew7zNlSBuYfSV8A5M6XVxZyE9LEHQaYDW5rMt2SGr1GmnTcM85qh6Mwk3K3g2ky7XQAMToRe4YbXtX0HtN-mpFK5maRo3VmpGNCLD2JNCzRvWGiUUfp8EJynGxWom-KOu-a5HU4IBeeuOUugn2TtuP8ghrHnkx_AmRlVVXdSR9f49z_2NRWPJLWTwE5XW")' }}
              ></div>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section id="value-section" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-12">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex justify-center gap-8">
                  <button className="flex flex-col items-center justify-center border-b-[3px] border-b-[#0A2540] text-[#0A2540] pb-[13px] pt-4">
                    <p className="text-base font-bold leading-normal tracking-[0.015em]">For Clients</p>
                  </button>
                  <button onClick={onNavigateToLogin} className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#6b7280] pb-[13px] pt-4 hover:text-[#0A2540] transition-colors">
                    <p className="text-base font-bold leading-normal tracking-[0.015em]">For Suppliers</p>
                  </button>
                </div>
              </div>
              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-1 gap-4 rounded-xl border border-gray-200 bg-transparent p-6 flex-col">
                  <span className="material-symbols-outlined text-[#00C49A] text-3xl">verified_user</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#0A2540] text-lg font-bold leading-tight">Access Vetted Suppliers</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">Connect with a curated network of trusted professionals and service providers, ensuring quality and reliability.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-4 rounded-xl border border-gray-200 bg-transparent p-6 flex-col">
                  <span className="material-symbols-outlined text-[#00C49A] text-3xl">shopping_cart_checkout</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#0A2540] text-lg font-bold leading-tight">Streamline Procurement</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">Simplify your purchasing process with our intuitive tools, from request to payment, all in one place.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-4 rounded-xl border border-gray-200 bg-transparent p-6 flex-col">
                  <span className="material-symbols-outlined text-[#00C49A] text-3xl">dashboard</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#0A2540] text-lg font-bold leading-tight">Manage Projects Centrally</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">Oversee all your projects, communications, and milestones from a single, powerful dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* "How It Works" Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center gap-12">
              <div className="flex flex-col gap-3 max-w-2xl">
                <h2 className="text-[#0A2540] text-3xl md:text-4xl font-bold leading-tight tracking-tight">How It Works</h2>
                <p className="text-[#6b7280] text-base md:text-lg">A simple, transparent process to connect and get work done.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-14 rounded-full bg-[#00C49A]/20 text-[#00C49A] font-bold text-xl">1</div>
                  <h3 className="text-[#0A2540] text-xl font-bold">Post or Find Opportunity</h3>
                  <p className="text-[#6b7280] text-sm">Clients post project requirements. Suppliers browse and find opportunities that match their expertise.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-14 rounded-full bg-[#00C49A]/20 text-[#00C49A] font-bold text-xl">2</div>
                  <h3 className="text-[#0A2540] text-xl font-bold">Connect & Collaborate</h3>
                  <p className="text-[#6b7280] text-sm">Use our platform to communicate, negotiate terms, and manage project milestones seamlessly.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-14 rounded-full bg-[#00C49A]/20 text-[#00C49A] font-bold text-xl">3</div>
                  <h3 className="text-[#0A2540] text-xl font-bold">Complete & Get Paid</h3>
                  <p className="text-[#6b7280] text-sm">Once the work is complete and approved, payments are processed securely and swiftly through the platform.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section id="social-proof" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center gap-12">
              <div className="flex flex-col gap-3 max-w-2xl">
                <h2 className="text-[#0A2540] text-3xl md:text-4xl font-bold leading-tight tracking-tight">Trusted by Industry Leaders</h2>
                <p className="text-[#6b7280] text-base md:text-lg">Hear what our partners have to say about their experience with mwrd.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                <div className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6 text-left">
                  <p className="text-[#4A4A4A]">"mwrd revolutionized our procurement process. We found a high-quality supplier in days, not weeks. The platform is intuitive and saved us countless hours."</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img className="size-12 rounded-full object-cover" alt="Sarah Johnson" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEAGP7QoFBpgn2O3wcrcr5shyUyWE4FMqJWybK5LzUsc72_I3D18sLE4m-QMFYP5Hjp177x32MWD4U76mGDyD0CI3T77uxLUOB8_HUjr7Yt__dT8OvlXlmBtaV68Ui9vOYNtUYSVDNUr4nmFnk8bFZfrtGo-_YXN07ac5ofOFzuBDDIvzoRCWJB-SVxBXpvBwZUQjZqLpbiwCA9OXwqPpzbm-ECTkJyvsur8l6oxcRNOBQ73TBI9wo_Jhk7Xgo0B5wdkf5eHP14BA2" />
                    <div>
                      <p className="font-bold text-[#0A2540]">Sarah Johnson</p>
                      <p className="text-sm text-[#6b7280]">Operations Manager, Innovate Inc.</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6 text-left">
                  <p className="text-[#4A4A4A]">"As a supplier, finding quality leads used to be our biggest challenge. With mwrd, we get access to serious clients and can focus on what we do best."</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img className="size-12 rounded-full object-cover" alt="Michael Chen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6Gec7OLjRZtwki9stWCzz687QFbx65I5TxAodXB5Wi_1fxnQGu9XQv8fV9Pia0GkQZkSmFw__V4b9LsmAoLLEiFUTezVa01nMiwEc9NWtwl7dCD6bUTptUWfvnqoOcjqMzmLCSZgT5GRnqbPsBlamrhIr2AcBoTpwXDwJTQIQwbxTC7lZYqSr3Z981v7LL2bawN64vs2eoN6pTbH2IeRdFcAf_vAn4qNuVqOv8cpNjDqd6OKCGDyJPSs-c16V9ulLCx0OiR0EU1u2" />
                    <div>
                      <p className="font-bold text-[#0A2540]">Michael Chen</p>
                      <p className="text-sm text-[#6b7280]">CEO, Precision Solutions</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6 text-left">
                  <p className="text-[#4A4A4A]">"The centralized project management and secure payment system gives us peace of mind. It’s the most professional B2B platform we’ve used."</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img className="size-12 rounded-full object-cover" alt="Emily Rodriguez" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZs0gD6uqKfrik6RH8p5NhUrEKmF2eKdhbI35IAxSeTkIbJfLXmWki0Tq65PwxQPvBFyGXUAXFq0lJ31ptvf89Vqk4ueNa4vU7sSp3ZVNcY_efvP9RvpCHrQbXRKO4igcK6gaIpT2NEV3e8HP4ea5Q7-uO874YG2NXQxlvfHCkD7aNLYHgFUfuUXEy3cBYqVkEgUOvodaXibQYUkIz6U8Q7IrHF90VapsD3QY-4KGpH2GjrNhm_o_Njckf2B07RfnqDhq6Lys4YeKP" />
                    <div>
                      <p className="font-bold text-[#0A2540]">Emily Rodriguez</p>
                      <p className="text-sm text-[#6b7280]">Marketing Director, BuildFast Corp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0A2540] text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-6 text-white">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path></svg>
                  </div>
                  <h2 className="text-white text-xl font-bold">mwrd</h2>
                </div>
                <p className="text-sm text-gray-300">The premier managed marketplace for B2B connections.</p>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-white">Platform</h4>
                <button onClick={onNavigateToLogin} className="text-sm text-gray-300 hover:text-white text-left">For Clients</button>
                <button onClick={onNavigateToLogin} className="text-sm text-gray-300 hover:text-white text-left">For Suppliers</button>
                <button onClick={() => toast.info('Pricing page coming soon!')} className="text-sm text-gray-300 hover:text-white text-left">Pricing</button>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-white">Company</h4>
                <button onClick={() => toast.info('About Us page coming soon!')} className="text-sm text-gray-300 hover:text-white text-left">About Us</button>
                <button onClick={() => toast.info('Careers page coming soon!')} className="text-sm text-gray-300 hover:text-white text-left">Careers</button>
                <button onClick={() => toast.info('Contact page coming soon!')} className="text-sm text-gray-300 hover:text-white text-left">Contact</button>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-white">Legal</h4>
                <button onClick={() => toast.info('Privacy Policy page coming soon!')} className="text-sm text-gray-300 hover:text-white text-left">Privacy Policy</button>
                <button onClick={() => toast.info('Terms of Service page coming soon!')} className="text-sm text-gray-300 hover:text-white text-left">Terms of Service</button>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-100/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
              <p>© 2024 mwrd. All rights reserved.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <button onClick={() => toast.info('Follow us on LinkedIn!')} className="hover:text-white">LinkedIn</button>
                <button onClick={() => toast.info('Follow us on Twitter!')} className="hover:text-white">Twitter</button>
                <button onClick={() => toast.info('Follow us on Facebook!')} className="hover:text-white">Facebook</button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};