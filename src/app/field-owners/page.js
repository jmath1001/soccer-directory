'use client'; // or omit this if using Pages Router

import Link from 'next/link';

export default function FieldOwnerPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      <h1 className="text-3xl font-bold text-center">Are You a Field Owner?</h1>

      <section className="bg-white border p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">See your field listed?</h2>
        <p className="mb-4">
          If your field is already listed on our platform, go to the field's page and click
          <span className="font-semibold"> "Claim Field"</span>.
        </p>
        <p className="mb-4 text-sm text-gray-600">
          Claiming your field gives you control over your listing. You'll be able to:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
          <li>Add your phone number and website</li>
          <li>Set your pricing and availability</li>
          <li>Upload more images</li>
          <li>Get your field prioritized in search results</li>
        </ul>
        <p className="text-sm text-gray-500">
          After submitting your claim, our team will verify and give you edit access.
        </p>
      </section>

      <section className="bg-white border p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Don’t see your field?</h2>
        <p className="mb-4">
          If your field isn’t listed yet, you can submit it for review. We’ll contact you after approval.
        </p>
        <Link href="/submit-field">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Submit a New Field
          </button>
        </Link>
      </section>
    </main>
  );
}
