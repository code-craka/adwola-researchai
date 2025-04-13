import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { SparklesCore } from "@/components/sparkles"

export const metadata = {
  title: "Privacy Policy | Adwola Research AI",
  description: "Privacy Policy for Adwola Research AI - Learn how we collect, use, and protect your data.",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      {/* Ambient background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto bg-black/50 border border-white/10 backdrop-blur-sm rounded-lg p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Privacy Policy</h1>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300">Last Updated: April 13, 2025</p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Introduction</h2>
              <p className="text-gray-300">
                Welcome to Adwola Research AI ("we," "our," or "us"). We are committed to protecting your privacy and
                the security of your personal information. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our website and services (collectively, the "Service").
              </p>
              <p className="text-gray-300">
                Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you
                have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with our
                policies and practices, please do not use our Service.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-300">We may collect the following types of personal information:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>
                  <strong>Account Information:</strong> When you register for an account, we collect your name, email
                  address, and password.
                </li>
                <li>
                  <strong>Profile Information:</strong> Information you provide in your user profile, such as your
                  profile picture, job title, and organization.
                </li>
                <li>
                  <strong>Payment Information:</strong> If you subscribe to our paid services, we collect payment
                  details, billing address, and transaction history. Note that payment card information is processed by
                  our payment processor, Stripe, and we do not store complete payment card details on our servers.
                </li>
                <li>
                  <strong>Communication Data:</strong> Information you provide when contacting us, such as email
                  correspondence or chat messages.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Research Content</h3>
              <p className="text-gray-300">
                We collect and process the research papers and documents you upload to our Service to provide our core
                functionality. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>The content of research papers and documents</li>
                <li>Metadata associated with these documents</li>
                <li>Generated outputs based on your research content</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Usage Information</h3>
              <p className="text-gray-300">
                We automatically collect certain information about your device and how you interact with our Service:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>
                  <strong>Device Information:</strong> IP address, browser type, operating system, device type, and
                  unique device identifiers.
                </li>
                <li>
                  <strong>Usage Data:</strong> Pages visited, features used, time spent on the Service, and other
                  interaction data.
                </li>
                <li>
                  <strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to
                  collect information about your browsing activities. For more information, please see our Cookie
                  Policy.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-300">We use the information we collect for the following purposes:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>
                  <strong>Provide and Improve the Service:</strong> To operate, maintain, and enhance our Service,
                  including developing new features and functionality.
                </li>
                <li>
                  <strong>Process Research Content:</strong> To analyze, transform, and generate outputs from your
                  research papers using our AI technology.
                </li>
                <li>
                  <strong>Account Management:</strong> To create and manage your account, authenticate users, and
                  provide customer support.
                </li>
                <li>
                  <strong>Process Transactions:</strong> To process payments, subscriptions, and billing.
                </li>
                <li>
                  <strong>Communication:</strong> To respond to your inquiries, provide updates about your account, and
                  send service-related notifications.
                </li>
                <li>
                  <strong>Marketing:</strong> With your consent, to send promotional emails about new features, offers,
                  or other information we think you may find interesting.
                </li>
                <li>
                  <strong>Analytics:</strong> To analyze usage patterns, troubleshoot issues, and improve our Service.
                </li>
                <li>
                  <strong>Security:</strong> To detect, prevent, and address technical issues, fraud, or other illegal
                  activities.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or
                  enforceable governmental requests.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-gray-300">
                We may share your information with the following categories of recipients:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>
                  <strong>Service Providers:</strong> Third-party vendors who perform services on our behalf, such as
                  cloud storage providers, payment processors, and analytics services.
                </li>
                <li>
                  <strong>Business Partners:</strong> With your consent, we may share your information with our business
                  partners to offer you certain products, services, or promotions.
                </li>
                <li>
                  <strong>Other Users:</strong> Information you choose to share with other users through our
                  collaboration features.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law, subpoena, or other legal process, or if we
                  have a good faith belief that disclosure is necessary to protect our rights, protect your safety or
                  the safety of others, investigate fraud, or respond to a government request.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, reorganization, or sale
                  of all or a portion of our assets, your information may be transferred as part of that transaction.
                </li>
              </ul>
              <p className="text-gray-300">We do not sell your personal information to third parties.</p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Data Security</h2>
              <p className="text-gray-300">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Encryption of sensitive data both in transit and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls to limit who can access your information</li>
                <li>Secure cloud infrastructure with industry-standard protections</li>
                <li>Regular backups to prevent data loss</li>
              </ul>
              <p className="text-gray-300">
                While we strive to use commercially acceptable means to protect your personal information, no method of
                transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee
                absolute security.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-300">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>
                  <strong>Access:</strong> You can request access to the personal information we hold about you.
                </li>
                <li>
                  <strong>Correction:</strong> You can request that we correct inaccurate or incomplete information.
                </li>
                <li>
                  <strong>Deletion:</strong> You can request that we delete your personal information in certain
                  circumstances.
                </li>
                <li>
                  <strong>Data Portability:</strong> You can request a copy of your personal information in a
                  structured, machine-readable format.
                </li>
                <li>
                  <strong>Objection:</strong> You can object to our processing of your personal information in certain
                  circumstances.
                </li>
                <li>
                  <strong>Restriction:</strong> You can request that we restrict the processing of your personal
                  information.
                </li>
                <li>
                  <strong>Withdrawal of Consent:</strong> You can withdraw your consent at any time where we rely on
                  consent to process your personal information.
                </li>
              </ul>
              <p className="text-gray-300">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section
                below. We will respond to your request within the timeframe required by applicable law.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Data Retention</h2>
              <p className="text-gray-300">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this
                Privacy Policy, unless a longer retention period is required or permitted by law. When determining the
                retention period, we consider:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>The amount, nature, and sensitivity of the personal information</li>
                <li>The potential risk of harm from unauthorized use or disclosure</li>
                <li>The purposes for which we process the information</li>
                <li>Whether we can achieve those purposes through other means</li>
                <li>Legal, regulatory, and contractual requirements</li>
              </ul>
              <p className="text-gray-300">
                When we no longer need your personal information, we will securely delete or anonymize it.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-300">
                Our Service is not intended for children under the age of 16. We do not knowingly collect personal
                information from children under 16. If you are a parent or guardian and believe that your child has
                provided us with personal information, please contact us, and we will take steps to delete such
                information.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-300">
                Your personal information may be transferred to, stored, and processed in countries other than the
                country in which you reside. These countries may have data protection laws that are different from the
                laws of your country.
              </p>
              <p className="text-gray-300">
                When we transfer your personal information internationally, we take appropriate safeguards to ensure
                that your information receives an adequate level of protection, including:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Using standard contractual clauses approved by relevant authorities</li>
                <li>Ensuring third-party service providers adhere to data protection principles</li>
                <li>Implementing technical and organizational measures to protect your information</li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-300">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other
                operational, legal, or regulatory reasons. We will notify you of any material changes by posting the
                updated Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p className="text-gray-300">
                We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting
                your information.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">11. Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices,
                please contact us at:
              </p>
              <p className="text-gray-300 mt-2">
                <strong>Email:</strong> privacy@adwolaresearch.ai
                <br />
                <strong>Address:</strong> Adwola Research AI, 123 Innovation Street, Tech City, TC 12345
                <br />
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
              <p className="text-gray-300 mt-4">
                We will respond to your inquiry as soon as possible and within the timeframe required by applicable law.
              </p>
            </div>

            <div className="mt-12 border-t border-white/10 pt-6">
              <p className="text-gray-400 text-sm">
                By using our Service, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  )
}
