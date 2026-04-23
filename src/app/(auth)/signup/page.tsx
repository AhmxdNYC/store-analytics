import { SignupForm } from "@/components/forms/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create account</h1>
        <SignupForm />
      </div>
    </main>
  );
}
