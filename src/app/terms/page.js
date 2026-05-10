import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid rgba(201,149,108,0.15)' }}>
        <p style={{ color: 'var(--rose-gold)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Legal</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '8px' }}>Terms and Conditions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Effective Date: <strong>12 May 2026</strong> &nbsp;·&nbsp; BookFlix</p>
      </div>

      <div className="terms-body">

        <Section number="1" title="Acceptance of Terms">
          <p>By accessing or using the BookFlix platform ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use the Service. Your continued use of BookFlix constitutes your acceptance of any updates to these Terms.</p>
        </Section>

        <Section number="2" title="About BookFlix">
          <p>BookFlix is a personal book rental platform that allows users to browse, reserve, and rent physical books for a defined period. BookFlix is independently operated and is <strong>not</strong> affiliated with, endorsed by, or associated with Netflix, Inc. or any other streaming or media service.</p>
        </Section>

        <Section number="3" title="Eligibility">
          <p>To use BookFlix, you must:</p>
          <ul>
            <li>Be at least 13 years of age, or have parental/guardian consent if younger</li>
            <li>Provide accurate and complete information during registration</li>
            <li>Have a valid contact method (email or phone) for communication</li>
          </ul>
          <p>BookFlix reserves the right to suspend or terminate accounts that provide false information.</p>
        </Section>

        <Section number="4" title="User Accounts">
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to:</p>
          <ul>
            <li>Not share your account with others</li>
            <li>Notify BookFlix immediately of any unauthorised access</li>
            <li>Take responsibility for all activity that occurs under your account</li>
          </ul>
          <p>BookFlix is not liable for any loss arising from unauthorised use of your account.</p>
        </Section>

        <Section number="5" title="Rental Policy">
          <SubSection title="5.1 Rental Period">
            <p>The standard rental period is <strong>1 (one) week</strong> from the date of pickup or delivery confirmation. A <strong>2 (two) week</strong> rental option is also available. The applicable rental period will be confirmed at the time of booking.</p>
          </SubSection>
          <SubSection title="5.2 Rental Fees">
            <p>Rental fees are as follows:</p>
            <ul>
              <li>1-week rental: <strong>₹35 per book</strong></li>
              <li>2-week rental: <strong>₹70 per book</strong></li>
            </ul>
            <p>A full 2-week advance payment is required at the time of booking, regardless of the rental period selected. This advance is non-refundable once the book has been dispatched or collected.</p>
          </SubSection>
          <SubSection title="5.3 Extensions">
            <p>Extension requests must be submitted before the rental period expires. Extensions are subject to availability and will be charged at the standard weekly rate of <strong>₹35 per additional week</strong>.</p>
          </SubSection>
          <SubSection title="5.4 Returns">
            <p>Books must be returned by the agreed return date. Failure to return a book on time will result in:</p>
            <ul>
              <li>A late fee of <strong>₹35 per additional week</strong> (or part thereof) beyond the due date</li>
              <li>Suspension of your account until outstanding dues are cleared</li>
              <li>Legal action in the event of non-return beyond 30 days</li>
            </ul>
          </SubSection>
        </Section>

        <Section number="6" title="Book Condition">
          <p>Books must be returned in the same condition as received, allowing for reasonable wear. The following constitute damage:</p>
          <ul>
            <li>Torn, missing, or defaced pages</li>
            <li>Stains, water damage, or markings</li>
            <li>Broken spine or damaged cover</li>
          </ul>
          <p>If a book is returned damaged or not returned at all, you will be charged a flat <strong>damage/replacement fee of ₹600 per book</strong>, in addition to any applicable late fees. BookFlix will assess damage at the time of return, and its determination is final.</p>
        </Section>

        <Section number="7" title="Payments and Fees">
          <p>All rental fees, late fees, and replacement charges are communicated at the time of booking or upon occurrence. BookFlix accepts payment through the methods listed on the platform. All payments are non-refundable unless stated otherwise.</p>
          <p>BookFlix reserves the right to update its pricing at any time. Changes will be communicated with reasonable notice.</p>
        </Section>

        <Section number="8" title="Prohibited Conduct">
          <p>Users must not:</p>
          <ul>
            <li>Resell, lend, or reproduce rented books</li>
            <li>Use the platform for any unlawful purpose</li>
            <li>Attempt to access another user's account</li>
            <li>Interfere with the platform's functionality or security</li>
            <li>Submit false reviews, ratings, or information</li>
          </ul>
          <p>Violation of these prohibitions may result in immediate account termination and legal action where applicable.</p>
        </Section>

        <Section number="9" title="Availability and Service Interruptions">
          <p>BookFlix operates on a best-effort basis. We do not guarantee uninterrupted access to the platform or availability of any specific book. BookFlix is not liable for service outages, technical issues, or unavailability of titles.</p>
        </Section>

        <Section number="10" title="Limitation of Liability">
          <p>To the maximum extent permitted by applicable law, BookFlix and its operators shall not be liable for:</p>
          <ul>
            <li>Indirect, incidental, or consequential damages</li>
            <li>Loss of data or profits arising from use of the Service</li>
            <li>Damage caused by books rented through the platform</li>
            <li>Delays, errors, or omissions in fulfilling rental requests</li>
          </ul>
          <p>BookFlix's total liability to any user for any claim shall not exceed the amount paid by that user in the 30 days preceding the claim.</p>
        </Section>

        <Section number="11" title="Privacy">
          <p>By using BookFlix, you consent to the collection and use of your personal information as necessary to operate the Service. This includes your name, contact details, and rental history. BookFlix does not sell your personal data to third parties.</p>
          <p>Your data is processed securely and used solely for providing and improving the Service. You may request deletion of your account and associated data by contacting us through the platform.</p>
        </Section>

        <Section number="12" title="Piracy and Intellectual Property">
          <SubSection title="12.1 Prohibited Activities">
            <p>Users must not:</p>
            <ul>
              <li>Reproduce, scan, photocopy, or digitise any rented book in whole or in part without authorisation from the rights holder</li>
              <li>Upload, distribute, or share digital copies of rented books on any platform or network</li>
              <li>Use rented books to create derivative works for commercial gain without explicit rights holder permission</li>
              <li>Remove, alter, or circumvent any copyright notices or ownership markings present in rented books</li>
            </ul>
          </SubSection>
          <SubSection title="12.2 Consequences of Infringement">
            <p>Any user found to be engaging in piracy or copyright infringement will face:</p>
            <ul>
              <li>Immediate and permanent account termination without refund</li>
              <li>Recovery of any damages or losses incurred by BookFlix or rights holders</li>
              <li>Reporting to relevant authorities and full cooperation with legal proceedings under the Copyright Act, 1957 (India)</li>
            </ul>
          </SubSection>
        </Section>

        <Section number="13" title="Modifications to Terms">
          <p>BookFlix reserves the right to update these Terms at any time. Users will be notified of material changes via the platform or registered contact method. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
        </Section>

        <Section number="14" title="Termination">
          <p>BookFlix may suspend or terminate your access at any time, with or without notice, for conduct that violates these Terms or is otherwise harmful to the platform, its users, or third parties. Upon termination, any outstanding dues remain payable.</p>
        </Section>

        <Section number="15" title="Governing Law">
          <p>These Terms are governed by the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of <strong>Kerala, India</strong>.</p>
        </Section>

        <Section number="16" title="Contact">
          <p>For questions or concerns regarding these Terms, please contact us through the BookFlix platform or via the registered contact information provided during sign-up.</p>
        </Section>

        {/* Footer acknowledgement */}
        <div style={{
          marginTop: '48px',
          padding: '20px 24px',
          background: 'rgba(201,149,108,0.06)',
          border: '1px solid rgba(201,149,108,0.15)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          By using BookFlix, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/signup" className="btn btn-primary" style={{ marginRight: '12px' }}>Create Account</Link>
          <Link href="/login" className="btn btn-secondary">Sign In</Link>
        </div>
      </div>

      <style>{`
        .terms-body p {
          color: var(--text-muted);
          line-height: 1.75;
          margin-bottom: 12px;
        }
        .terms-body ul {
          margin: 8px 0 16px 0;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .terms-body li {
          color: var(--text-muted);
          line-height: 1.6;
        }
        .terms-body strong {
          color: var(--gray-50);
        }
      `}</style>
    </div>
  )
}

function Section({ number, title, children }) {
  return (
    <div style={{ marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid rgba(201,149,108,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--rose-gold)',
          background: 'rgba(201,149,108,0.1)',
          border: '1px solid rgba(201,149,108,0.2)',
          borderRadius: '100px',
          padding: '2px 10px',
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}>{number}</span>
        <h2 style={{ fontSize: '1.15rem', color: 'var(--gray-50)', fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>
      <div style={{ paddingLeft: '4px' }}>{children}</div>
    </div>
  )
}

function SubSection({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '0.95rem', color: 'var(--gray-200)', fontWeight: 600, marginBottom: '10px' }}>{title}</h3>
      {children}
    </div>
  )
}
