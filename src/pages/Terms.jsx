import React from "react";

function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold mb-6">
        Terms & Conditions
      </h1>

      <div className="space-y-4 text-gray-700 text-sm leading-relaxed">

        <p>
          Welcome to Rohit Academy. By using our platform, you agree to the following terms.
        </p>

        <h2 className="font-semibold text-lg mt-4">1. Usage</h2>
        <p>
          You agree to use this platform only for educational purposes.
        </p>

        <h2 className="font-semibold text-lg mt-4">2. Payments</h2>
        <p>
          All purchases are final. No refunds will be provided once the material is accessed.
        </p>

        <h2 className="font-semibold text-lg mt-4">3. Access</h2>
        <p>
          Purchased materials are accessible only to your account.
        </p>

        <h2 className="font-semibold text-lg mt-4">4. Misuse</h2>
        <p>
          Sharing or distributing content is strictly prohibited.
        </p>

        <h2 className="font-semibold text-lg mt-4">5. Changes</h2>
        <p>
          We may update these terms at any time without notice.
        </p>

      </div>

    </div>
  );
}

export default Terms;