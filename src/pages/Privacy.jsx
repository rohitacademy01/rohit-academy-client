import React from "react";

function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold mb-6">
        Privacy Policy
      </h1>

      <div className="space-y-4 text-gray-700 text-sm leading-relaxed">

        <p>
          At Rohit Academy, we respect your privacy and are committed to protecting your personal information.
        </p>

        {/* ================= DATA ================= */}
        <h2 className="font-semibold text-lg mt-4">1. Information We Collect</h2>
        <p>
          We may collect your name, phone number, email address, and payment details when you use our platform.
        </p>

        {/* ================= USE ================= */}
        <h2 className="font-semibold text-lg mt-4">2. How We Use Your Information</h2>
        <p>
          Your data is used to provide access to study materials, process payments, and improve our services.
        </p>

        {/* ================= PAYMENT ================= */}
        <h2 className="font-semibold text-lg mt-4">3. Payments</h2>
        <p>
          All payments are processed securely via Razorpay. We do not store your card or UPI details.
        </p>

        {/* ================= OTP ================= */}
        <h2 className="font-semibold text-lg mt-4">4. OTP Authentication</h2>
        <p>
          We use Firebase OTP for secure login. Your phone number is used only for authentication purposes.
        </p>

        {/* ================= DATA SECURITY ================= */}
        <h2 className="font-semibold text-lg mt-4">5. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your information.
        </p>

        {/* ================= SHARING ================= */}
        <h2 className="font-semibold text-lg mt-4">6. Data Sharing</h2>
        <p>
          We do not sell or share your personal data with third parties except for essential services like payments and authentication.
        </p>

        {/* ================= COOKIES ================= */}
        <h2 className="font-semibold text-lg mt-4">7. Cookies</h2>
        <p>
          We may use cookies to enhance your browsing experience.
        </p>

        {/* ================= RIGHTS ================= */}
        <h2 className="font-semibold text-lg mt-4">8. Your Rights</h2>
        <p>
          You can request to update or delete your data by contacting us.
        </p>

        {/* ================= CONTACT ================= */}
        <h2 className="font-semibold text-lg mt-4">9. Contact Us</h2>
        <p>
          For any privacy-related queries, contact us at:
        </p>

        <p className="font-medium text-blue-600">
          help.rohitacademy@gmail.com
        </p>

        {/* ================= UPDATE ================= */}
        <h2 className="font-semibold text-lg mt-4">10. Updates</h2>
        <p>
          We may update this policy from time to time.
        </p>

      </div>

    </div>
  );
}

export default Privacy;